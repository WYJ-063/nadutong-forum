import {
  json,readBody,preflight,ensureSchema,getAuthUser,
  addPoints,addPointsClamped,addNotification,removeLikeNotification,POINTS_RULE,nowStr
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

  /* 先查目标：点赞要校验存在，取消点赞也要用作者信息把积分退回去 */
  let target,postId,postTitle;
  if(type==='post'){
    target=await env.DB.prepare(
      'SELECT author_id,title FROM posts WHERE id=?').bind(id).first();
    if(target){postId=id;postTitle=target.title;}
  }else{
    target=await env.DB.prepare(
      'SELECT author_id,post_id FROM replies WHERE id=?').bind(id).first();
    if(target){
      postId=target.post_id;
      const p=await env.DB.prepare('SELECT title FROM posts WHERE id=?').bind(postId).first();
      postTitle=p?p.title:'';
    }
  }

  const existing=await env.DB.prepare(
    'SELECT 1 FROM likes WHERE user_id=? AND target_type=? AND target_id=?')
    .bind(me.id,type,id).first();

  if(existing){
    await env.DB.prepare(
      'DELETE FROM likes WHERE user_id=? AND target_type=? AND target_id=?')
      .bind(me.id,type,id).run();
    /* 取消点赞时，移除对应的点赞通知，并收回当初加给作者的积分。
       否则「点赞→取消→再点赞」可以无限刷分。 */
    await removeLikeNotification(env,me.id,type,id);
    if(target&&target.author_id&&target.author_id!==me.id)
      await addPointsClamped(env,target.author_id,-Number(POINTS_RULE.liked||0));
    return json({liked:false});
  }

  if(!target)return json({error:'目标不存在'},404);

  await env.DB.prepare(
    'INSERT INTO likes (user_id,target_type,target_id,created_at) VALUES (?,?,?,?)')
    .bind(me.id,type,id,nowStr()).run();

  /* 被点赞的作者获得积分 + 通知（不给自己刷） */
  if(target.author_id&&target.author_id!==me.id){
    await addPoints(env,target.author_id,POINTS_RULE.liked);
    await addNotification(env,{
      userId:target.author_id,type:'like',actorId:me.id,actorName:me.name,
      targetType:type,targetId:id,postId:postId,postTitle:postTitle,excerpt:''
    });
  }

  return json({liked:true});
}
