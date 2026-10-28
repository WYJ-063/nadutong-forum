import { json,preflight,getAuthUser,publicUser } from '../_lib.js';

export async function onRequestOptions(){ return preflight(); }

export async function onRequestGet({request,env}){
  const row=await getAuthUser(request,env);
  if(!row)return json({error:'未登录'},401);
  return json({user:publicUser(row)});
}
