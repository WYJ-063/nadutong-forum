import { json, ensureSchema } from './_lib.js';

export async function onRequestGet({env}){
  const out={};
  try{
    await ensureSchema(env);
    const q1=await env.DB.prepare('SELECT COUNT(*) n FROM posts').first();
    out.postsCount=Number(q1.n);
    let ftsExists=true;
    try{
      const q2=await env.DB.prepare('SELECT COUNT(*) n FROM posts_fts').first();
      out.ftsCount=Number(q2.n);
    }catch(e){ ftsExists=false; out.ftsError=String(e.message||e); }
    if(ftsExists){
      for(const m of ['"罗天大醮"','"龙虎山"','罗天大醮']){
        try{
          const r=await env.DB.prepare('SELECT rowid FROM posts_fts WHERE posts_fts MATCH ? LIMIT 5').bind(m).all();
          out['match '+m]=(r.results||[]).map(x=>Number(x.rowid));
        }catch(e){ out['match '+m]='ERR '+String(e.message||e); }
      }
      const rows=await env.DB.prepare('SELECT rowid,title FROM posts_fts LIMIT 5').all();
      out.ftsSample=(rows.results||[]).map(x=>({rowid:Number(x.rowid),title:x.title}));
    }
    const v=await env.DB.prepare('SELECT sqlite_version() v').first();
    out.sqlite=v.v;
  }catch(e){ out.fatal=String(e.message||e); }
  return json(out);
}
