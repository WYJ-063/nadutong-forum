import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin,grantBadge
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/badges/grant —— 管理员/超管手动发放徽章
   body: { userId, badgeId } */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可发放徽章'},403);
  await ensureSchema(env);
  const b=await readBody(request);
  const userId=String(b.userId||'');
  const badgeId=String(b.badgeId||'');
  if(!userId||!badgeId)return json({error:'参数不完整'},400);
  const user=await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(userId).first();
  if(!user)return json({error:'用户不存在'},404);
  const granted=await grantBadge(env,userId,badgeId,me.id);
  return json({ok:true,granted});
}
