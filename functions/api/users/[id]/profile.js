import {
  json,readBody,preflight,ensureSchema,getAuthUser,saveUserProfile,publicUserFull
} from '../../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/users/:id/profile —— 保存个人资料（仅本人）
   body 可含：{ faction, bio, gender, city, birthday }，传空串=清空 */
export async function onRequestPost({request,env,params}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(params.id!==me.id)return json({error:'只能编辑自己的资料'},403);
  await ensureSchema(env);
  const b=await readBody(request);
  /* 昵称（可选）：只改显示名，不动账号 login。
     帖子/回复里存的是发布时的 author_name 快照，这里一并同步，避免改名后
     旧帖还显示旧昵称。历史通知里的 actor_name 保持快照，不回改。 */
  let nameChanged=false;
  if(b.name!==undefined){
    const name=String(b.name).trim();
    if(!name)return json({error:'昵称不能为空'},400);
    if([...name].length>16)return json({error:'昵称最多 16 个字'},400);
    const cur=await env.DB.prepare('SELECT name FROM users WHERE id=?').bind(me.id).first();
    if(!cur||cur.name!==name){
      await env.DB.prepare('UPDATE users SET name=? WHERE id=?').bind(name,me.id).run();
      try{
        await env.DB.prepare('UPDATE posts SET author_name=? WHERE author_id=?')
          .bind(name,me.id).run();
        await env.DB.prepare('UPDATE replies SET author_name=? WHERE author_id=?')
          .bind(name,me.id).run();
      }catch(e){ /* 同步失败不影响改名本身 */ }
      nameChanged=true;
    }
  }
  const profile=await saveUserProfile(env,me.id,b);
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(me.id).first();
  return json({ok:true,profile,nameChanged,user:await publicUserFull(env,row)});
}
