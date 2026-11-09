import { json,preflight,getAuthUser,publicUserFull } from '../_lib.js';
import { syncInviteBadges } from '../_invite.js';

export async function onRequestOptions(){ return preflight(); }

export async function onRequestGet({request,env}){
  const row=await getAuthUser(request,env);
  if(!row)return json({error:'未登录'},401);
  /* 邀请里程碑徽章：历史邀请漏发的，在这里补一次（幂等，失败不影响登录）。
     放在 publicUserFull 之前，补到的徽章会立刻出现在本次返回的 badge 字段里。 */
  try{ await syncInviteBadges(env,String(row.id||'')); }catch(e){}
  return json({user:await publicUserFull(env,row)});
}
