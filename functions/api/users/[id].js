import {
  json,readBody,preflight,ensureSchema,publicUser,getAuthUser,isAdmin,
  shapePostList,shapeReplyList
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/users/:id —— 公开资料 + 统计 + 最近帖子/回复（个人主页） */
export async function onRequestGet({request,env,params}){
  await ensureSchema(env);
  const uid=params.id;
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(uid).first();
  if(!row)return json({error:'用户不存在'},404);
  const u=publicUser(row);

  /* 统计 */
  const pc=await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM posts WHERE author_id=?').bind(uid).first();
  const rc=await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM replies WHERE author_id=?').bind(uid).first();
  const ec=await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM posts WHERE author_id=? AND essence=1').bind(uid).first();
  /* 收到的赞：其帖子 + 其回复被点赞的总数 */
  const pl=await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM likes
     WHERE target_type='post' AND target_id IN (SELECT id FROM posts WHERE author_id=?)`)
    .bind(uid).first();
  const rl=await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM likes
     WHERE target_type='reply' AND target_id IN (SELECT id FROM replies WHERE author_id=?)`)
    .bind(uid).first();
  u.postCount=Number(pc.n)||0;
  u.replyCount=Number(rc.n)||0;
  u.essenceCount=Number(ec.n)||0;
  u.likedCount=Number(pl.n)+Number(rl.n);

  /* 签到信息 */
  const ck=await env.DB.prepare('SELECT * FROM checkins WHERE user_id=?').bind(uid).first();
  u.checkin={streak:Number(ck&&ck.streak)||0,totalDays:Number(ck&&ck.total_days)||0};

  /* 最近帖子（10） */
  const pRows=await env.DB.prepare(
    'SELECT * FROM posts WHERE author_id=? ORDER BY created_at DESC LIMIT 10').bind(uid).all();
  const posts=await shapePostList(env,pRows.results||[]);
  /* 最近回复（10），并带上所属帖子标题 */
  const rRows=await env.DB.prepare(
    'SELECT * FROM replies WHERE author_id=? ORDER BY created_at DESC LIMIT 10').bind(uid).all();
  const replies=await shapeReplyList(env,rRows.results||[]);
  if(replies.length){
    const postIds=[...new Set(replies.map(r=>r.postId))];
    const ph=postIds.map(()=>'?').join(',');
    const tRes=await env.DB.prepare(
      `SELECT id,title FROM posts WHERE id IN (${ph})`).bind(...postIds).all();
    const titleMap={};
    (tRes.results||[]).forEach(p=>{titleMap[p.id]=p.title;});
    replies.forEach(r=>{r.postTitle=titleMap[r.postId]||'';});
  }
  return json({user:u,posts,replies});
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
  if(Number(me.role)<4&&Number(row.role)>=4)return json({error:'无权对最高权限管理员执行该操作'},403);
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
  const row=await env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(params.id).first();
  if(!row)return json({error:'用户不存在'},404);
  if(Number(me.role)<4&&Number(row.role)>=4)return json({error:'无权对最高权限管理员执行该操作'},403);
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
