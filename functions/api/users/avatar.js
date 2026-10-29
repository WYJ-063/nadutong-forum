import {
  json,readBody,preflight,ensureSchema,getAuthUser,publicUser
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* 头像 dataURL 最大长度（约 180KB，避免 D1 单行过大） */
const MAX_AVATAR_LEN=180*1024;

/* POST /api/users/avatar —— 更换当前登录用户头像
   body: { avatar: 'data:image/...' } 或 { avatar:'' } 清除 */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  let avatar=String(b.avatar||'');
  if(avatar){
    if(!/^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(avatar))
      return json({error:'头像格式不正确'},400);
    if(avatar.length>MAX_AVATAR_LEN)
      return json({error:'头像过大，请使用更小的图片'},400);
  }
  await ensureSchema(env);
  await env.DB.prepare('UPDATE users SET avatar=? WHERE id=?').bind(avatar,me.id).run();
  const fresh=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(me.id).first();
  return json({ok:true,user:publicUser(fresh)});
}
