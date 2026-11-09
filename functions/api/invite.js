import {json,preflight,ensureSchema,getAuthUser} from './_lib.js';
import {ensureInviteTable,inviteCodeOf,INVITE_POINTS,INVITE_BADGES,syncInviteBadges} from './_invite.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/invite —— 返回我的邀请码、已邀请人数与最近邀请的成员。
   顺带补发里程碑徽章：老用户之前拉过人但没拿到「接引人/哪都通HR」，打开这个面板就会补上。 */
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

  /* 以 invitations 实际行数为准，并在此处补发漏发的邀请徽章 */
  let synced={count:0,granted:[]};
  try{ synced=await syncInviteBadges(env,uid); }catch(e){}
  const count=Number(synced.count)||0;

  const badges=INVITE_BADGES.map(b=>({
    id:b.id,name:b.name,icon:b.icon,effect:b.effect,need:b.need,
    got:count>=b.need
  }));

  return json({
    code,
    count,
    invited,
    reward:INVITE_POINTS,
    badges,
    justGranted:(synced.granted||[]).map(b=>({id:b.id,name:b.name,icon:b.icon}))
  });
 }catch(e){
  return json({error:String((e&&e.message)||e)},500);
 }
}
