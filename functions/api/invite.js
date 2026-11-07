import {json,preflight,ensureSchema,getAuthUser,genId,nowStr} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

export async function onRequestGet({request,env}){
 try{
  await ensureSchema(env);
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'未登录'},401);
  const uid=String(me.id||'');
  if(!uid)return json({error:'会话失效'},401);

  let code=me.invite_code||me.inviteCode||'';
  if(!code){
    code=genId('INV').slice(0,8).toUpperCase();
    await env.DB.prepare('UPDATE users SET invite_code=? WHERE id=?').bind(code,uid).run();
  }

  // 查邀请记录
  const invRes=await env.DB.prepare('SELECT invitee_id FROM invitations WHERE inviter_id=? ORDER BY created_at DESC').bind(uid).all();
  const invRows=invRes.results||[];
  const invited=[];
  for(const r of invRows.slice(0,10)){
    const u=await env.DB.prepare('SELECT name,login,created_at FROM users WHERE id=?').bind(r.invitee_id).first();
    if(u)invited.push(u);
  }
  return json({code,count:invRows.length,invited});
 }catch(e){
  return json({error:String((e&&e.message)||e)},500);
 }
}
