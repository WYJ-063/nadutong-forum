import { json,preflight,ensureSchema,publicUser } from '../_lib.js';

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
