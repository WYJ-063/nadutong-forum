import {json,preflight,ensureSchema,getAuthUser} from './_lib.js';
import {ensureInviteTable,inviteCodeOf,INVITE_POINTS} from './_invite.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/invite —— 返回我的邀请码、已邀请人数与最近邀请的成员
   旧实现读 users.invite_code（无此列）并写 invitations（无此表），必定 500。 */
export async function onRequestGet({request,env}){
 try{
  await ensureSchema(env);
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'未登录'},401);
  const uid=String(me.id||'');
  if(!uid)return json({error:'会话失效'},401);

  await ensureInviteTable(env);
  const code=inviteCodeOf(uid);

  const {results}=await env.DB.prepare(
    `SELECT u.name,u.login FROM invitations i
     JOIN users u ON u.id=i.invitee_id
     WHERE i.inviter_id=?
     ORDER BY i.created_at DESC LIMIT 10`).bind(uid).all();
  const invited=results||[];
  const cnt=await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM invitations WHERE inviter_id=?').bind(uid).first();

  return json({
    code,
    count:Number(cnt&&cnt.n)||invited.length,
    invited,
    reward:INVITE_POINTS
  });
 }catch(e){
  return json({error:String((e&&e.message)||e)},500);
 }
}
