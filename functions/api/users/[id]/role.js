import {
  json,readBody,preflight,ensureSchema,publicUser,getAuthUser
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/users/:id/role —— 最高权限管理员 设/撤管理员
   body: { role: 3 | 1 }   3=设为管理员，1=取消管理员
   仅 role>=4（最高权限管理员）可操作；不能操作自己；不能变更其他最高权限管理员 */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(Number(me.role)<4)return json({error:'仅最高权限管理员可设置或取消管理员'},403);
  if(params.id===me.id)return json({error:'不能对自己执行该操作'},400);
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'用户不存在'},404);
  if(Number(row.role)>=4)return json({error:'不能变更其他最高权限管理员的权限'},400);
  const b=await readBody(request);
  const role=Number(b.role);
  if(role!==3&&role!==1)return json({error:'role 只能是 3（管理员）或 1（普通成员）'},400);
  await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role,params.id).run();
  const fresh=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(params.id).first();
  return json({ok:true,user:publicUser(fresh)});
}
