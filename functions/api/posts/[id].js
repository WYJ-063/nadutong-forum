import {
  json,preflight,ensureSchema,getAuthUser,
  isAdmin,addPointsClamped,POINTS_RULE
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/posts/:id —— 帖子 + 回复（含各自点赞） */
export async function onRequestGet({request,env,params}){
  await ensureSchema(env);
  const id=params.id;
  const me=await getAuthUser(request,env);
  const post=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  if(!post)return json({error:'帖子不存在或已被删除'},404);

  /* 浏览量 +1 */
  await env.DB.prepare('UPDATE posts SET views=views+1 WHERE id=?').bind(id).run();
  post.views=(Number(post.views)||0)+1;

  /* 帖子点赞 */
  const pv=await env.DB.prepare(
    `SELECT user_id FROM likes WHERE target_type='post' AND target_id=?`)
    .bind(id).all();
  const postVotes=(pv.results||[]).map(r=>r.user_id);

  /* 回复 */
  const rep=await env.DB.prepare(
    'SELECT * FROM replies WHERE post_id=? ORDER BY created_at ASC').bind(id).all();
  const replies=rep.results||[];
  let replyVotes={};
  if(replies.length){
    const rids=replies.map(r=>r.id);
    const ph=rids.map(()=>'?').join(',');
    const rl=await env.DB.prepare(
      `SELECT target_id,user_id FROM likes
       WHERE target_type='reply' AND target_id IN (${ph})`)
      .bind(...rids).all();
    (rl.results||[]).forEach(l=>{
      (replyVotes[l.target_id]=replyVotes[l.target_id]||[]).push(l.user_id);
    });
  }
  const answerShapes=replies.map(r=>({
    id:r.id, postId:r.post_id, parentId:r.parent_id||null,
    authorId:r.author_id, authorName:r.author_name,
    content:r.content, createdAt:r.created_at,
    votes:replyVotes[r.id]||[]
  }));

  return json({
    post:{
      id:post.id, board:post.board, title:post.title, content:post.content,
      authorId:post.author_id, authorName:post.author_name,
      createdAt:post.created_at, pinned:!!post.pinned,
      views:post.views, votes:postVotes
    },
    replies:answerShapes,
    viewer:me?me.id:null
  });
}

/* DELETE /api/posts/:id —— 作者本人或管理员可删；连带删除回复与点赞 */
export async function onRequestDelete({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const id=params.id;
  const post=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  if(!post)return json({error:'帖子不存在或已被删除'},404);
  if(post.author_id!==me.id && !isAdmin(me))
    return json({error:'无权删除该帖子（仅作者本人或管理员）'},403);

  /* 该帖所有回复的点赞 */
  const rep=await env.DB.prepare('SELECT id FROM replies WHERE post_id=?').bind(id).all();
  const rids=(rep.results||[]).map(r=>r.id);
  if(rids.length){
    const ph=rids.map(()=>'?').join(',');
    await env.DB.prepare(
      `DELETE FROM likes WHERE target_type='reply' AND target_id IN (${ph})`)
      .bind(...rids).run();
  }
  /* 回复 */
  await env.DB.prepare('DELETE FROM replies WHERE post_id=?').bind(id).run();
  /* 帖子点赞 */
  await env.DB.prepare(
    `DELETE FROM likes WHERE target_type='post' AND target_id=?`).bind(id).run();
  /* 帖子 */
  await env.DB.prepare('DELETE FROM posts WHERE id=?').bind(id).run();
  /* 扣回作者发帖所得基础积分（不低于 0） */
  if(post.author_id)await addPointsClamped(env,post.author_id,-POINTS_RULE.post);
  return json({ok:true,deletedReplyCount:rids.length});
}
