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
      'Access-Control-Allow-Methods':'GET,POST,OPTIONS'}
  });
}
function readBody(req){
  return req.json().catch(()=>({}));
}
function preflight(){
  return new Response(null,{headers:{
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type,Authorization',
    'Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
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
)`
];
let schemaPromise=null;
async function ensureSchema(env){
  if(schemaPromise)return schemaPromise;
  schemaPromise=(async()=>{
    for(const s of SCHEMA){await env.DB.prepare(s).run();}
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
    {name:'PBKDF2',salt:enc.encode(salt),iterations:120000,hash:'SHA-256'},
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

/* 公开用户资料（不含密码字段） */
function publicUser(row){
  const points=Number(row.points)||0;
  const g=levelOfPoints(points);
  return {
    id:row.id, login:row.login, name:row.name, avatar:row.avatar||'',
    role:Number(row.role)||1, points,
    level:g.level, levelName:g.name,
    createdAt:row.created_at
  };
}
function nowStr(){
  return new Date().toISOString();
}

export {
  json,readBody,preflight,ensureSchema,getSecret,genId,
  hashPassword,verifyPassword,signToken,getAuthUser,
  POINTS_RULE,addPoints,levelOfPoints,publicUser,nowStr
};
