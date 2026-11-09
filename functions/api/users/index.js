import {
  json,preflight,ensureSchema,getAuthUser,isAdmin,publicUser,normEffect
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* GET /api/users —— 管理员获取全部成员（用于禁言/拉黑/发徽章管理）
   旧实现是每个用户各查一次佩戴徽章 + 一次档案（2N 次查询），
   成员一多就会超出 Workers 的子请求上限直接 500；这里改为固定 3 次查询。 */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可查看成员列表'},403);
  await ensureSchema(env);
  const {results}=await env.DB.prepare('SELECT * FROM users ORDER BY created_at').all();
  const rows=results||[];
  if(!rows.length)return json({users:[],viewer:me.id});

  /* 批量取佩戴徽章（只取 equipped=1，按用户去重保留第一条） */
  const badgeMap={};
  const badgeRes=await env.DB.prepare(
    `SELECT ub.user_id,b.id,b.name,b.icon,b.desc,b.effect
     FROM user_badges ub JOIN badges b ON b.id=ub.badge_id
     WHERE ub.equipped=1`).all();
  (badgeRes.results||[]).forEach(r=>{
    if(badgeMap[r.user_id])return;
    /* 用共享的 normEffect（0~15）而不是本地写死的 0~5：
       否则 6~15 号炫彩在成员管理页会被降级成「无特效」，与管理端看到的徽章不一致。 */
    badgeMap[r.user_id]={id:r.id,name:r.name,icon:r.icon||'',desc:r.desc,
      effect:normEffect(r.effect)};
  });

  /* 批量取异人档案 */
  const profMap={};
  const profRes=await env.DB.prepare('SELECT * FROM user_profiles').all();
  (profRes.results||[]).forEach(r=>{
    profMap[r.user_id]={faction:r.faction||'',bio:r.bio||'',gender:r.gender||'',
      city:r.city||'',birthday:r.birthday||''};
  });

  const users=rows.map(r=>{
    const u=publicUser(r);
    u.badge=badgeMap[r.id]||null;
    u.profile=profMap[r.id]||null;
    return u;
  });
  return json({users,viewer:me.id});
}
