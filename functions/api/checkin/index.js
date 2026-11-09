import {
  json,preflight,ensureSchema,getAuthUser,addPoints,nowStr
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* 签到规则：每日基础 5 积分；每连续 7 天额外 +10（周奖励） */
const CHECKIN_BASE=5;
const CHECKIN_WEEK_BONUS=10;
/* 签到日按北京时间（UTC+8）计算：旧实现用 UTC 日期，导致 00:00-08:00 签到
   仍算「昨天」，连续天数和「今天已签到」都不对。 */
const TZ_OFFSET_MS=8*60*60*1000;
function dateStr(d){
  return new Date(d.getTime()+TZ_OFFSET_MS).toISOString().slice(0,10);
}
function yesterdayStr(d){
  const y=new Date(d.getTime()+TZ_OFFSET_MS);
  y.setUTCDate(y.getUTCDate()-1);
  return y.toISOString().slice(0,10);
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

  /* 并发保护：WHERE 让「库里记录的 last_date 还不是今天」成为真正落库的条件。
     两个请求同时签到，只有一个能拿到 changes=1 和积分，另一个按已签到返回，
     避免同一秒连点两次刷出双倍积分。 */
  const up=await env.DB.prepare(
    `INSERT INTO checkins (user_id,last_date,streak,total_days,updated_at)
       VALUES (?,?,?,?,?)
     ON CONFLICT(user_id) DO UPDATE SET
       last_date=excluded.last_date,streak=excluded.streak,
       total_days=excluded.total_days,updated_at=excluded.updated_at
     WHERE checkins.last_date<>excluded.last_date`)
    .bind(me.id,today,streak,totalDays,nowStr()).run();
  const changed=Number(up&&up.meta&&up.meta.changes)||0;
  if(!changed)
    return json({checkedToday:true,streak:prevStreak,
      totalDays:Number(row&&row.total_days)||0,gained:0,message:'今天已签到，明天再来'});
  if(gained)await addPoints(env,me.id,gained);

  return json({checkedToday:true,streak,totalDays,gained,bonus,
    message:bonus?`签到成功，连续 ${streak} 天，周奖励 +${bonus}`:'签到成功'});
}
