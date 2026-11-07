import {genId,nowStr,addPoints} from './_lib.js';

/* 邀请好友：100 积分/人 */
export const INVITE_POINTS=100;

/* 邀请关系表。旧版 invite.js 直接读写 users.invite_code 和 invitations，
   但两者在 schema 里都不存在，导致 /api/invite 必定 500。
   这里改为懒建表 + 邀请码由用户 ID 稳定推导，不依赖 users 新列。 */
export async function ensureInviteTable(env){
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS invitations (
       id TEXT PRIMARY KEY,
       inviter_id TEXT NOT NULL,
       invitee_id TEXT,
       code TEXT,
       created_at TEXT
     )`).run();
  await env.DB.prepare(
    'CREATE INDEX IF NOT EXISTS idx_invitations_inviter ON invitations(inviter_id)').run();
  await env.DB.prepare(
    'CREATE INDEX IF NOT EXISTS idx_invitations_invitee ON invitations(invitee_id)').run();
}

/* 邀请码由用户 ID 稳定推导（FNV-1a），同一用户每次都得到同一个码 */
export function inviteCodeOf(userId){
  const s=String(userId||'');
  let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  const part=(h.toString(36)+'000000').slice(0,6).toUpperCase();
  return 'NDT'+part;
}

/* 按邀请码反查邀请人（用户量级不大，本地哈希比对即可，不额外建索引表） */
export async function findInviterByCode(env,code){
  const target=String(code||'').trim().toUpperCase();
  if(!target||target.length>16)return null;
  const {results}=await env.DB.prepare('SELECT id,name FROM users').all();
  for(const u of (results||[])){
    if(inviteCodeOf(u.id)===target)return u;
  }
  return null;
}

/* 记录邀请关系并给双方加分；返回实际发放的积分（重复邀请返回 0） */
export async function recordInvite(env,inviterId,inviteeId,code){
  if(!inviterId||!inviteeId||inviterId===inviteeId)return 0;
  const already=await env.DB.prepare(
    'SELECT 1 FROM invitations WHERE invitee_id=? LIMIT 1').bind(inviteeId).first();
  if(already)return 0;
  await env.DB.prepare(
    `INSERT INTO invitations (id,inviter_id,invitee_id,code,created_at) VALUES (?,?,?,?,?)`)
    .bind(genId('iv'),inviterId,inviteeId,String(code||'').toUpperCase(),nowStr()).run();
  await addPoints(env,inviterId,INVITE_POINTS);
  await addPoints(env,inviteeId,INVITE_POINTS);
  return INVITE_POINTS;
}
