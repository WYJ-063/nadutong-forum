import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/posts/:id/pin  —— 管理员置顶 / 取消置顶
   body: { pinned?: boolean }；不传则切换当前状态 */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可置顶/取消置顶'},403);
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'帖子不存在或已被删除'},404);
  const b=await readBody(request);
  const next=Object.prototype.hasOwnProperty.call(b,'pinned')
    ? !!b.pinned
    : !Number(row.pinned);
  await env.DB.prepare('UPDATE posts SET pinned=? WHERE id=?')
    .bind(next?1:0,params.id).run();
  return json({ok:true,id:params.id,pinned:next});
}
