import {
  json,preflight,ensureSchema,getAuthUser,isAdmin,publicUser
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/users —— 管理员获取全部成员（用于禁言/拉黑管理） */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可查看成员列表'},403);
  await ensureSchema(env);
  const {results}=await env.DB.prepare('SELECT * FROM users ORDER BY created_at').all();
  const users=(results||[]).map(publicUser);
  return json({users,viewer:me.id});
}
