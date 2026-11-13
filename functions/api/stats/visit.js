import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* 按东八区切天：服务器时间是 UTC，直接按 UTC 分天会让"今天"
   从早上 8 点才开始，国内看着别扭。 */
function dayOfCST(ms){
  const t=Number(ms)||Date.now();
  const shifted=new Date(t+8*3600*1000);
  return shifted.toISOString().slice(0,10);
}

/* POST /api/stats/visit —— 记录一次页面访问（公开打点，不需要登录）
   body: { vid }  vid 由前端生成并存在本机，用来去重当天的人数 */
export async function onRequestPost({request,env}){
  await ensureSchema(env);
  const b=await readBody(request);
  const vid=String((b&&b.vid)||'').trim().slice(0,64);
  if(!/^[A-Za-z0-9_-]{8,64}$/.test(vid))
    return json({error:'访客标识不合法'},400);
  const now=new Date();
  const day=dayOfCST(now.getTime());
  const iso=now.toISOString();
  /* 同一天同一个人反复打开：只把 pv 往上加，不再插新行 */
  await env.DB.prepare(
    `INSERT INTO visits (day,vid,pv,first_at,last_at) VALUES (?,?,1,?,?)
     ON CONFLICT(day,vid) DO UPDATE SET pv=pv+1, last_at=excluded.last_at`)
    .bind(day,vid,iso,iso).run();
  return json({ok:true,day});
}

/* GET /api/stats/visit —— 管理员查看访问数据 */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可查看访问统计'},403);
  await ensureSchema(env);
  const today=dayOfCST(Date.now());
  const yesterday=dayOfCST(Date.now()-86400000);

  const rows=await env.DB.prepare(
    `SELECT day, SUM(pv) AS pv, COUNT(*) AS uv FROM visits
     GROUP BY day ORDER BY day DESC LIMIT 30`).all();
  const daily=(rows.results||[]).map(r=>({
    day:r.day, pv:Number(r.pv)||0, uv:Number(r.uv)||0
  }));

  const total=await env.DB.prepare(
    `SELECT SUM(pv) AS pv, COUNT(DISTINCT vid) AS uv FROM visits`).first();

  const t=daily.find(x=>x.day===today)||{day:today,pv:0,uv:0};
  const y=daily.find(x=>x.day===yesterday)||{day:yesterday,pv:0,uv:0};

  /* 近 7 天按日期倒推补齐，缺的日子补 0，免得表上出现断档 */
  const last7=[];
  for(let i=0;i<7;i++){
    const d=dayOfCST(Date.now()-i*86400000);
    const row=daily.find(x=>x.day===d);
    last7.push({day:d,pv:row?row.pv:0,uv:row?row.uv:0});
  }

  return json({
    today:t,
    yesterday:y,
    last7:last7.reverse(),
    total:{pv:Number(total&&total.pv)||0,uv:Number(total&&total.uv)||0},
    daily,
    viewer:me.id
  });
}
