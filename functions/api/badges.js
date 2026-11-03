import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin,
  getBadgeCatalog,createBadge
} from './_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/badges —— 徽章全目录（登录即可查看） */
export async function onRequestGet({request,env}){
  await ensureSchema(env);
  return json({badges:await getBadgeCatalog(env)});
}

/* POST /api/badges —— 管理员自建徽章
   body: { name, icon(可空=纯文字), desc, effect(0~5) }；kind 固定为 manual（手动发放称号） */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可创建徽章'},403);
  await ensureSchema(env);
  const b=await readBody(request);
  const name=String(b.name||'').trim();
  if(!name)return json({error:'请填写徽章名称'},400);
  if(name.length>20)return json({error:'徽章名称不能超过20字'},400);
  const icon=String(b.icon||'').trim().slice(0,8);
  const desc=String(b.desc||'').trim().slice(0,100);
  const effect=String(b.effect||'0');
  const badge=await createBadge(env,{name,icon,desc,effect});
  return json({ok:true,badge},201);
}
