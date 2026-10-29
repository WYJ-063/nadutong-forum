import {
  json,readBody,preflight,ensureSchema,getAuthUser,genId,
  addPoints,POINTS_RULE,nowStr,
  isAdmin,ANNOUNCEMENT_BOARD,moderationBlock,levelOfPoints,userInfoMap
} from '../_lib.js';
/* 为帖子创建投票（含选项） */
async function createPoll(env,postId,poll,createdAt){
  const pollId=genId('pl');
  const question=String(poll.question||'').trim();
  const multi=poll.multi?1:0;
  const options=Array.isArray(poll.options)?poll.options.slice(0,8):[];
  if(options.length<2)return null;
  await env.DB.prepare(
    `INSERT INTO polls (id,post_id,question,multi,created_at) VALUES (?,?,?,?,?)`)
    .bind(pollId,postId,question,multi,createdAt).run();
  options.forEach((t,i)=>{
    const oid=genId('po');
    env.DB.prepare(
      `INSERT INTO poll_options (id,poll_id,text,pos) VALUES (?,?,?,?)`)
      .bind(oid,pollId,String(t),i).run();
  });
  return pollId;
}

export async function onRequestOptions(){ return preflight(); }

/* 把一行 post 记录 + 投票/回复统计，归一化为前端形状 */
function shapePost(row,votes,replyCount,lastActivityAt,authorInfo){
  return {
    id:row.id,
    board:row.board,
    title:row.title,
    content:row.content,
    authorId:row.author_id,
    authorName:row.author_name,
    authorLevel:authorInfo?authorInfo.level:0,
    authorLevelName:authorInfo?authorInfo.levelName:'',
    authorAvatar:authorInfo?authorInfo.avatar:'',
    createdAt:row.created_at,
    lastActivityAt:lastActivityAt||row.created_at,
    pinned:!!row.pinned,
    views:Number(row.views)||0,
    votes:votes||[],
    replyCount:replyCount||0
  };
}
/* 整体热度：点赞*3 + 回复*2 + 浏览/10 */
function postHeat(p){
  return p.votes.length*3+p.replyCount*2+Math.floor((p.views||0)/10);
}

/* GET /api/posts?board=&sort= */
export async function onRequestGet({request,env}){
  await ensureSchema(env);
  const url=new URL(request.url);
  const board=url.searchParams.get('board');
  const sort=url.searchParams.get('sort')||'latest';
  const me=await getAuthUser(request,env);

  let q=env.DB.prepare('SELECT * FROM posts');
  if(board&&board!=='全部')
    q=env.DB.prepare('SELECT * FROM posts WHERE board=?').bind(board);
  const {results}=await q.all();
  const posts=results||[];
  if(!posts.length)return json({posts:[]});

  const ids=posts.map(p=>p.id);
  const placeholders=ids.map(()=>'?').join(',');
  /* 帖子点赞 */
  const likesRes=await env.DB.prepare(
    `SELECT target_id,user_id FROM likes
     WHERE target_type='post' AND target_id IN (${placeholders})`)
    .bind(...ids).all();
  const votesMap={};
  (likesRes.results||[]).forEach(l=>{
    (votesMap[l.target_id]=votesMap[l.target_id]||[]).push(l.user_id);
  });
  /* 回复数 + 最近回复时间 */
  const repRes=await env.DB.prepare(
    `SELECT post_id,COUNT(*) AS n,MAX(created_at) AS last_at FROM replies
     WHERE post_id IN (${placeholders}) GROUP BY post_id`)
    .bind(...ids).all();
  const repMap={},lastMap={};
  (repRes.results||[]).forEach(r=>{repMap[r.post_id]=r.n;lastMap[r.post_id]=r.last_at;});

  /* 作者等级/头像 */
  const uMap=await userInfoMap(env,posts.map(p=>p.author_id));
  let list=posts.map(p=>shapePost(p,votesMap[p.id],repMap[p.id],lastMap[p.id],uMap[p.author_id]));
  list.sort((a,b)=>{
    if(a.pinned!==b.pinned)return a.pinned?-1:1;
    if(sort==='hot')return postHeat(b)-postHeat(a);
    /* 最新：按最近活动（回复或发布）时间 */
    return new Date(b.lastActivityAt)-new Date(a.lastActivityAt);
  });
  return json({posts:list,viewer:me?me.id:null});
}

/* POST /api/posts （需登录） */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  const board=String(b.board||'异人讨论').trim();
  const title=String(b.title||'').trim();
  const content=String(b.content||'').trim();
  if(!title)return json({error:'请填写标题'},400);
  if(!content)return json({error:'请填写内容'},400);
  /* 公告分类仅管理员可发帖 */
  if(board===ANNOUNCEMENT_BOARD&&!isAdmin(me))
    return json({error:'「公告」分类仅管理员可发布'},403);
  /* 封禁 / 禁言校验 */
  const block=moderationBlock(me);
  if(block)return json({error:block},403);
  await ensureSchema(env);
  const id=genId('p');
  const createdAt=nowStr();
  await env.DB.prepare(
    `INSERT INTO posts (id,board,title,content,author_id,author_name,pinned,views,created_at)
     VALUES (?,?,?,?,?,?,0,0,?)`)
    .bind(id,board,title,content,me.id,me.name,createdAt).run();
  /* 投票（可选） */
  if(b.poll&&Array.isArray(b.poll.options)&&b.poll.options.length>=2)
    await createPoll(env,id,b.poll,createdAt);
  await addPoints(env,me.id,POINTS_RULE.post);
  const row=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  return json({post:shapePost(row,[],0)});
}
