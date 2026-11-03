import {
  json,preflight,ensureSchema,getAuthUser,getUserBadges
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/users/me/badges —— 当前登录用户的全部徽章（轻量，用于新徽章检测） */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  return json({badges:await getUserBadges(env,me.id)});
}
