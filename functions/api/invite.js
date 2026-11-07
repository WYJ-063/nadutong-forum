import {json,preflight,ensureSchema,getAuthUser,genId,nowStr} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

export async function onRequestGet({request,env}){
 try{
  await ensureSchema(env);
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'未登录'},401);
  let code=me.invite_code||me.inviteCode;
  if(!code){
    code=genId('INV').slice(0,8).toUpperCase();
    await env.DB.prepare('UPDATE users SET invite_code=? WHERE id=?').bind(code,me.id).run();
  }
  const {results}=await env.DB.prepare(
    `SELECT u.name,u.login,u.created_at FROM invitations i JOIN users u ON u.id=i.invitee_id WHERE i.inviter_id=? ORDER BY i.created_at DESC`)
    .bind(me.id).all();
  const invited=results||[];
  return json({code,count:invited.length,invited});
 }catch(e){
  return json({error:String(e&&e.message||e)},500);
 }
}
