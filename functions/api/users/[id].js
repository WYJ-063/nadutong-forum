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

/* DELETE /api/users/:id —— 管理员删除账号；级联清理其全部数据（不能删自己） */
export async function onRequestDelete({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可删除账号'},403);
  if(params.id===me.id)return json({error:'不能删除自己的账号'},400);
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'用户不存在'},404);
  const uid=params.id;

  /* 1) 该用户名下的帖子：连带删除帖下所有回复/点赞/通知 */
  const pc=await env.DB.prepare('SELECT id FROM posts WHERE author_id=?').bind(uid).all();
  const postIds=(pc.results||[]).map(p=>p.id);
  if(postIds.length){
    const ph=postIds.map(()=>'?').join(',');
    const rc=await env.DB.prepare(
      `SELECT id FROM replies WHERE post_id IN (${ph})`).bind(...postIds).all();
    const rids=(rc.results||[]).map(r=>r.id);
    if(rids.length){
      const rph=rids.map(()=>'?').join(',');
      await env.DB.prepare(
        `DELETE FROM likes WHERE target_type='reply' AND target_id IN (${rph})`).bind(...rids).run();
      await env.DB.prepare(
        `DELETE FROM notifications WHERE target_type='reply' AND target_id IN (${rph})`).bind(...rids).run();
    }
    await env.DB.prepare(
      `DELETE FROM replies WHERE post_id IN (${ph})`).bind(...postIds).run();
    await env.DB.prepare(
      `DELETE FROM likes WHERE target_type='post' AND target_id IN (${ph})`).bind(...postIds).run();
    await env.DB.prepare(
      `DELETE FROM notifications WHERE target_type='post' AND target_id IN (${ph})`).bind(...postIds).run();
    await env.DB.prepare(
      `DELETE FROM posts WHERE id IN (${ph})`).bind(...postIds).run();
  }

  /* 2) 该用户在他人帖子下的回复：先把其楼中楼子回复上移一层，再删该回复 */
  const oc=await env.DB.prepare(
    'SELECT id,parent_id FROM replies WHERE author_id=?').bind(uid).all();
  const ownReplies=(oc.results||[]);
  for(const r of ownReplies){
    await env.DB.prepare('UPDATE replies SET parent_id=? WHERE parent_id=?')
      .bind(r.parent_id||null,r.id).run();
    await env.DB.prepare(
      `DELETE FROM likes WHERE target_type='reply' AND target_id=?`).bind(r.id).run();
    await env.DB.prepare(
      `DELETE FROM notifications WHERE target_type='reply' AND target_id=?`).bind(r.id).run();
    await env.DB.prepare('DELETE FROM replies WHERE id=?').bind(r.id).run();
  }

  /* 3) 该用户点过的赞、收到的通知 */
  await env.DB.prepare('DELETE FROM likes WHERE user_id=?').bind(uid).run();
  await env.DB.prepare('DELETE FROM notifications WHERE user_id=?').bind(uid).run();
  /* 4) 账号本身 */
  await env.DB.prepare('DELETE FROM users WHERE id=?').bind(uid).run();
  return json({ok:true,deletedPosts:postIds.length,deletedReplies:ownReplies.length});
}
