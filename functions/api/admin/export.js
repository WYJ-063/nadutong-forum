import {
  json,preflight,ensureSchema,getAuthUser,isAdmin,nowStr
} from '../_lib.js';

/* 备份导出的表（顺序固定，便于日后恢复） */
const TABLES=[
  'users','posts','replies','likes','notifications',
  'boards','polls','poll_options','poll_votes','checkins','meta'
];

export async function onRequestOptions(){ return preflight(); }

/* GET /api/admin/export —— 管理员导出全库 JSON 备份（触发下载） */
export async function onRequestGet({request,env}){
  const me=await getAuthUser(request,env);
  if(!me)return json({error:'请先登录云端账号'},401);
  if(!isAdmin(me))return json({error:'仅管理员可导出数据'},403);
  await ensureSchema(env);
  const data={};
  for(const t of TABLES){
    try{
      const r=await env.DB.prepare('SELECT * FROM '+t).all();
      data[t]=r.results||[];
    }catch(e){ data[t]=[]; }
  }
  const payload={
    _export:'nadutong-forum',
    _version:1,
    _at:nowStr(),
    data
  };
  const day=new Date().toISOString().slice(0,10);
  return new Response(JSON.stringify(payload),{
    headers:{
      'Content-Type':'application/json;charset=utf-8',
      'Content-Disposition':'attachment; filename="nadutong-backup-'+day+'.json"'
    }
  });
}
