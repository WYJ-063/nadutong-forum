import {
  json,preflight,ensureSchema,getAuthUser,addPoints,nowStr
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* 签到规则：每日基础 5 积分；每连续 7 天额外 +10（周奖励） */
const CHECKIN_BASE=5;
const CHECKIN_WEEK_BONUS=10;
function dateStr(d){
  return d.toISOString().slice(0,10);
}
function yesterdayStr(d){
  const y=new Date(d.getTime());
  y.setUTCDate(y.getUTCDate()-1);
  return dateStr(y);
}

/* GET /api/checkin —— 当前签到状态 */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const today=dateStr(new Date());
  const row=await env.DB.prepare('SELECT * FROM checkins WHERE user_id=?').bind(me.id).first();
  const streak=Number(row&&row.streak)||0;
  const totalDays=Number(row&&row.total_days)||0;
  const checkedToday=!!(row&&row.last_date===today);
  return json({checkedToday,streak,totalDays,today});
}

/* POST /api/checkin —— 每日签到（重复签到不重复加分） */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const now=new Date();
  const today=dateStr(now);
  const yest=yesterdayStr(now);
  const row=await env.DB.prepare('SELECT * FROM checkins WHERE user_id=?').bind(me.id).first();

  if(row&&row.last_date===today)
    return json({checkedToday:true,streak:Number(row.streak)||0,
      totalDays:Number(row.total_days)||0,gained:0,message:'今天已签到，明天再来'});

  const prevStreak=Number(row&&row.streak)||0;
  const streak=(row&&row.last_date===yest)?prevStreak+1:1;
  const totalDays=(Number(row&&row.total_days)||0)+1;
  let gained=CHECKIN_BASE;
  let bonus=0;
  if(streak%7===0)bonus=CHECKIN_WEEK_BONUS;
  gained+=bonus;

  await env.DB.prepare(
    `INSERT INTO checkins (user_id,last_date,streak,total_days,updated_at)
       VALUES (?,?,?,?,?)
     ON CONFLICT(user_id) DO UPDATE SET
       last_date=excluded.last_date,streak=excluded.streak,
       total_days=excluded.total_days,updated_at=excluded.updated_at`)
    .bind(me.id,today,streak,totalDays,nowStr()).run();
  if(gained)await addPoints(env,me.id,gained);

  return json({checkedToday:true,streak,totalDays,gained,bonus,
    message:bonus?`签到成功，连续 ${streak} 天，周奖励 +${bonus}`:'签到成功'});
}
