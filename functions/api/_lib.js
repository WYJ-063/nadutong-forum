/* ============================================================
   哪都通 · 云端后端共享库（Cloudflare Pages Functions + D1）
   - 自动建表（幂等）
   - PBKDF2 密码哈希
   - HMAC 会话 token
   - 积分 / 等级
   ============================================================ */

const enc = new TextEncoder();
const dec = new TextDecoder();

/* ---------- 编码工具 ---------- */
function bufToHex(buf){
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function bufToBase64Url(buf){
  let s=btoa(String.fromCharCode(...new Uint8Array(buf)));
  return s.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function base64UrlToBuf(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');
  while(s.length%4)s+='=';
  return Uint8Array.from(atob(s),c=>c.charCodeAt(0));
}
function genId(prefix){
  return prefix+'-'+Date.now().toString(36)+'-'+crypto.randomUUID().slice(0,8);
}

/* ---------- HTTP 工具 ---------- */
function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{'Content-Type':'application/json;charset=utf-8',
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Headers':'Content-Type,Authorization',
      'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS'}
  });
}
function readBody(req){
  return req.json().catch(()=>({}));
}
function preflight(){
  return new Response(null,{headers:{
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type,Authorization',
    'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS'}});
}

/* ---------- 建表（幂等） ---------- */
const SCHEMA=[
`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  login TEXT UNIQUE,
  pass_hash TEXT,
  salt TEXT,
  name TEXT,
  avatar TEXT,
  role INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  created_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  board TEXT,
  title TEXT,
  content TEXT,
  author_id TEXT,
  author_name TEXT,
  pinned INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS replies (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  author_id TEXT,
  author_name TEXT,
  content TEXT,
  created_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS likes (
  user_id TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT,
  PRIMARY KEY (user_id, target_type, target_id)
)`,
`CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
)`,
`CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  actor_id TEXT,
  actor_name TEXT,
  target_type TEXT,
  target_id TEXT,
  post_id TEXT,
  post_title TEXT,
  excerpt TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT
)`,
`CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id,created_at)`,
`CREATE TABLE IF NOT EXISTS boards (
  name TEXT PRIMARY KEY,
  created_by TEXT,
  created_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  question TEXT,
  multi INTEGER DEFAULT 0,
  created_at TEXT
)`,
`CREATE TABLE IF NOT EXISTS poll_options (
  id TEXT PRIMARY KEY,
  poll_id TEXT,
  text TEXT,
  pos INTEGER
)`,
`CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id TEXT,
  option_id TEXT,
  user_id TEXT,
  created_at TEXT,
  PRIMARY KEY (poll_id,option_id,user_id)
)`,
`CREATE TABLE IF NOT EXISTS checkins (
  user_id TEXT PRIMARY KEY,
  last_date TEXT,
  streak INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0,
  updated_at TEXT
)`,
/* 浏览器 Web Push 订阅（RFC 8291）：endpoint 为主键，同一设备重复订阅幂等 */
`CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id TEXT,
  p256dh TEXT,
  auth TEXT,
  user_agent TEXT,
  created_at TEXT
)`,
`CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id)`,
/* 帖子编辑历史：每次编辑先把"被替换的版本"完整快照写入此表，再更新 posts。
   version 为该快照对应的版本号（初始发布=版本1），配合 posts 当前内容可还原任意历史版本。 */
`CREATE TABLE IF NOT EXISTS post_edits (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  version INTEGER,
  title TEXT,
  content TEXT,
  editor_id TEXT,
  editor_name TEXT,
  created_at TEXT
)`,
`CREATE INDEX IF NOT EXISTS idx_post_edits_post ON post_edits(post_id,version)`
];
/* 默认板块（首次运行写入） */
const DEFAULT_BOARDS=['公告','异人讨论','功法交流','天下见闻','求助','灌水'];
async function seedBoards(env){
  const {results}=await env.DB.prepare('SELECT name FROM boards').all();
  const have=new Set((results||[]).map(r=>r.name));
  for(const n of DEFAULT_BOARDS){
    if(!have.has(n))
      await env.DB.prepare('INSERT OR IGNORE INTO boards (name,created_by,created_at) VALUES (?,?,?)')
        .bind(n,'system',nowStr()).run();
  }
}
/* 增量迁移：给已存在的表补列（SQLite 不支持 IF NOT EXISTS 的 ADD COLUMN，
   重复执行时捕获 "duplicate column" 错误并忽略，保证幂等） */
const MIGRATIONS=[
  `ALTER TABLE users ADD COLUMN muted INTEGER DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0`,
  `ALTER TABLE replies ADD COLUMN parent_id TEXT`,
  `ALTER TABLE posts ADD COLUMN essence INTEGER DEFAULT 0`,
  `ALTER TABLE posts ADD COLUMN edited_at TEXT`,
  `ALTER TABLE posts ADD COLUMN edit_count INTEGER DEFAULT 0`
];
/* 全文搜索：posts_fts（FTS5 trigram 分词，对中文子串友好，需 SQLite 3.34+）。
   触发器自动同步增删改；首次对历史帖子回填。任何失败都静默降级（搜索接口回退 LIKE）。 */
async function setupFts(env){
  try{
    await env.DB.prepare(
      `CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts
         USING fts5(title,content,tokenize='trigram')`).run();
    await env.DB.prepare(
      `CREATE TRIGGER IF NOT EXISTS posts_fts_ai AFTER INSERT ON posts BEGIN
         INSERT INTO posts_fts(rowid,title,content) VALUES (new.rowid,new.title,new.content); END`).run();
    await env.DB.prepare(
      `CREATE TRIGGER IF NOT EXISTS posts_fts_ad AFTER DELETE ON posts BEGIN
         DELETE FROM posts_fts WHERE rowid=old.rowid; END`).run();
    await env.DB.prepare(
      `CREATE TRIGGER IF NOT EXISTS posts_fts_au AFTER UPDATE ON posts BEGIN
         DELETE FROM posts_fts WHERE rowid=old.rowid;
         INSERT INTO posts_fts(rowid,title,content) VALUES (new.rowid,new.title,new.content); END`).run();
    const cnt=await env.DB.prepare('SELECT COUNT(*) AS n FROM posts_fts').first();
    if(!(Number(cnt&&cnt.n)>0))
      await env.DB.prepare(
        'INSERT INTO posts_fts(rowid,title,content) SELECT rowid,title,content FROM posts').run();
    return true;
  }catch(e){ return false; }
}
let schemaPromise=null;
async function ensureSchema(env){
  if(schemaPromise)return schemaPromise;
  schemaPromise=(async()=>{
    for(const s of SCHEMA){await env.DB.prepare(s).run();}
    for(const m of MIGRATIONS){
      try{ await env.DB.prepare(m).run(); }
      catch(e){ if(!/duplicate column/i.test(String((e&&e.message)||e))) throw e; }
    }
    await seedBoards(env);
    await setupFts(env);
  })().catch(e=>{schemaPromise=null;throw e;});
  return schemaPromise;
}

/* ---------- 服务器密钥（首次运行生成并持久化） ---------- */
async function getSecret(env){
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT value FROM meta WHERE key=?').bind('secret').first();
  if(row&&row.value)return row.value;
  const secret=crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'');
  await env.DB.prepare('INSERT INTO meta (key,value) VALUES (?,?)').bind('secret',secret).run();
  return secret;
}

/* ---------- 密码哈希（PBKDF2 / SHA-256） ---------- */
async function hashPassword(password,salt){
  const key=await crypto.subtle.importKey('raw',enc.encode(String(password)),
    {name:'PBKDF2'},false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits(
    {name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},
    key,256);
  return bufToHex(bits);
}
async function verifyPassword(password,salt,hash){
  const h=await hashPassword(password,salt);
  if(h.length!==String(hash).length)return false;
  let diff=0;
  for(let i=0;i<h.length;i++)diff|=h.charCodeAt(i)^String(hash).charCodeAt(i);
  return diff===0;
}

/* ---------- 会话 token（HMAC） ---------- */
async function signToken(payload,secret){
  const key=await crypto.subtle.importKey('raw',enc.encode(secret),
    {name:'HMAC',hash:'SHA-256'},false,['sign']);
  const body=bufToBase64Url(enc.encode(JSON.stringify(payload)));
  const sig=bufToBase64Url(
    await crypto.subtle.sign({name:'HMAC',hash:'SHA-256'},key,enc.encode(body)));
  return body+'.'+sig;
}
async function verifyToken(token,secret){
  try{
    const parts=String(token).split('.');
    if(parts.length!==2)return null;
    const [body,sig]=parts;
    const key=await crypto.subtle.importKey('raw',enc.encode(secret),
      {name:'HMAC',hash:'SHA-256'},false,['sign']);
    const expect=bufToBase64Url(
      await crypto.subtle.sign({name:'HMAC',hash:'SHA-256'},key,enc.encode(body)));
    if(expect.length!==sig.length)return null;
    let diff=0;
    for(let i=0;i<expect.length;i++)diff|=expect.charCodeAt(i)^sig.charCodeAt(i);
    if(diff!==0)return null;
    const payload=JSON.parse(dec.decode(base64UrlToBuf(body)));
    if(payload.exp&&payload.exp<Date.now())return null;
    return payload;
  }catch(e){return null;}
}

/* ---------- 当前登录用户 ---------- */
async function getAuthUser(req,env){
  const h=req.headers.get('Authorization')||'';
  const token=h.replace(/^Bearer\s+/i,'').trim();
  if(!token)return null;
  const secret=await getSecret(env);
  const payload=await verifyToken(token,secret);
  if(!payload||!payload.uid)return null;
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(payload.uid).first();
  return row||null;
}

/* ---------- 积分 / 等级 ---------- */
const POINTS_RULE={post:5,reply:2,liked:1};
const SERVER_LEVELS=[
  ['初入江湖',0],['炁感初开',10],['见习异人',25],['小有所成',50],
  ['渐入佳境',100],['出类拔萃',180],['锋芒初露',300],['一方好手',480],
  ['功力渐深',720],['异人名宿',1050],['炉火纯青',1500],['名动一方',2100],
  ['功参造化',2900],['开宗立派',4000],['震古烁今',5500],['绝世高手',7500],
  ['一代宗师',10000],['陆地神仙',13500],['超凡入圣',18000],['炁道至尊',24000]
];
function levelOfPoints(points){
  let idx=0;
  for(let i=0;i<SERVER_LEVELS.length;i++){if(points>=SERVER_LEVELS[i][1])idx=i;}
  return {level:idx+1,name:SERVER_LEVELS[idx][0]};
}
async function addPoints(env,userId,amount){
  if(!amount)return;
  await env.DB.prepare('UPDATE users SET points=points+? WHERE id=?')
    .bind(amount,userId).run();
}
/* 调整积分但不低于 0（用于删帖/删评论时扣回基础积分） */
async function addPointsClamped(env,userId,delta){
  if(!delta)return;
  const row=await env.DB.prepare('SELECT points FROM users WHERE id=?').bind(userId).first();
  if(!row)return;
  const p=Math.max(0,(Number(row.points)||0)+delta);
  await env.DB.prepare('UPDATE users SET points=? WHERE id=?').bind(p,userId).run();
}
/* 云端管理员判定（与前端 role>=3 一致） */
function isAdmin(user){
  return Number(user&&user.role)>=3;
}
/* 公告分类名（仅管理员可在此分类下发帖） */
const ANNOUNCEMENT_BOARD='公告';
/* 发帖/回复前的封禁/禁言校验：返回错误信息字符串，正常则 null */
function moderationBlock(user){
  if(!user)return null;
  if(Number(user.banned))return '该账号已被拉黑，无法进行该操作';
  if(Number(user.muted))return '该账号已被禁言，暂不能发帖或回复';
  return null;
}

/* ---------- 通知（被回复 / 被点赞） ---------- */
/* 写入一条通知；不通知自己（actor===recipient）。
   写入后尝试浏览器 Web Push（页面关闭也能收到）；推送失败完全不影响主流程。 */
async function addNotification(env,o){
  if(!o.userId||!o.actorId||o.userId===o.actorId)return;
  const notifId=genId('n');
  await env.DB.prepare(
    `INSERT INTO notifications
       (id,user_id,type,actor_id,actor_name,target_type,target_id,post_id,post_title,excerpt,read,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,0,?)`)
    .bind(notifId,o.userId,o.type,o.actorId,o.actorName||'',
      o.targetType,o.targetId,o.postId||'',o.postTitle||'',o.excerpt||'',nowStr()).run();
  const pushPayload=buildPushPayload(o,notifId);
  if(pushPayload){
    try{ await dispatchWebPush(env,o.userId,pushPayload); }
    catch(e){ /* 推送通道异常不允许波及发帖/回复/点赞主流程 */ }
  }
}

/* ---------- @提及 ---------- */
/* 提及标记：@[昵称](用户ID)。返回去重后的 [{id,name}]，按出现顺序。 */
const MENTION_MARK_RE=/@\[([^\[\]]{1,40})\]\(([A-Za-z0-9][A-Za-z0-9\-]{0,63})\)/g;
function parseMentionMarks(content){
  const out=[],seen=new Set();let m;
  MENTION_MARK_RE.lastIndex=0;
  while((m=MENTION_MARK_RE.exec(String(content||'')))){
    const name=m[1],id=m[2];
    if(!seen.has(id)){seen.add(id);out.push({id,name});}
  }
  return out;
}
/* 把正文里的提及标记还原为纯文本 @昵称（用于通知摘要） */
function mentionMarksToText(content){
  return String(content||'').replace(MENTION_MARK_RE,'@$1');
}
/* 解析正文提及并逐个发送系统通知 + Web Push。
   opts: {content, actorId, actorName, postId, postTitle, targetType, targetId,
          commentId?, excludeIds?}；excludeIds 内的人不再重复通知（避免与回复通知撞车）。
   自己 @ 自己由 addNotification 内部跳过。返回实际处理的提及人数。 */
async function processMentions(env,opts){
  const marks=parseMentionMarks(opts.content);
  if(!marks.length)return 0;
  const exclude=opts.excludeIds||new Set();
  const ids=[];
  for(const mk of marks){
    if(!mk.id||exclude.has(mk.id)||ids.includes(mk.id))continue;
    ids.push(mk.id);
  }
  if(!ids.length)return 0;
  /* 校验 id 真实存在（防止正文里伪造不存在的标记），并以库里的权威 name 为准 */
  const ph=ids.map(()=>'?').join(',');
  const {results}=await env.DB.prepare(
    `SELECT id,name FROM users WHERE id IN (${ph})`).bind(...ids).all();
  const real=results||[];
  const excerpt=mentionMarksToText(opts.content).slice(0,120);
  for(const u of real){
    await addNotification(env,{
      userId:u.id,type:'mention',actorId:opts.actorId,actorName:opts.actorName,
      targetType:opts.targetType||'post',targetId:opts.targetId||opts.postId,
      postId:opts.postId,postTitle:opts.postTitle,
      commentId:opts.commentId||null,excerpt
    });
  }
  return real.length;
}

/* ---------- 浏览器 Web Push（VAPID / RFC 8291 aes128gcm） ---------- */
/* 把一条业务通知转成推送负载（SW 端 showNotification 直接消费） */
function buildPushPayload(o,notifId){
  const actor=o.actorName||'论坛成员';
  let title,body;
  if(o.type==='like'){
    title=actor+' 赞了你的'+(o.targetType==='reply'?'评论':'帖子');
    body=o.postTitle||'你的内容收到了新的点赞';
  }else if(o.type==='mention'){
    title=actor+' 在帖子中提到了你';
    const parts=[];
    if(o.postTitle)parts.push(o.postTitle);
    if(o.excerpt)parts.push(o.excerpt);
    body=parts.join(' · ')||'有人在帖子里提到了你';
  }else{
    title=actor+' 回复了你';
    const parts=[];
    if(o.postTitle)parts.push(o.postTitle);
    if(o.excerpt)parts.push(o.excerpt);
    body=parts.join(' · ')||'你有一条新的回复';
  }
  let url=o.postId?('#/post/'+o.postId):'#/forum-notices';
  /* 回复/提及可带具体楼层，前端渲染后滚动定位并高亮 */
  if(o.commentId)url+='?c='+encodeURIComponent(o.commentId);
  return {
    title,
    body:String(body).slice(0,180),
    tag:'ndt-'+o.type+'-'+(o.targetId||notifId),
    url,
    notifId
  };
}

/* VAPID 密钥对（ECDSA P-256），首次使用自动生成并持久化到 meta 表 */
async function getVapidKeys(env){
  let row=await env.DB.prepare('SELECT value FROM meta WHERE key=?').bind('vapid-keys').first();
  if(row&&row.value){
    let saved;
    try{ saved=JSON.parse(row.value); }catch(e){ saved=null; }
    if(saved&&saved.priv&&saved.pub){
      const [privateKey,publicKey]=await Promise.all([
        crypto.subtle.importKey('pkcs8',base64UrlToBuf(saved.priv),
          {name:'ECDSA',namedCurve:'P-256'},false,['sign']),
        crypto.subtle.importKey('raw',base64UrlToBuf(saved.pub),
          {name:'ECDSA',namedCurve:'P-256'},false,['verify'])
      ]);
      return {privateKey,publicKey,publicB64u:saved.pub};
    }
  }
  const pair=await crypto.subtle.generateKey(
    {name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const [privRaw,pubRaw]=await Promise.all([
    crypto.subtle.exportKey('pkcs8',pair.privateKey),
    crypto.subtle.exportKey('raw',pair.publicKey)
  ]);
  const saved={priv:bufToBase64Url(privRaw),pub:bufToBase64Url(pubRaw)};
  await env.DB.prepare('INSERT OR REPLACE INTO meta (key,value) VALUES (?,?)')
    .bind('vapid-keys',JSON.stringify(saved)).run();
  return {privateKey:pair.privateKey,publicKey:pair.publicKey,publicB64u:saved.pub};
}

/* 构造 VAPID Authorization 头（ES256 JWT），aud 为推送服务 endpoint 的 origin */
async function vapidAuthHeader(vapid,endpoint){
  const audience=new URL(endpoint).origin;
  const header=bufToBase64Url(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'})));
  const claims=bufToBase64Url(enc.encode(JSON.stringify({
    aud:audience,
    exp:Math.floor(Date.now()/1000)+12*3600,
    sub:'mailto:admin@nadutong-forum.pages.dev'
  })));
  const signingInput=header+'.'+claims;
  const sig=await crypto.subtle.sign(
    {name:'ECDSA',hash:'SHA-256'},vapid.privateKey,enc.encode(signingInput));
  return 'vapid t='+signingInput+'.'+bufToBase64Url(sig)+', k='+vapid.publicB64u;
}

/* Web Crypto HKDF（SHA-256），返回指定长度字节 */
async function hkdf(ikm,salt,info,len){
  const key=await crypto.subtle.importKey('raw',ikm,'HKDF',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits(
    {name:'HKDF',hash:'SHA-256',salt,info},key,len*8));
}
function concatBytes(...parts){
  const total=parts.reduce((n,p)=>n+p.byteLength,0);
  const out=new Uint8Array(total);
  let off=0;
  for(const p of parts){out.set(new Uint8Array(p),off);off+=p.byteLength;}
  return out;
}

/* RFC 8291 aes128gcm：加密单条推送消息，返回完整的二进制消息体 */
async function encryptPushPayload(subscription,payloadBytes){
  const clientPubRaw=base64UrlToBuf(subscription.p256dh);
  const authSecret=base64UrlToBuf(subscription.auth);
  /* 临时 ECDH 密钥对 */
  const ephemeral=await crypto.subtle.generateKey(
    {name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  const clientPub=await crypto.subtle.importKey(
    'raw',clientPubRaw,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const shared=await crypto.subtle.deriveBits(
    {name:'ECDH',public:clientPub},ephemeral.privateKey,256);
  const localPubRaw=await crypto.subtle.exportKey('raw',ephemeral.publicKey);
  /* 第一步：auth 信息派生 IKM */
  const authInfo=concatBytes(enc.encode('WebPush: info\0'),clientPubRaw,localPubRaw);
  const ikm=await hkdf(new Uint8Array(shared),new Uint8Array(authSecret),authInfo,32);
  /* 第二步：随机 salt 派生 CEK 与 nonce */
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const cek=await hkdf(ikm,salt,enc.encode('Content-Encoding: aes128gcm\0'),16);
  const nonce=await hkdf(ikm,salt,enc.encode('Content-Encoding: nonce\0'),12);
  /* 明文 = payload + 定界符 0x02 + 零填充（单记录） */
  const plaintext=concatBytes(payloadBytes,new Uint8Array([0x02]));
  const aesKey=await crypto.subtle.importKey(
    'raw',cek,{name:'AES-GCM'},false,['encrypt']);
  const ciphertext=await crypto.subtle.encrypt(
    {name:'AES-GCM',iv:nonce,tagLength:128},aesKey,plaintext);
  /* 消息头：salt(16) | record size(4) | keyid len(1) | keyid(65) */
  const recordSize=4096;
  const header=new Uint8Array(16+4+1+65);
  header.set(salt,0);
  const dv=new DataView(header.buffer);
  dv.setUint32(16,recordSize);
  header[20]=65;
  header.set(new Uint8Array(localPubRaw),21);
  return concatBytes(header,new Uint8Array(ciphertext));
}

/* 向单个订阅端点发送推送；404/410 表示端点已失效，自动清理 */
async function sendToSubscription(env,sub,payloadBytes,vapid){
  const body=await encryptPushPayload(sub,payloadBytes);
  const res=await fetch(sub.endpoint,{
    method:'POST',
    headers:{
      'Authorization':await vapidAuthHeader(vapid,sub.endpoint),
      'Content-Type':'application/octet-stream',
      'Content-Encoding':'aes128gcm',
      'TTL':String(28*24*3600),
      'Urgency':'normal'
    },
    body
  });
  if(res.status===404||res.status===410){
    await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint=?')
      .bind(sub.endpoint).run();
  }
  return res.status;
}

/* 给某用户的全部设备推送同一条消息（多设备/多浏览器） */
async function dispatchWebPush(env,userId,payload){
  const {results}=await env.DB.prepare(
    'SELECT endpoint,p256dh,auth FROM push_subscriptions WHERE user_id=?')
    .bind(userId).all();
  const subs=results||[];
  if(!subs.length)return;
  const vapid=await getVapidKeys(env);
  const payloadBytes=enc.encode(JSON.stringify(payload));
  await Promise.all(subs.map(sub=>
    sendToSubscription(env,sub,payloadBytes,vapid).catch(()=>{})));
}
/* 删除某条点赞对应的通知（取消点赞时调用） */
async function removeLikeNotification(env,actorId,targetType,targetId){
  await env.DB.prepare(
    `DELETE FROM notifications
     WHERE actor_id=? AND type='like' AND target_type=? AND target_id=?`)
    .bind(actorId,targetType,targetId).run();
}

/* 公开用户资料（不含密码字段） */
function publicUser(row){
  const points=Number(row.points)||0;
  const g=levelOfPoints(points);
  return {
    id:row.id, login:row.login, name:row.name, avatar:row.avatar||'',
    role:Number(row.role)||1, points,
    muted:Number(row.muted)||0, banned:Number(row.banned)||0,
    level:g.level, levelName:g.name,
    createdAt:row.created_at
  };
}
function nowStr(){
  return new Date().toISOString();
}

/* ---------- 帖子归一化（列表/搜索/主页共用） ---------- */
function shapePostRow(row,votes,replyCount,lastActivityAt,authorInfo){
  return {
    id:row.id,
    board:row.board,
    title:row.title,
    content:row.content,
    authorId:row.author_id,
    authorName:row.author_name,
    authorLevel:authorInfo?authorInfo.level:0,
    authorLevelName:authorInfo?authorInfo.levelName:'',
    authorAvatar:authorInfo?authorInfo.avatar:'',
    createdAt:row.created_at,
    lastActivityAt:lastActivityAt||row.created_at,
    pinned:!!row.pinned,
    essence:!!Number(row.essence),
    views:Number(row.views)||0,
    votes:votes||[],
    replyCount:replyCount||0,
    editedAt:row.edited_at||null,
    editCount:Number(row.edit_count)||0
  };
}
/* 批量把原始 post 行补齐点赞/回复/作者信息并归一化 */
async function shapePostList(env,rows){
  if(!rows.length)return [];
  const ids=rows.map(p=>p.id);
  const ph=ids.map(()=>'?').join(',');
  const likesRes=await env.DB.prepare(
    `SELECT target_id,user_id FROM likes
     WHERE target_type='post' AND target_id IN (${ph})`).bind(...ids).all();
  const votesMap={};
  (likesRes.results||[]).forEach(l=>{
    (votesMap[l.target_id]=votesMap[l.target_id]||[]).push(l.user_id);
  });
  const repRes=await env.DB.prepare(
    `SELECT post_id,COUNT(*) AS n,MAX(created_at) AS last_at FROM replies
     WHERE post_id IN (${ph}) GROUP BY post_id`).bind(...ids).all();
  const repMap={},lastMap={};
  (repRes.results||[]).forEach(r=>{repMap[r.post_id]=r.n;lastMap[r.post_id]=r.last_at;});
  const uMap=await userInfoMap(env,rows.map(p=>p.author_id));
  return rows.map(p=>shapePostRow(p,votesMap[p.id],repMap[p.id],lastMap[p.id],uMap[p.author_id]));
}
/* 批量把原始 reply 行补齐点赞/作者信息并归一化 */
async function shapeReplyList(env,rows){
  if(!rows.length)return [];
  const ids=rows.map(r=>r.id);
  const ph=ids.map(()=>'?').join(',');
  const lk=await env.DB.prepare(
    `SELECT target_id,user_id FROM likes
     WHERE target_type='reply' AND target_id IN (${ph})`).bind(...ids).all();
  const vMap={};
  (lk.results||[]).forEach(l=>{
    (vMap[l.target_id]=vMap[l.target_id]||[]).push(l.user_id);
  });
  const uMap=await userInfoMap(env,rows.map(r=>r.author_id));
  return rows.map(r=>{
    const info=uMap[r.author_id]||{};
    return {
      id:r.id,postId:r.post_id,parentId:r.parent_id||null,
      authorId:r.author_id,authorName:r.author_name,
      authorLevel:info.level||0,authorLevelName:info.levelName||'',
      authorAvatar:info.avatar||'',
      content:r.content,createdAt:r.created_at,votes:vMap[r.id]||[]
    };
  });
}

/* ---------- 投票 ---------- */
/* 批量取用户展示信息（等级/等级名/头像），返回 {id:{level,levelName,avatar}} */
async function userInfoMap(env,ids){
  const uniq=[...new Set(ids.filter(Boolean))];
  const out={};
  if(!uniq.length)return out;
  const ph=uniq.map(()=>'?').join(',');
  const r=await env.DB.prepare(
    `SELECT id,points,avatar FROM users WHERE id IN (${ph})`).bind(...uniq).all();
  (r.results||[]).forEach(u=>{
    const g=levelOfPoints(Number(u.points)||0);
    out[u.id]={level:g.level,levelName:g.name,avatar:u.avatar||''};
  });
  return out;
}
/* 取某帖子的投票：选项、各选项票数、总人数、当前用户是否已投 */
async function getPollForPost(env,postId,viewerId){
  const poll=await env.DB.prepare('SELECT * FROM polls WHERE post_id=?').bind(postId).first();
  if(!poll)return null;
  const opts=await env.DB.prepare(
    'SELECT * FROM poll_options WHERE poll_id=? ORDER BY pos').bind(poll.id).all();
  const options=opts.results||[];
  const ids=options.map(o=>o.id);
  const countMap={},myVotes=[];
  if(ids.length){
    const ph=ids.map(()=>'?').join(',');
    const vr=await env.DB.prepare(
      `SELECT option_id,user_id FROM poll_votes WHERE option_id IN (${ph})`).bind(...ids).all();
    (vr.results||[]).forEach(v=>{
      (countMap[v.option_id]=countMap[v.option_id]||[]).push(v.user_id);
      if(viewerId&&v.user_id===viewerId)myVotes.push(v.option_id);
    });
  }
  let totalVoters=0;
  const votersSet=new Set();
  Object.keys(countMap).forEach(k=>countMap[k].forEach(u=>votersSet.add(u)));
  totalVoters=votersSet.size;
  return {
    id:poll.id,question:poll.question,multi:!!poll.multi,totalVoters,
    myVotes,
    options:options.map(o=>({
      id:o.id,text:o.text,votes:(countMap[o.id]||[]).length
    }))
  };
}

export {
  json,readBody,preflight,ensureSchema,getSecret,genId,
  hashPassword,verifyPassword,signToken,getAuthUser,
  POINTS_RULE,addPoints,addPointsClamped,isAdmin,
  ANNOUNCEMENT_BOARD,moderationBlock,
  addNotification,removeLikeNotification,
  parseMentionMarks,mentionMarksToText,processMentions,
  levelOfPoints,publicUser,nowStr,getPollForPost,userInfoMap,
  shapePostRow,shapePostList,shapeReplyList,
  getVapidKeys,dispatchWebPush
};
