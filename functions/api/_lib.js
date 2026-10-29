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
)`
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
  `ALTER TABLE replies ADD COLUMN parent_id TEXT`
];
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
/* 写入一条通知；不通知自己（actor===recipient） */
async function addNotification(env,o){
  if(!o.userId||!o.actorId||o.userId===o.actorId)return;
  await env.DB.prepare(
    `INSERT INTO notifications
       (id,user_id,type,actor_id,actor_name,target_type,target_id,post_id,post_title,excerpt,read,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,0,?)`)
    .bind(genId('n'),o.userId,o.type,o.actorId,o.actorName||'',
      o.targetType,o.targetId,o.postId||'',o.postTitle||'',o.excerpt||'',nowStr()).run();
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
  levelOfPoints,publicUser,nowStr,getPollForPost,userInfoMap
};
