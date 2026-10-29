import {
  json,preflight,ensureSchema,shapePostList
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* 把用户输入转成 FTS5 安全的双引号短语（避免特殊语法） */
function ftsPhrase(q){
  return '"'+String(q).replace(/"/g,'""')+'"';
}

/* GET /api/search?q= —— 帖子标题/正文全文搜索（FTS5 trigram，短词/失败回退 LIKE） */
export async function onRequestGet({request,env}){
  await ensureSchema(env);
  const term=String(new URL(request.url).searchParams.get('q')||'').trim();
  if(!term)return json({posts:[],q:''});

  let rows=null;
  /* trigram 至少需 3 个字符才能形成三元组，短词直接走 LIKE */
  if([...term].length>=3){
    try{
      const r=await env.DB.prepare(
        `SELECT p.* FROM posts_fts f JOIN posts p ON p.rowid=f.rowid
         WHERE posts_fts MATCH ? ORDER BY f.rank LIMIT 50`)
        .bind(ftsPhrase(term)).all();
      rows=r.results||[];
    }catch(e){ rows=null; }
  }
  /* FTS 失败（null）或命中 0 条时，回退 LIKE 兜底，避免漏召回 */
  if(rows===null||rows.length===0){
    const safe=term.replace(/[%_\\]/g,m=>'\\'+m);
    const like='%'+safe+'%';
    const r=await env.DB.prepare(
      `SELECT * FROM posts
       WHERE title LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\'
       ORDER BY created_at DESC LIMIT 50`)
      .bind(like,like).all();
    rows=r.results||[];
  }
  const posts=await shapePostList(env,rows);
  return json({posts,q:term});
}
