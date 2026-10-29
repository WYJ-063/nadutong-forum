import {
  json,readBody,preflight,ensureSchema,getAuthUser,genId,
  addPoints,POINTS_RULE,nowStr,
  isAdmin,ANNOUNCEMENT_BOARD,moderationBlock,shapePostRow,shapePostList
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

/* 整体热度：点赞*3 + 回复*2 + 浏览/10 */
function postHeat(p){
  return p.votes.length*3+p.replyCount*2+Math.floor((p.views||0)/10);
}

/* GET /api/posts?board=&author=&essence=&sort=&limit=&offset= */
export async function onRequestGet({request,env}){
  await ensureSchema(env);
  const url=new URL(request.url);
  const board=url.searchParams.get('board');
  const author=url.searchParams.get('author');
  const essenceOnly=url.searchParams.get('essence')==='1';
  const sort=url.searchParams.get('sort')||'latest';
  const me=await getAuthUser(request,env);
  const PAGE=20;
  const limit=Math.min(50,Math.max(1,parseInt(url.searchParams.get('limit')||PAGE,10)||PAGE));
  const offset=Math.max(0,parseInt(url.searchParams.get('offset')||0,10)||0);

  /* 组合过滤条件 */
  const conds=[],binds=[];
  if(board&&board!=='全部'){conds.push('board=?');binds.push(board);}
  if(author){conds.push('author_id=?');binds.push(author);}
  if(essenceOnly){conds.push('essence=1');}
  const where=conds.length?'WHERE '+conds.join(' AND '):'';

  const cntRow=await env.DB.prepare('SELECT COUNT(*) AS n FROM posts '+where).bind(...binds).first();
  const total=Number(cntRow&&cntRow.n)||0;
  if(!total)return json({posts:[],total,limit,offset,hasMore:false,viewer:me?me.id:null});

  /* 热度/最近活动需在归一化后排序，故先取全部匹配行再分页 */
  const all=await env.DB.prepare('SELECT * FROM posts '+where).bind(...binds).all();
  let list=await shapePostList(env,all.results||[]);
  /* 仅在常规论坛浏览时让置顶帖优先；精华/作者主页不插入置顶优先级 */
  const pinFirst=!(essenceOnly||author);
  list.sort((a,b)=>{
    if(pinFirst&&a.pinned!==b.pinned)return a.pinned?-1:1;
    if(sort==='hot')return postHeat(b)-postHeat(a);
    return new Date(b.lastActivityAt)-new Date(a.lastActivityAt);
  });
  const page=list.slice(offset,offset+limit);
  return json({
    posts:page,total,limit,offset,
    hasMore:offset+limit<list.length,
    viewer:me?me.id:null
  });
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
  /* 投票（可选）— FTS 由触发器自动同步 */
  if(b.poll&&Array.isArray(b.poll.options)&&b.poll.options.length>=2)
    await createPoll(env,id,b.poll,createdAt);
  await addPoints(env,me.id,POINTS_RULE.post);
  const row=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  return json({post:shapePostRow(row,[],0)});
}
