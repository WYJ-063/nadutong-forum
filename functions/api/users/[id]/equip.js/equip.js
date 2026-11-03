import {
  json,readBody,preflight,ensureSchema,getAuthUser,equipBadge
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/users/:id/equip —— 佩戴/卸下徽章（仅本人）
   body: { badgeId }；badgeId 传 null 或空表示卸下当前佩戴 */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(params.id!==me.id)return json({error:'只能管理自己的徽章佩戴'},403);
  await ensureSchema(env);
  const b=await readBody(request);
  const badgeId=b.badgeId?String(b.badgeId):null;
  const r=await equipBadge(env,me.id,badgeId);
  if(!r.ok)return json({error:r.error||'操作失败'},400);
  return json({ok:true});
}
