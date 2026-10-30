import {
  json,readBody,preflight,ensureSchema,getAuthUser,nowStr
} from '../_lib.js';

export function onRequestOptions(){ return preflight(); }

/* POST /api/push/subscribe
   body: { subscription:{ endpoint, keys:{ p256dh, auth } } }
   同一 endpoint 幂等 upsert；同一设备换账号登录时归属更新为最新用户 */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  const s=b.subscription||{};
  const endpoint=String(s.endpoint||'').trim();
  const p256dh=String((s.keys&&s.keys.p256dh)||'').trim();
  const auth=String((s.keys&&s.keys.auth)||'').trim();
  if(!endpoint||!p256dh||!auth)return json({error:'订阅信息不完整'},400);
  await ensureSchema(env);
  const ua=String(request.headers.get('user-agent')||'').slice(0,200);
  await env.DB.prepare(
    `INSERT INTO push_subscriptions (endpoint,user_id,p256dh,auth,user_agent,created_at)
     VALUES (?,?,?,?,?,?)
     ON CONFLICT(endpoint) DO UPDATE SET
       user_id=excluded.user_id,
       p256dh=excluded.p256dh,
       auth=excluded.auth,
       user_agent=excluded.user_agent,
       created_at=excluded.created_at`)
    .bind(endpoint,me.id,p256dh,auth,ua,nowStr()).run();
  return json({ok:true});
}
