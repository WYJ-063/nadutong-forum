import {
  json,readBody,preflight,ensureSchema,getAuthUser,genId,
  addPoints,POINTS_RULE,nowStr,processMentions,
  isAdmin,ANNOUNCEMENT_BOARD,moderationBlock,shapePostRow,shapePostList,
  grantActivityBadge,userInfoMap
} from '../_lib.js';
/* 为帖子创建投票（含选项） */
async function createPoll(env,postId,poll,createdAt){
  const pollId=genId('pl');
  /* 截断而不是报错：投票是发帖的附属功能，标题稍长不该连带让整帖发不出去 */
  const question=String(poll.question||'').trim().slice(0,100);
  const multi=poll.multi?1:0;
  const options=Array.isArray(poll.options)?poll.options.slice(0,8):[];
  if(options.length<2)return null;
  
  await env.DB.prepare(
    `INSERT INTO polls (id,post_id,question,multi,created_at) VALUES (?,?,?,?,?)`)
    .bind(pollId,postId,question,multi,createdAt).run();
  /* 必须等待选项写入完成：Worker 返回响应后可能被回收，未 await 的写入会丢失，
     导致投票只有标题、没有选项。 */
  await Promise.all(options.map((t,i)=>{
    const oid=genId('po');
    return env.DB.prepare(
      `INSERT INTO poll_options (id,poll_id,text,pos) VALUES (?,?,?,?)`)
      .bind(oid,pollId,String(t).slice(0,60),i).run();
  }));
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

  /* 排序分页下推到 SQL，只把当前页的行交给 shapePostList。
     旧实现会先拉整表 + 全站点赞/回复聚合再在内存排序，帖子越多越慢；
     这里保留一条与旧实现等价的兜底路径，SQL 出错时自动回退。 */
  const pinFirst=!(essenceOnly||author);
  let pageRows=null;
  try{
    const orderBy=sort==='hot'
      ? `(SELECT COUNT(*) FROM likes l WHERE l.target_type='post' AND l.target_id=p.id)*3
         +(SELECT COUNT(*) FROM replies r2 WHERE r2.post_id=p.id)*2
         +CAST(p.views AS INTEGER)/10 DESC`
      : 'COALESCE(MAX(r.created_at),p.created_at) DESC';
    const sql=`SELECT p.*,MAX(r.created_at) AS last_at
      FROM posts p LEFT JOIN replies r ON r.post_id=p.id
      ${where}
      GROUP BY p.id
      ORDER BY ${pinFirst?'p.pinned DESC,':''}${orderBy}
      LIMIT ? OFFSET ?`;
    const res=await env.DB.prepare(sql).bind(...binds,limit,offset).all();
    pageRows=res.results||[];
  }catch(e){ pageRows=null; }

  if(pageRows){
    const page=await shapePostList(env,pageRows);
    return json({
      posts:page,total,limit,offset,
      hasMore:offset+pageRows.length<total,
      viewer:me?me.id:null
    });
  }

  /* 兜底：旧逻辑（整表取回后内存排序） */
  const all=await env.DB.prepare('SELECT * FROM posts '+where).bind(...binds).all();
  let list=await shapePostList(env,all.results||[]);
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
  /* 长度上限：D1 单行约 1MB，正文允许嵌 base64 图片标记，
     不挡住超长内容就会写库失败直接返回 500，而不是给出可读提示。 */
  if([...title].length>100)return json({error:'标题最多 100 个字'},400);
  if([...content].length>20000)return json({error:'正文最多 20000 个字（含图片标记）'},400);
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
  /* 活动徽章：活动窗口内发帖自动授予「我来也」（幂等，异常不影响发帖） */
  try{ await grantActivityBadge(env,me.id); }catch(e){ /* 忽略 */ }
  /* @提及：给正文中被点名的真实成员发系统通知 + Web Push（异常不影响发帖） */
  try{
    await processMentions(env,{
      content,actorId:me.id,actorName:me.name,
      targetType:'post',targetId:id,postId:id,postTitle:title
    });
  }catch(e){ /* 提及失败不阻断发帖主流程 */ }
  const row=await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
  /* 补上作者等级/头像/佩戴徽章：旧实现传空 authorInfo，新帖一发布就显示 Lv0、没有称号，
     要等重新拉一次列表才恢复正常。这里与列表接口保持同一口径。 */
  const info=await userInfoMap(env,[me.id]);
  return json({post:shapePostRow(row,[],0,row.created_at,info[me.id]||{})});
}
