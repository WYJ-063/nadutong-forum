import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/posts/:id/hidden —— 管理员限制 / 解除限制观看
   body: { hidden?: boolean }；不传则切换当前状态。
   限制后：列表里仍显示标题，作者本人与管理员可正常浏览，
   其他访客打开详情得到 403：
   「本帖违反云端论坛守则已被禁止观看，请遵守云端论坛守则」。 */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可限制帖子观看'},403);
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'帖子不存在或已被删除'},404);
  const b=await readBody(request);
  const next=Object.prototype.hasOwnProperty.call(b,'hidden')
    ? !!b.hidden
    : !Number(row.hidden);
  await env.DB.prepare('UPDATE posts SET hidden=? WHERE id=?')
    .bind(next?1:0,params.id).run();
  return json({ok:true,id:params.id,hidden:next});
}
