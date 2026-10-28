import {
  json,readBody,preflight,ensureSchema,getAuthUser
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/notifications?filter=all|unread|read —— 当前用户的通知 */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({notifications:[],unread:0,total:0});
  await ensureSchema(env);
  const url=new URL(request.url);
  const filter=url.searchParams.get('filter')||'all';
  const {results}=await env.DB.prepare(
    'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC').bind(me.id).all();
  const all=(results||[]).map(r=>({
    id:r.id,type:r.type,actorId:r.actor_id,actorName:r.actor_name,
    targetType:r.target_type,targetId:r.target_id,postId:r.post_id,
    postTitle:r.post_title,excerpt:r.excerpt,read:!!r.read,createdAt:r.created_at
  }));
  const unread=all.filter(n=>!n.read).length;
  let list=all;
  if(filter!=='all')list=all.filter(n=>filter==='unread'?!n.read:!!n.read);
  return json({notifications:list,unread,total:all.length});
}

/* POST /api/notifications { action:'read'|'clear', id? } */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  await ensureSchema(env);
  if(b.action==='clear'){
    await env.DB.prepare(
      'DELETE FROM notifications WHERE user_id=? AND read=1').bind(me.id).run();
    return json({ok:true});
  }
  if(b.action==='readPost'&&b.postId){
    await env.DB.prepare(
      'UPDATE notifications SET read=1 WHERE user_id=? AND post_id=?').bind(me.id,b.postId).run();
    return json({ok:true});
  }
  if(b.id){
    await env.DB.prepare(
      'UPDATE notifications SET read=1 WHERE user_id=? AND id=?').bind(me.id,b.id).run();
  }else{
    await env.DB.prepare(
      'UPDATE notifications SET read=1 WHERE user_id=?').bind(me.id).run();
  }
  return json({ok:true});
}
