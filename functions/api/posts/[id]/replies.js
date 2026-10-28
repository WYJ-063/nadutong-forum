import {
  json,readBody,preflight,ensureSchema,getAuthUser,genId,
  addPoints,POINTS_RULE,nowStr
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/posts/:id/replies */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  const content=String(b.content||'').trim();
  if(!content)return json({error:'回复内容不能为空'},400);
  await ensureSchema(env);
  const post=await env.DB.prepare('SELECT id FROM posts WHERE id=?').bind(params.id).first();
  if(!post)return json({error:'帖子不存在'},404);
  const id=genId('a');
  const createdAt=nowStr();
  await env.DB.prepare(
    `INSERT INTO replies (id,post_id,author_id,author_name,content,created_at)
     VALUES (?,?,?,?,?,?)`)
    .bind(id,params.id,me.id,me.name,content,createdAt).run();
  await addPoints(env,me.id,POINTS_RULE.reply);
  return json({reply:{
    id,postId:params.id,authorId:me.id,authorName:me.name,
    content,createdAt,votes:[]
  }});
}
