import {
  json,readBody,preflight,ensureSchema,publicUser,getAuthUser,isAdmin
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/users/:id —— 公开资料 + 发帖/回复数 */
export async function onRequestGet({request,env,params}){
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'用户不存在'},404);
  const pc=await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM posts WHERE author_id=?').bind(params.id).first();
  const rc=await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM replies WHERE author_id=?').bind(params.id).first();
  const u=publicUser(row);
  u.postCount=Number(pc.n)||0;
  u.replyCount=Number(rc.n)||0;
  return json({user:u});
}

/* POST /api/users/:id  —— 管理员禁言 / 解除禁言 / 拉黑 / 解除拉黑
   body: { action: 'mute'|'unmute'|'ban'|'unban' } */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可执行该操作'},403);
  if(params.id===me.id)return json({error:'不能对自己执行该操作'},400);
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'用户不存在'},404);
  const b=await readBody(request);
  const action=String(b.action||'');
  let muted=Number(row.muted)||0, banned=Number(row.banned)||0;
  if(action==='mute')muted=1;
  else if(action==='unmute')muted=0;
  else if(action==='ban'){banned=1;muted=0;}
  else if(action==='unban'){banned=0;muted=0;}
  else return json({error:'未知操作'},400);
  await env.DB.prepare('UPDATE users SET muted=?,banned=? WHERE id=?')
    .bind(muted,banned,params.id).run();
  const fresh=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(params.id).first();
  return json({ok:true,user:publicUser(fresh)});
}
