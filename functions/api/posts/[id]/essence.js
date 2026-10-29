import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/posts/:id/essence —— 管理员加精 / 取消加精
   body: { essence?: boolean }；不传则切换当前状态 */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可加精/取消加精'},403);
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'帖子不存在或已被删除'},404);
  const b=await readBody(request);
  const next=Object.prototype.hasOwnProperty.call(b,'essence')
    ? !!b.essence
    : !Number(row.essence);
  await env.DB.prepare('UPDATE posts SET essence=? WHERE id=?')
    .bind(next?1:0,params.id).run();
  return json({ok:true,id:params.id,essence:next});
}
