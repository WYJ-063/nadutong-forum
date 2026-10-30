import {
  json,preflight,ensureSchema,getAuthUser
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/posts/:id/edits —— 帖子编辑历史（能看帖子即可看，不强制登录）。
   返回按版本号升序的完整版本时间线：历史快照 + 当前版本。 */
export async function onRequestGet({request,env,params}){
  await ensureSchema(env);
  const id=params.id;
  const post=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  if(!post)return json({error:'帖子不存在或已被删除'},404);
  const me=await getAuthUser(request,env);
  const histRes=await env.DB.prepare(
    'SELECT * FROM post_edits WHERE post_id=? ORDER BY version ASC').bind(id).all();
  const editCount=Number(post.edit_count)||0;
  /* 历史版本：被替换下来的各版本快照 */
  const versions=(histRes.results||[]).map(r=>({
    version:Number(r.version)||0,
    title:r.title,
    content:r.content,
    editorId:r.editor_id||null,
    editorName:r.editor_name||'',
    at:r.created_at,
    current:false
  }));
  /* 当前版本：posts 表内容，版本号 = 编辑次数 + 1 */
  versions.push({
    version:editCount+1,
    title:post.title,
    content:post.content,
    editorId:post.author_id||null,
    editorName:null,
    at:post.edited_at||post.created_at,
    current:true
  });
  return json({
    postId:id,
    editCount,
    canEdit:me?me.id===post.author_id:false,
    versions
  });
}
