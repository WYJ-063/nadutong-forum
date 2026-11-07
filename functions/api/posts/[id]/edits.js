import {json,preflight,ensureSchema} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/posts/:id/edits —— 帖子编辑历史（前端「编辑记录」弹窗使用）
   版本号约定与 edit.js 保持一致：
   - 1 .. edit_count 为历史快照（post_edits）
   - edit_count+1 为当前版本（posts 中的实时内容） */
export async function onRequestGet({request,env,params}){
  await ensureSchema(env);
  const id=params.id;
  const post=await env.DB.prepare(
    'SELECT id,title,content,author_id,created_at,edited_at,edit_count FROM posts WHERE id=?')
    .bind(id).first();
  if(!post)return json({error:'帖子不存在或已被删除'},404);

  let rows=[];
  try{
    const r=await env.DB.prepare(
      `SELECT version,title,content,editor_name,created_at FROM post_edits
       WHERE post_id=? ORDER BY version ASC`).bind(id).all();
    rows=r.results||[];
  }catch(e){
    /* 历史表异常时至少返回当前版本，不让前端整块报错 */
    rows=[];
  }

  const versions=rows.map(r=>({
    version:Number(r.version)||0,
    title:r.title||'',
    content:r.content||'',
    editorName:r.editor_name||'',
    at:r.created_at||'',
    current:false
  }));
  versions.push({
    version:(Number(post.edit_count)||0)+1,
    title:post.title||'',
    content:post.content||'',
    editorName:'',
    at:post.edited_at||post.created_at||'',
    current:true
  });

  return json({versions,editCount:Number(post.edit_count)||0});
}
