import {
  json,preflight,ensureSchema,getAuthUser,
  isAdmin,addPointsClamped,POINTS_RULE
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* DELETE /api/replies/:id —— 评论作者本人或管理员可删；连带删除该评论点赞 */
export async function onRequestDelete({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const id=params.id;
  const reply=await env.DB.prepare('SELECT * FROM replies WHERE id=?').bind(id).first();
  if(!reply)return json({error:'评论不存在或已被删除'},404);
  if(reply.author_id!==me.id && !isAdmin(me))
    return json({error:'无权删除该评论（仅作者本人或管理员）'},403);

  /* 该评论点赞 */
  await env.DB.prepare(
    `DELETE FROM likes WHERE target_type='reply' AND target_id=?`).bind(id).run();
  /* 评论 */
  await env.DB.prepare('DELETE FROM replies WHERE id=?').bind(id).run();
  /* 扣回作者回复所得基础积分（不低于 0） */
  if(reply.author_id)await addPointsClamped(env,reply.author_id,-POINTS_RULE.reply);
  return json({ok:true,postId:reply.post_id});
}
