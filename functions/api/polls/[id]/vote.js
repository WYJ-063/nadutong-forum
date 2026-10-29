import {
  json,readBody,preflight,ensureSchema,getAuthUser,
  nowStr,getPollForPost
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/polls/:id/vote —— 提交投票；body { optionIds:[...] }
   以提交的选项集合覆盖该用户在本投票下的选择（单选只保留 1 个） */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const pollId=params.id;
  const poll=await env.DB.prepare('SELECT * FROM polls WHERE id=?').bind(pollId).first();
  if(!poll)return json({error:'投票不存在或已结束'},404);
  const b=await readBody(request);
  let ids=Array.isArray(b.optionIds)?b.optionIds:[];
  ids=ids.map(String).filter(Boolean);
  /* 校验选项属于本投票 */
  const opts=await env.DB.prepare(
    'SELECT id FROM poll_options WHERE poll_id=?').bind(pollId).all();
  const valid=new Set((opts.results||[]).map(o=>o.id));
  ids=ids.filter(x=>valid.has(x));
  if(!poll.multi)ids=ids.slice(0,1);
  if(!ids.length)return json({error:'请选择至少一个选项'},400);

  /* 清除该用户在本投票下的旧选择，再写入新选择 */
  await env.DB.prepare(
    `DELETE FROM poll_votes WHERE poll_id=? AND user_id=?`)
    .bind(pollId,me.id).run();
  for(const oid of ids){
    await env.DB.prepare(
      `INSERT INTO poll_votes (poll_id,option_id,user_id,created_at)
       VALUES (?,?,?,?)`).bind(pollId,oid,me.id,nowStr()).run();
  }
  const fresh=await getPollForPost(env,poll.post_id,me.id);
  return json({ok:true,poll:fresh});
}
