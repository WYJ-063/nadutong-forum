import {
  json,readBody,preflight,ensureSchema,getSecret,genId,
  hashPassword,signToken,publicUserFull,nowStr,grantBadge
} from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

export async function onRequestPost({request,env}){
 try{
  const b=await readBody(request);
  const login=String(b.login||'').trim().toLowerCase();
  const password=String(b.password||'');
  const name=String(b.name||'').trim();
  const inviteCode=String(b.inviteCode||'').trim().toUpperCase();
  if(!/^[a-z0-9_]{3,20}$/.test(login))
    return json({error:'账号需为 3-20 位字母/数字/下划线'},400);
  if(password.length<6)
    return json({error:'密码至少 6 位'},400);
  if(!name)return json({error:'请填写昵称'},400);
  await ensureSchema(env);
  const exists=await env.DB.prepare('SELECT id FROM users WHERE login=?').bind(login).first();
  if(exists)return json({error:'该账号已被注册'},409);

  // 处理邀请码
  let inviter=null;
  if(inviteCode){
    inviter=await env.DB.prepare('SELECT * FROM users WHERE invite_code=?').bind(inviteCode).first();
    if(!inviter)return json({error:'邀请码无效'},400);
    if(inviter.login===login)return json({error:'不能使用自己的邀请码'},400);
  }

  const id=genId('u');
  const salt=crypto.randomUUID();
  const passHash=await hashPassword(password,salt);
  const createdAt=nowStr();
  // 新用户自己也生成一个邀请码
  const myCode=genId('INV').slice(0,8).toUpperCase();
  await env.DB.prepare(
    `INSERT INTO users (id,login,pass_hash,salt,name,avatar,role,points,created_at,invite_code,referred_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id,login,passHash,salt,name,'',1,inviter?100:0,createdAt,myCode,inviter?inviter.id:null).run();

  // 邀请人加分
  if(inviter){
    await env.DB.prepare('UPDATE users SET points=points+100 WHERE id=?').bind(inviter.id).run();
    await env.DB.prepare(
      `INSERT INTO invitations (id,code,inviter_id,invitee_id,created_at) VALUES (?,?,?,?,?)`)
      .bind(genId('inv'),inviteCode,inviter.id,id,createdAt).run();
    // 通知邀请人
    await env.DB.prepare(
      `INSERT INTO notifications
         (id,user_id,type,actor_id,actor_name,target_type,target_id,post_id,post_title,excerpt,read,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,0,?)`)
      .bind(genId('n'),inviter.id,'invite','system','系统','user',id,'',name,
        `${name} 通过你的邀请注册成功，双方各得100积分`,nowStr()).run();
    // 发引荐人徽章（第1人）和星探徽章（第5人）
    const {results:invList}=await env.DB.prepare('SELECT COUNT(*) as c FROM invitations WHERE inviter_id=?').bind(inviter.id).all();
    const cnt=Number(invList?.[0]?.c||0);
    if(cnt>=1)await grantBadge(env,inviter.id,'inviter_1',null);
    if(cnt>=5)await grantBadge(env,inviter.id,'inviter_5',null);
  }

  const secret=await getSecret(env);
  const token=await signToken({uid:id,exp:Date.now()+1000*60*60*24*30},secret);
  const row=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  return json({token,user:await publicUserFull(env,row)});
 }catch(e){
   return json({error:String(e&&e.message||e)},500);
 }
}
