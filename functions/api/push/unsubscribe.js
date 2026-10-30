import {
  json,readBody,preflight,ensureSchema,getAuthUser
} from '../_lib.js';

export function onRequestOptions(){ return preflight(); }

/* POST /api/push/unsubscribe { endpoint? }
   带 endpoint 删除单台设备；不带则清空当前用户全部订阅。
   限定 user_id 只能操作自己的记录。 */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  const endpoint=String(b.endpoint||'').trim();
  await ensureSchema(env);
  if(endpoint){
    await env.DB.prepare(
      'DELETE FROM push_subscriptions WHERE endpoint=? AND user_id=?')
      .bind(endpoint,me.id).run();
  }else{
    await env.DB.prepare(
      'DELETE FROM push_subscriptions WHERE user_id=?').bind(me.id).run();
  }
  return json({ok:true});
}
