import {genId,nowStr,addPoints,grantBadge} from './_lib.js';

/* 邀请好友：100 积分/人 */
export const INVITE_POINTS=100;

/* 邀请里程碑徽章。
   这两枚徽章原先只存在于数据库（inviter_1 / inviter_5，kind='auto'），
   但代码里从来没有发放逻辑——邀请流程只加积分，所以「拉 1 人得接引人、
   拉 5 人得哪都通 HR」一直没生效。这里把阈值和自动发放补上。
   effect 与线上已有记录保持一致（接引人=5 银辉、HR=10 靛蓝）。 */
export const INVITE_BADGES=[
  {id:'inviter_1',name:'接引人',icon:'🤝',
   desc:'邀请第一位好友注册成功，双方各得100积分',effect:'5',need:1},
  {id:'inviter_5',name:'哪都通HR',icon:'💼',
   desc:'成功邀请5位好友注册，公司正式编外招聘官',effect:'10',need:5}
];

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

/* 确保里程碑徽章在 badges 表里存在（只补缺失的，已存在不写库，避免无谓写配额） */
async function ensureInviteBadges(env){
  const {results}=await env.DB.prepare(
    "SELECT id FROM badges WHERE id IN ('inviter_1','inviter_5')").all();
  const have=new Set((results||[]).map(r=>r.id));
  for(const b of INVITE_BADGES){
    if(have.has(b.id))continue;
    await env.DB.prepare(
      'INSERT OR IGNORE INTO badges (id,name,icon,desc,kind,effect,created_at) VALUES (?,?,?,?,?,?,?)')
      .bind(b.id,b.name,b.icon,b.desc,'auto',b.effect,nowStr()).run();
  }
}

/* 按当前邀请人数补发里程碑徽章（幂等：grantBadge 已拥有会跳过）。
   既用于新人注册结算，也用于老用户打开邀请面板/登录时补发历史漏掉的徽章。
   先查人数：绝大多数用户没邀请过人，这一步就是唯一开销，不碰 badges 表。 */
export async function syncInviteBadges(env,inviterId){
  if(!inviterId)return {count:0,granted:[]};
  let count=0;
  try{
    const row=await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM invitations WHERE inviter_id=?').bind(inviterId).first();
    count=Number(row&&row.n)||0;
  }catch(e){
    /* invitations 表还没建过（从没走过邀请流程）：直接当作 0，不在热路径上建表 */
    return {count:0,granted:[]};
  }
  if(count<1)return {count,granted:[]};
  await ensureInviteBadges(env);
  const granted=[];
  for(const b of INVITE_BADGES){
    if(count<b.need)continue;
    const r=await grantBadge(env,inviterId,b.id,null);
    if(r&&r.granted)granted.push(r.badge);
  }
  return {count,granted};
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
  /* 邀请达成里程碑时发徽章（失败不阻断注册，徽章会在下次打开邀请面板时补发） */
  try{ await syncInviteBadges(env,inviterId); }catch(e){}
  return INVITE_POINTS;
}
