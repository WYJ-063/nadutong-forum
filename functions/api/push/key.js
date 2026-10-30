import {
  json,preflight,ensureSchema,getAuthUser,getVapidKeys
} from '../_lib.js';

export function onRequestOptions(){ return preflight(); }

/* GET /api/push/key —— 返回 VAPID 公钥（base64url），供 pushManager.subscribe 使用 */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const vapid=await getVapidKeys(env);
  return json({publicKey:vapid.publicB64u});
}
