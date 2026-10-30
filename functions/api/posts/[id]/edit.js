import {
  json,readBody,preflight,ensureSchema,getAuthUser,
  genId,nowStr,shapePostRow,userInfoMap
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/posts/:id/edit —— 仅帖子作者本人可编辑（管理员也不能编辑他人帖子）。
   每次编辑先把"被替换的版本"完整快照写入 post_edits，再更新 posts；内容无变化则不产生记录。 */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const id=params.id;
  const post=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  if(!post)return json({error:'帖子不存在或已被删除'},404);
  /* 严格权限：仅作者本人，不开放管理员例外 */
  if(post.author_id!==me.id)
    return json({error:'只能编辑自己发布的帖子'},403);
  const b=await readBody(request);
  const title=String(b.title==null?'':b.title).trim();
  const content=String(b.content==null?'':b.content);
  if(!title)return json({error:'标题不能为空'},400);
  if(!content.trim())return json({error:'正文不能为空'},400);
  const oldTitle=String(post.title||'');
  const oldContent=String(post.content||'');
  /* 内容无变化：不写历史、不更新 */
  if(title===oldTitle && content===oldContent)
    return json({ok:false,noop:true,id,editCount:Number(post.edit_count)||0});
  const now=nowStr();
  const curCount=Number(post.edit_count)||0;
  /* 当前 posts 内容是版本 (curCount+1)，它被替换后以该版本号写入历史 */
  const replacedVersion=curCount+1;
  const editId=genId('pe');
  const stmts=[
    env.DB.prepare(
      `INSERT INTO post_edits (id,post_id,version,title,content,editor_id,editor_name,created_at)
       VALUES (?,?,?,?,?,?,?,?)`)
      .bind(editId,id,replacedVersion,oldTitle,oldContent,me.id,me.name,now),
    env.DB.prepare(
      `UPDATE posts SET title=?, content=?, edited_at=?, edit_count=? WHERE id=?`)
      .bind(title,content,now,curCount+1,id)
  ];
  await env.DB.batch(stmts);
  /* 重新组装返回最新 post（含点赞/回复数/作者信息） */
  const updated=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  const pv=await env.DB.prepare(
    `SELECT user_id FROM likes WHERE target_type='post' AND target_id=?`).bind(id).all();
  const votes=(pv.results||[]).map(r=>r.user_id);
  const rep=await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM replies WHERE post_id=?`).bind(id).first();
  const info=await userInfoMap(env,[updated.author_id]);
  const postShape=shapePostRow(updated,votes,Number(rep.n)||0,updated.created_at,info[updated.author_id]||{});
  return json({ok:true,post:postShape});
}
