import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin,updateBadge
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/badges/:id —— 管理员编辑徽章（名称/图标/说明/炫彩）
   body: { name, icon(可空=纯文字), desc, effect(0~5) } */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可编辑徽章'},403);
  await ensureSchema(env);
  const badgeId=String(params.id||'');
  const b=await readBody(request);
  const r=await updateBadge(env,badgeId,{
    name:b.name,icon:b.icon,desc:b.desc,effect:b.effect
  });
  if(!r)return json({error:'徽章不存在'},404);
  if(r.error)return json({error:r.error},400);
  return json({ok:true,badge:r});
}
