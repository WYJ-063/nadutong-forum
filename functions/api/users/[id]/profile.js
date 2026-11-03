import {
  json,readBody,preflight,ensureSchema,getAuthUser,saveUserProfile
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
  const profile=await saveUserProfile(env,me.id,b);
  return json({ok:true,profile});
}
