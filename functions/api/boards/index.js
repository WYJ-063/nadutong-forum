import {
  json,readBody,preflight,ensureSchema,getAuthUser,
  isAdmin,nowStr
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/boards —— 全部板块（含每个板块的帖子数） */
export async function onRequestGet({request,env}){
  await ensureSchema(env);
  const {results}=await env.DB.prepare('SELECT * FROM boards ORDER BY rowid').all();
  const boards=results||[];
  const counts={};
  if(boards.length){
    const names=boards.map(b=>b.name);
    const ph=names.map(()=>'?').join(',');
    const rc=await env.DB.prepare(
      `SELECT board,COUNT(*) AS n FROM posts WHERE board IN (${ph}) GROUP BY board`)
      .bind(...names).all();
    (rc.results||[]).forEach(r=>{counts[r.board]=r.n;});
  }
  return json({boards:boards.map(b=>({name:b.name,postCount:counts[b.name]||0,
    createdBy:b.created_by,createdAt:b.created_at}))});
}

/* POST /api/boards —— 管理员新建板块 body: { name } */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可新建板块'},403);
  const b=await readBody(request);
  const name=String(b.name||'').trim();
  if(!name)return json({error:'请填写板块名称'},400);
  if(name.length>12)return json({error:'板块名称过长（最多12字）'},400);
  await ensureSchema(env);
  const exist=await env.DB.prepare('SELECT name FROM boards WHERE name=?').bind(name).first();
  if(exist)return json({error:'该板块已存在'},400);
  await env.DB.prepare('INSERT INTO boards (name,created_by,created_at) VALUES (?,?,?)')
    .bind(name,me.id,nowStr()).run();
  return json({ok:true,board:{name,postCount:0}});
}
