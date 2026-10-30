import {
  json,readBody,preflight,ensureSchema,getAuthUser,genId,
  addPoints,addNotification,processMentions,POINTS_RULE,nowStr,moderationBlock
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/posts/:id/replies
   body: { content, parentId? }；带 parentId 为楼中楼（回复某条评论） */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  const content=String(b.content||'').trim();
  if(!content)return json({error:'回复内容不能为空'},400);
  /* 封禁 / 禁言校验 */
  const block=moderationBlock(me);
  if(block)return json({error:block},403);
  await ensureSchema(env);
  const post=await env.DB.prepare('SELECT id,author_id,title FROM posts WHERE id=?').bind(params.id).first();
  if(!post)return json({error:'帖子不存在'},404);

  /* 楼中楼：若指定父回复，校验其属于本帖 */
  let parentId=null, parent=null;
  if(b.parentId){
    parentId=String(b.parentId);
    parent=await env.DB.prepare('SELECT id,author_id,author_name FROM replies WHERE id=? AND post_id=?')
      .bind(parentId,params.id).first();
    if(!parent)return json({error:'所回复的评论不存在或已被删除'},400);
  }

  const id=genId('a');
  const createdAt=nowStr();
  await env.DB.prepare(
    `INSERT INTO replies (id,post_id,parent_id,author_id,author_name,content,created_at)
     VALUES (?,?,?,?,?,?,?)`)
    .bind(id,params.id,parentId,me.id,me.name,content,createdAt).run();
  await addPoints(env,me.id,POINTS_RULE.reply);

  /* 记录已会收到“回复”通知的人，@提及与之去重，避免同一人被重复打扰 */
  const replyNotifyIds=new Set();
  if(parentId){
    /* 楼中楼：通知被回复的那条评论的作者（不通知自己） */
    if(parent.author_id&&parent.author_id!==me.id){
      replyNotifyIds.add(parent.author_id);
      await addNotification(env,{
        userId:parent.author_id,type:'reply',actorId:me.id,actorName:me.name,
        targetType:'reply',targetId:parentId,postId:params.id,postTitle:post.title,
        excerpt:content.slice(0,120)
      });
    }
  }else{
    /* 顶层回复：通知帖子作者（不通知自己） */
    if(post.author_id&&post.author_id!==me.id){
      replyNotifyIds.add(post.author_id);
      await addNotification(env,{
        userId:post.author_id,type:'reply',actorId:me.id,actorName:me.name,
        targetType:'post',targetId:params.id,postId:params.id,postTitle:post.title,
        excerpt:content.slice(0,120)
      });
    }
  }
  /* @提及：被点名且未收到回复通知的成员，收到 mention 通知 + Web Push，
     推送点击可直达这条新楼层（commentId）。异常不影响回复主流程。 */
  try{
    await processMentions(env,{
      content,actorId:me.id,actorName:me.name,
      targetType:'reply',targetId:id,postId:params.id,postTitle:post.title,
      commentId:id,excludeIds:replyNotifyIds
    });
  }catch(e){ /* 提及失败不阻断回复 */ }
  return json({reply:{
    id,postId:params.id,parentId,authorId:me.id,authorName:me.name,
    content,createdAt,votes:[]
  }});
}
