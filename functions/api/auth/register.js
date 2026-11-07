import {
  json,readBody,preflight,ensureSchema,getSecret,genId,
  hashPassword,signToken,publicUserFull,nowStr
} from '../_lib.js';
import {ensureInviteTable,findInviterByCode,recordInvite} from '../_invite.js';

export async function onRequestOptions(){ return preflight(); }

export async function onRequestPost({request,env}){
 try{
  const b=await readBody(request);
  const login=String(b.login||'').trim().toLowerCase();
  const password=String(b.password||'');
  const name=String(b.name||'').trim();
  if(!/^[a-z0-9_]{3,20}$/.test(login))
    return json({error:'账号需为 3-20 位字母/数字/下划线'},400);
  if(password.length<6)
    return json({error:'密码至少 6 位'},400);
  if(!name)return json({error:'请填写昵称'},400);
  if(name.length>16)return json({error:'昵称最多 16 个字'},400);
  await ensureSchema(env);
  const exists=await env.DB.prepare('SELECT id FROM users WHERE login=?').bind(login).first();
  if(exists)return json({error:'该账号已被注册'},409);
  const id=genId('u');
  const salt=crypto.randomUUID();
  const passHash=await hashPassword(password,salt);
  const createdAt=nowStr();
  try{
    await env.DB.prepare(
      `INSERT INTO users (id,login,pass_hash,salt,name,avatar,role,points,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(id,login,passHash,salt,name,'',1,0,createdAt).run();
  }catch(e){
    /* 并发注册同一账号时唯一索引会报错，转成可读提示而不是 500 */
    if(/UNIQUE|constraint/i.test(String((e&&e.message)||'')))
      return json({error:'该账号已被注册'},409);
    throw e;
  }
  /* 邀请码（可选）：注册成功后一次性结算，失败不影响注册本身 */
  let inviteBonus=0;
  const invite=String(b.invite||'').trim();
  if(invite){
    try{
      await ensureInviteTable(env);
      const inviter=await findInviterByCode(env,invite);
      if(inviter)inviteBonus=await recordInvite(env,inviter.id,id,invite);
    }catch(e){ /* 邀请结算异常不阻断注册 */ }
  }
  const secret=await getSecret(env);
  const token=await signToken({uid:id,exp:Date.now()+1000*60*60*24*30},secret);
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  return json({token,user:await publicUserFull(env,row),inviteBonus});
 }catch(e){
   return json({error:String(e&&e.message||e)},500);
 }
}
