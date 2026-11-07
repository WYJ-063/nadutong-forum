import {
  json,readBody,preflight,ensureSchema,getAuthUser,hashPassword,verifyPassword
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

/* POST /api/auth/password —— 修改自己的密码  body: { oldPassword, newPassword }
   只更新该用户的 pass_hash / salt：
   - 不动 token，当前设备保持登录，不会把用户踢下线；
   - 不碰其它表，已注册用户的帖子、积分、徽章全部不受影响。 */
export async function onRequestPost({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  const b=await readBody(request);
  const oldPassword=String(b.oldPassword||'');
  const newPassword=String(b.newPassword||'');
  if(!oldPassword)return json({error:'请填写当前密码'},400);
  if(!newPassword)return json({error:'请填写新密码'},400);
  if(newPassword.length<6)return json({error:'新密码至少 6 位'},400);
  if(newPassword===oldPassword)return json({error:'新密码不能与当前密码相同'},400);
  await ensureSchema(env);
  const row=await env.DB.prepare(
    'SELECT id,salt,pass_hash FROM users WHERE id=?').bind(me.id).first();
  if(!row)return json({error:'账号不存在'},404);
  if(!(await verifyPassword(oldPassword,row.salt,row.pass_hash)))
    return json({error:'当前密码不正确'},400);
  const salt=crypto.randomUUID();
  const passHash=await hashPassword(newPassword,salt);
  await env.DB.prepare(
    'UPDATE users SET pass_hash=?,salt=? WHERE id=?').bind(passHash,salt,me.id).run();
  return json({ok:true});
}
