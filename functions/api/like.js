import {
  json,readBody,preflight,ensureSchema,getAuthUser,
  addPoints,POINTS_RULE,nowStr
} from './_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/like  { type:'post'|'reply', id }  —— 点赞 / 取消点赞 */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  const type=b.type==='reply'?'reply':'post';
  const id=String(b.id||'');
  if(!id)return json({error:'缺少目标'},400);
  await ensureSchema(env);

  const existing=await env.DB.prepare(
    'SELECT 1 FROM likes WHERE user_id=? AND target_type=? AND target_id=?')
    .bind(me.id,type,id).first();

  if(existing){
    await env.DB.prepare(
      'DELETE FROM likes WHERE user_id=? AND target_type=? AND target_id=?')
      .bind(me.id,type,id).run();
    return json({liked:false});
  }

  /* 校验目标存在 */
  const table=type==='post'?'posts':'replies';
  const target=await env.DB.prepare(
    `SELECT author_id FROM ${table} WHERE id=?`).bind(id).first();
  if(!target)return json({error:'目标不存在'},404);

  await env.DB.prepare(
    'INSERT INTO likes (user_id,target_type,target_id,created_at) VALUES (?,?,?,?)')
    .bind(me.id,type,id,nowStr()).run();

  /* 被点赞的作者获得积分（不给自己刷） */
  if(target.author_id&&target.author_id!==me.id)
    await addPoints(env,target.author_id,POINTS_RULE.liked);

  return json({liked:true});
}
