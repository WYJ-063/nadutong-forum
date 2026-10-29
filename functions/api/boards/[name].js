import {
  json,readBody,preflight,ensureSchema,getAuthUser,isAdmin
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* DELETE /api/boards/:name —— 管理员删除板块；其下帖子移动到「灌水」
   body 可选 { mode:'move'|'delete' }，默认 move */
export async function onRequestDelete({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可删除板块'},403);
  const name=decodeURIComponent(params.name);
  if(name==='公告')return json({error:'系统公告板块不能删除'},400);
  await ensureSchema(env);
  const board=await env.DB.prepare('SELECT name FROM boards WHERE name=?').bind(name).first();
  if(!board)return json({error:'板块不存在'},404);
  const b=await readBody(request);
  const mode=b.mode==='delete'?'delete':'move';

  /* 统计该板块帖子 */
  const pc=await env.DB.prepare('SELECT id FROM posts WHERE board=?').bind(name).all();
  const postIds=(pc.results||[]).map(p=>p.id);
  if(mode==='delete'){
    if(postIds.length){
      const ph=postIds.map(()=>'?').join(',');
      const rc=await env.DB.prepare(
        `SELECT id FROM replies WHERE post_id IN (${ph})`).bind(...postIds).all();
      const rids=(rc.results||[]).map(r=>r.id);
      if(rids.length){
        const rph=rids.map(()=>'?').join(',');
        await env.DB.prepare(
          `DELETE FROM likes WHERE target_type='reply' AND target_id IN (${rph})`).bind(...rids).run();
      }
      await env.DB.prepare(`DELETE FROM replies WHERE post_id IN (${ph})`).bind(...postIds).run();
      await env.DB.prepare(
        `DELETE FROM likes WHERE target_type='post' AND target_id IN (${ph})`).bind(...postIds).run();
      await env.DB.prepare(`DELETE FROM posts WHERE id IN (${ph})`).bind(...postIds).run();
    }
  }else{
    /* 移动到灌水（若灌水不存在则保留为公告） */
    const fallback=await env.DB.prepare('SELECT name FROM boards WHERE name=?').bind('灌水').first();
    const target=fallback?'灌水':null;
    if(target)await env.DB.prepare('UPDATE posts SET board=? WHERE board=?').bind(target,name).run();
  }
  await env.DB.prepare('DELETE FROM boards WHERE name=?').bind(name).run();
  return json({ok:true,affectedPosts:postIds.length,mode});
}
