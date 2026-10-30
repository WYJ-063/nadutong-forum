import {
  json,preflight,ensureSchema,getAuthUser,levelOfPoints
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/users/mention?q= —— 登录用户搜索成员（@提及选择用）。
   仅返回最小公开字段（id/name/avatar/level/levelName），
   不含积分、角色、禁言/封禁、登录名等管理或敏感字段，最多 8 条。 */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  await ensureSchema(env);
  const q=String(new URL(request.url).searchParams.get('q')||'').trim();
  let rows;
  if(q){
    const safe=q.replace(/[%_\\]/g,m=>'\\'+m);
    const like='%'+safe+'%';
    rows=await env.DB.prepare(
      `SELECT * FROM users
       WHERE name LIKE ? ESCAPE '\\' OR login LIKE ? ESCAPE '\\'
       ORDER BY points DESC, created_at LIMIT 8`).bind(like,like).all();
  }else{
    /* 无关键词时给一份活跃成员兜底，便于直接挑选 */
    rows=await env.DB.prepare(
      'SELECT * FROM users ORDER BY points DESC, created_at LIMIT 8').all();
  }
  const users=(rows.results||[]).map(r=>{
    const g=levelOfPoints(Number(r.points)||0);
    return {id:r.id,name:r.name,avatar:r.avatar||'',level:g.level,levelName:g.name};
  });
  return json({users});
}
