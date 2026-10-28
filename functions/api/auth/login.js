import {
  json,readBody,preflight,ensureSchema,getSecret,
  verifyPassword,signToken,publicUser
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

export async function onRequestPost({request,env}){
  const b=await readBody(request);
  const login=String(b.login||'').trim().toLowerCase();
  const password=String(b.password||'');
  if(!login||!password)return json({error:'请输入账号和密码'},400);
  await ensureSchema(env);
  const row=await env.DB.prepare('SELECT * FROM users WHERE login=?').bind(login).first();
  if(!row)return json({error:'账号或密码错误'},401);
  const ok=await verifyPassword(password,row.salt,row.pass_hash);
  if(!ok)return json({error:'账号或密码错误'},401);
  if(Number(row.banned))return json({error:'该账号已被拉黑，无法登录。如有疑问请联系管理员'},403);
  const secret=await getSecret(env);
  const token=await signToken({uid:row.id,exp:Date.now()+1000*60*60*24*30},secret);
  return json({token,user:publicUser(row)});
}
