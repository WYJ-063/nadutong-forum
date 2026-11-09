/* /api/profile —— 云端个人主页 + 成就系统（完整版，32 条）
 *
 * 为什么单独一个文件：
 *   _lib.js 是全站公共库，动它容易把整站打挂（历史上出现过全站 500）。
 *   所以这里只 import 已有的工具函数，自己建自己的表、自己跑自己的判定，
 *   完全不碰 _lib.js 的内容。
 *
 * 数据设计：
 *   · 不新建装饰表。装饰的解锁来源就是成就，所以"已解锁"由成就推导；
 *     用户"当前挂哪件"存在 user_profiles 新增的几列里。
 *   · 新增两张表：
 *       user_achievements  谁在什么时候解锁了什么
 *       user_flags         前端埋点（逛过哪些路由、用了几次占卜…）
 *   · 判定全部在服务端算，前端只读结果 —— 改前端没法刷成就。
 *
 * 32 条怎么来的：
 *   15 条纯 SQL 判定（posts / replies / likes / checkins / post_edits 里已有数据）
 *   17 条里 5 条也是纯 SQL（发帖时间、字数、@ 引用、收到的回复），
 *   剩下的要埋点（逛了哪些板块、开了几次档案、用了几次占卜、收藏了几个帖）。
 *   埋点走 POST 的 flags 字段，只记次数和路由名，不记内容。
 */
import { json, readBody, preflight, ensureSchema, getAuthUser } from './_lib.js';

/* ---------------- 建表 / 加列（幂等） ---------------- */

let plusReady = false;

async function ensurePlus(env) {
  if (plusReady) return;
  await ensureSchema(env);

  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS user_achievements (
         user_id TEXT,
         ach_id TEXT,
         unlocked_at TEXT,
         PRIMARY KEY(user_id, ach_id)
       )`
    ).run();
  } catch (e) { /* 已存在就跳过 */ }

  // 埋点表：flag 是 'r_forum' / 'day_20261109' / 'divine' 这类短码，val 是次数
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS user_flags (
         user_id TEXT,
         flag TEXT,
         val INTEGER DEFAULT 0,
         updated_at TEXT,
         PRIMARY KEY(user_id, flag)
       )`
    ).run();
  } catch (e) { /* 已存在就跳过 */ }

  // user_profiles 原来只有 6 个字段，主页撑不起来，这里补列。
  // ALTER 失败只可能是"列已存在"，直接忽略。
  const cols = [
    ['capability', 'TEXT'],   // 能力简介
    ['dec_frame', 'TEXT'],    // 头像框
    ['dec_bg', 'TEXT'],       // 主页背景
    ['dec_plate', 'TEXT'],    // 名牌样式
    ['dec_title', 'TEXT'],    // 当前称号（只能挂一个）
    ['dec_badges', 'TEXT'],   // 展示徽章（JSON 数组，最多 3 个）
  ];
  for (const [name, type] of cols) {
    try {
      await env.DB.prepare(`ALTER TABLE user_profiles ADD COLUMN ${name} ${type}`).run();
    } catch (e) { /* 列已存在 */ }
  }

  plusReady = true;
}

/* ---------------- 成就目录（32 条） ----------------
 * target：达成需要的数值
 * cur(s)：从统计里取当前值，和 target 比
 * reward：解锁后得到的那件装饰（kind + id）
 *
 * rarity：normal 普通 / fine 精良 / rare 稀有 / legend 传说 / hidden 隐藏
 */

const ACH = [
  /* ---- 起手四件：注册、填资料、第一句话、第一篇帖 ---- */
  { id: 'a_avatar',   name: '报到',     icon: '证', desc: '注册并设置头像',                 rarity: 'normal', target: 1,   cur: s => (s.avatar ? 1 : 0),               reward: { kind: 'frame', id: 'frame_rookie' } },
  { id: 'a_profile',  name: '报上名号', icon: '名', desc: '资料里填了门派和签名',           rarity: 'normal', target: 1,   cur: s => (s.faction && s.bio ? 1 : 0),     reward: { kind: 'plate', id: 'plate_plain' } },
  { id: 'a_reply1',   name: '开口',     icon: '言', desc: '发出第一条回复',                 rarity: 'normal', target: 1,   cur: s => s.replies,                        reward: { kind: 'title', id: 'title_newbie' } },
  { id: 'a_post1',    name: '立帖',     icon: '帖', desc: '发布第一个帖子',                 rarity: 'normal', target: 1,   cur: s => s.posts,                          reward: { kind: 'frame', id: 'frame_pen' } },

  /* ---- 产量 ---- */
  { id: 'a_post20',   name: '笔杆子',   icon: '笔', desc: '累计发帖 20 篇',                 rarity: 'fine',   target: 20,  cur: s => s.posts,                          reward: { kind: 'frame', id: 'frame_paper' } },
  { id: 'a_reply200', name: '嘴不停',   icon: '聊', desc: '累计回复 200 条',                rarity: 'fine',   target: 200, cur: s => s.replies,                        reward: { kind: 'frame', id: 'frame_talk' } },
  { id: 'a_edit10',   name: '校稿',     icon: '校', desc: '编辑自己的帖子 10 次',           rarity: 'fine',   target: 10,  cur: s => s.edits,                          reward: { kind: 'frame', id: 'frame_proof' } },

  /* ---- 人气 ---- */
  { id: 'a_like50',   name: '捧场',     icon: '赞', desc: '累计给别人点 50 个赞',           rarity: 'normal', target: 50,  cur: s => s.givenLikes,                     reward: { kind: 'frame', id: 'frame_praise' } },
  { id: 'a_view500',  name: '有人看',   icon: '阅', desc: '有一篇帖子被浏览 500 次',        rarity: 'rare',   target: 500, cur: s => s.maxViews,                       reward: { kind: 'plate', id: 'plate_seen' } },
  { id: 'a_beLiked100', name: '有人赞', icon: '誉', desc: '累计收到 100 个赞',              rarity: 'rare',   target: 100, cur: s => s.gotLikes,                       reward: { kind: 'title', id: 'title_heat' } },
  { id: 'a_missed',   name: '被惦记',   icon: '念', desc: '你的帖子累计收到 50 条回复',      rarity: 'rare',   target: 50,  cur: s => s.gotReplies,                     reward: { kind: 'title', id: 'title_missed' } },

  /* ---- 出勤与岁月 ---- */
  { id: 'a_streak7',  name: '常驻',     icon: '签', desc: '连续签到 7 天',                  rarity: 'normal', target: 7,   cur: s => s.streak,                         reward: { kind: 'plate', id: 'plate_daily' } },
  { id: 'a_streak30', name: '钉子户',   icon: '钉', desc: '连续签到 30 天',                 rarity: 'rare',   target: 30,  cur: s => s.streak,                         reward: { kind: 'plate', id: 'plate_nail' } },
  { id: 'a_day100',   name: '老面孔',   icon: '旧', desc: '注册满 100 天',                  rarity: 'fine',   target: 100, cur: s => s.days,                           reward: { kind: 'plate', id: 'plate_old' } },
  { id: 'a_year1',    name: '一周年',   icon: '年', desc: '注册满 365 天',                  rarity: 'legend', target: 365, cur: s => s.days,                           reward: { kind: 'title', id: 'title_old' } },
  { id: 'a_daily3',   name: '常来',     icon: '访', desc: '在 3 个不同的日子打开过站内页面', rarity: 'normal', target: 3,   cur: s => s.daysActive,                     reward: { kind: 'plate', id: 'plate_daily3' } },

  /* ---- 彩蛋：时间、字数、措辞 ---- */
  { id: 'a_night',    name: '夜猫',     icon: '猫', desc: '在凌晨 0 到 6 点之间发过帖',      rarity: 'fine',   target: 1,   cur: s => s.nightPosts,                     reward: { kind: 'title', id: 'title_night' } },
  { id: 'a_early',    name: '赶早',     icon: '早', desc: '在早上 5 到 8 点之间发过帖',      rarity: 'fine',   target: 1,   cur: s => s.earlyPosts,                     reward: { kind: 'plate', id: 'plate_early' } },
  { id: 'a_longpost', name: '长篇',     icon: '长', desc: '发过一篇 600 字以上的帖子',       rarity: 'rare',   target: 1,   cur: s => s.longPosts,                      reward: { kind: 'frame', id: 'frame_long' } },
  { id: 'a_quote',    name: '点名',     icon: '点', desc: '回复里用过 @ 提及别人',           rarity: 'normal', target: 1,   cur: s => s.quoteReplies,                   reward: { kind: 'plate', id: 'plate_quote' } },

  /* ---- 主页装修相关 ---- */
  { id: 'a_speech',   name: '话多',     icon: '介', desc: '能力简介写到 60 字以上',          rarity: 'fine',   target: 60,  cur: s => s.capLen,                         reward: { kind: 'title', id: 'title_talky' } },
  { id: 'a_wearall',  name: '挂满',     icon: '满', desc: '同时挂 3 个展示徽章',             rarity: 'fine',   target: 3,   cur: s => s.badgeCount,                     reward: { kind: 'plate', id: 'plate_full' } },

  /* ---- 需要埋点：收藏、逛、档案、占卜、聊天 ---- */
  { id: 'a_bookmark', name: '藏书',     icon: '藏', desc: '收藏过 50 个帖子',                rarity: 'rare',   target: 50,  cur: s => s.fav,                            reward: { kind: 'plate', id: 'plate_book' } },
  { id: 'a_wander',   name: '到处走',   icon: '走', desc: '进过 5 个不同的页面模块',         rarity: 'normal', target: 5,   cur: s => s.routes,                         reward: { kind: 'plate', id: 'plate_wander' } },
  { id: 'a_allboards',name: '巡场',     icon: '巡', desc: '进过 12 个不同的页面模块',        rarity: 'rare',   target: 12,  cur: s => s.routes,                         reward: { kind: 'bg', id: 'bg_all' } },
  { id: 'a_archive',  name: '翻旧账',   icon: '档', desc: '打开过 5 次事件档案或资料库',     rarity: 'normal', target: 5,   cur: s => s.archive,                        reward: { kind: 'plate', id: 'plate_oldcase' } },
  { id: 'a_roster',   name: '看人',     icon: '人', desc: '打开过 10 次异人档案',            rarity: 'rare',   target: 10,  cur: s => s.roster,                         reward: { kind: 'title', id: 'title_watcher' } },
  { id: 'a_divine',   name: '起卦',     icon: '卦', desc: '用过一次占卜',                    rarity: 'normal', target: 1,   cur: s => s.divine,                         reward: { kind: 'frame', id: 'frame_divine' } },
  { id: 'a_halfgod',  name: '半仙',     icon: '仙', desc: '用满 30 次占卜',                  rarity: 'legend', target: 30,  cur: s => s.divine,                         reward: { kind: 'bg', id: 'bg_gua' } },
  { id: 'a_chat',     name: '夜聊',     icon: '聊', desc: '进过聊天室或工作组',              rarity: 'normal', target: 1,   cur: s => s.chat,                           reward: { kind: 'frame', id: 'frame_night_chat' } },
  { id: 'a_dm',       name: '搭话',     icon: '搭', desc: '打开过私信',                      rarity: 'normal', target: 1,   cur: s => s.dm,                             reward: { kind: 'frame', id: 'frame_dm' } },

  /* ---- 隐藏 ---- */
  { id: 'a_dive',     name: '潜水',     icon: '潜', desc: '注册满 30 天，回复不超过 5 条',   rarity: 'hidden', target: 1,   cur: s => (s.days >= 30 && s.replies < 5 ? 1 : 0), reward: { kind: 'title', id: 'title_dive' } },
];

/* ---------------- 装饰目录（32 件） ----------------
 * kind：frame 头像框 / plate 名牌 / title 称号 / bg 主页背景
 * color：主色。头像框的环宽、层数、外发光在 CSS 里按 id 区分，
 *        这里只给颜色，所以同一件装饰在八个主题下都一致。
 */
const DECOR = {
  /* 头像框 10 件 */
  frame_rookie:     { name: '新人证', kind: 'frame', color: '#6C93E8' },
  frame_pen:        { name: '落笔',   kind: 'frame', color: '#E0A063' },
  frame_paper:      { name: '稿纸',   kind: 'frame', color: '#9B84D8' },
  frame_talk:       { name: '话痨',   kind: 'frame', color: '#4FC08D' },
  frame_proof:      { name: '校对',   kind: 'frame', color: '#C4626A' },
  frame_praise:     { name: '捧场',   kind: 'frame', color: '#D8B24A' },
  frame_long:       { name: '长篇',   kind: 'frame', color: '#7C86D8' },
  frame_divine:     { name: '起卦',   kind: 'frame', color: '#8A7BC8' },
  frame_night_chat: { name: '夜聊',   kind: 'frame', color: '#4A5E9A' },
  frame_dm:         { name: '搭话',   kind: 'frame', color: '#8A6FA8' },

  /* 名牌 11 件 */
  plate_plain:      { name: '素面',   kind: 'plate', color: '#9AA4B6' },
  plate_seen:       { name: '被看见', kind: 'plate', color: '#6C93E8' },
  plate_daily:      { name: '常驻',   kind: 'plate', color: '#4FC08D' },
  plate_nail:       { name: '钉子户', kind: 'plate', color: '#E0A063' },
  plate_old:        { name: '旧识',   kind: 'plate', color: '#9B84D8' },
  plate_daily3:     { name: '常来',   kind: 'plate', color: '#5B9BB0' },
  plate_early:      { name: '赶早',   kind: 'plate', color: '#D89A5B' },
  plate_quote:      { name: '点名',   kind: 'plate', color: '#4F9AB8' },
  plate_full:       { name: '挂满',   kind: 'plate', color: '#C0A24A' },
  plate_book:       { name: '藏书',   kind: 'plate', color: '#9A7B5B' },
  plate_wander:     { name: '到处走', kind: 'plate', color: '#5FA88C' },
  plate_oldcase:    { name: '翻旧账', kind: 'plate', color: '#B99A6A' },

  /* 称号 7 件（只能挂一个） */
  title_newbie:     { name: '初来',   kind: 'title', color: '#9AA4B6' },
  title_heat:       { name: '有分量', kind: 'title', color: '#C4626A' },
  title_old:        { name: '元老',   kind: 'title', color: '#D8B24A' },
  title_dive:       { name: '潜水',   kind: 'title', color: '#5C7A96' },
  title_missed:     { name: '被惦记', kind: 'title', color: '#8A7BC8' },
  title_night:      { name: '夜猫',   kind: 'title', color: '#4A5E9A' },
  title_talky:      { name: '话多',   kind: 'title', color: '#6E9BDE' },
  title_watcher:    { name: '看人',   kind: 'title', color: '#4F8A8C' },

  /* 主页背景 2 件 */
  bg_all:           { name: '全场',   kind: 'bg',    color: '#4F6FB0' },
  bg_gua:           { name: '卦象',   kind: 'bg',    color: '#2F4A6E' },
};

/* ---------------- 统计：SQL + 埋点 ---------------- */

async function num(env, sql, uid) {
  try {
    const r = await env.DB.prepare(sql).bind(uid).first();
    if (!r) return 0;
    const v = Object.values(r)[0];
    return Number(v) || 0;
  } catch (e) { return 0; }
}

/* 埋在 user_flags 里的东西，一次查出来在 JS 里统计 */
async function loadFlags(env, uid) {
  const out = { routes: 0, divine: 0, archive: 0, roster: 0, chat: 0, dm: 0, fav: 0, daysActive: 0 };
  try {
    const { results } = await env.DB.prepare(
      'SELECT flag, val FROM user_flags WHERE user_id=?'
    ).bind(uid).all();
    const rows = results || [];
    const routeSet = new Set();
    const daySet = new Set();
    for (const r of rows) {
      const f = String(r.flag || '');
      const v = Number(r.val) || 0;
      if (f.startsWith('r_')) { routeSet.add(f); continue; }
      if (f.startsWith('day_')) { daySet.add(f); continue; }
      if (f === 'divine' || f === 'archive' || f === 'roster' ||
          f === 'chat' || f === 'dm' || f === 'fav') {
        out[f] += v;
      }
    }
    out.routes = routeSet.size;
    out.daysActive = daySet.size;
  } catch (e) { /* 表还没建好就当 0 */ }
  return out;
}

async function loadStats(env, uid) {
  const posts   = await num(env, 'SELECT COUNT(*) FROM posts WHERE author_id=?', uid);
  const replies = await num(env, 'SELECT COUNT(*) FROM replies WHERE author_id=?', uid);
  const edits   = await num(env, 'SELECT COUNT(*) FROM post_edits WHERE editor_id=?', uid);
  const givenLikes = await num(env, 'SELECT COUNT(*) FROM likes WHERE user_id=?', uid);
  const maxViews   = await num(env, 'SELECT MAX(views) FROM posts WHERE author_id=?', uid);

  // 收到的赞 = 自己帖子上的赞 + 自己回复上的赞
  const likePost  = await num(env, `SELECT COUNT(*) FROM likes
                                    WHERE target_type='post'
                                      AND target_id IN (SELECT id FROM posts WHERE author_id=?)`, uid);
  const likeReply = await num(env, `SELECT COUNT(*) FROM likes
                                    WHERE target_type='reply'
                                      AND target_id IN (SELECT id FROM replies WHERE author_id=?)`, uid);

  // 自己的帖子被别人回复了多少条
  const gotReplies = await num(env, `SELECT COUNT(*) FROM replies
                                     WHERE post_id IN (SELECT id FROM posts WHERE author_id=?)`, uid);

  const streak = await num(env, 'SELECT streak FROM checkins WHERE user_id=?', uid);

  // 彩蛋：发帖时间。created_at 形如 2026-11-09 06:12:33 或 2026-11-09T06:12:33Z，
  // 第 12 位开始都是小时，substr 取两位就行。
  const nightPosts = await num(env, `SELECT COUNT(*) FROM posts
                                     WHERE author_id=?
                                       AND CAST(substr(created_at,12,2) AS INTEGER) < 6`, uid);
  const earlyPosts = await num(env, `SELECT COUNT(*) FROM posts
                                     WHERE author_id=?
                                       AND CAST(substr(created_at,12,2) AS INTEGER) BETWEEN 5 AND 7`, uid);
  const longPosts  = await num(env, 'SELECT COUNT(*) FROM posts WHERE author_id=? AND length(content) > 600', uid);
  const quoteReplies = await num(env, "SELECT COUNT(*) FROM replies WHERE author_id=? AND instr(content,'@') > 0", uid);

  const flags = await loadFlags(env, uid);

  let avatar = '', faction = '', bio = '', capability = '', created = '', badgeCount = 0;
  try {
    const u = await env.DB.prepare('SELECT avatar,name,created_at FROM users WHERE id=?').bind(uid).first();
    if (u) { avatar = u.avatar || ''; created = u.created_at || ''; }
  } catch (e) { /* 忽略 */ }
  try {
    const p = await env.DB.prepare(
      'SELECT faction,bio,capability,dec_badges FROM user_profiles WHERE user_id=?'
    ).bind(uid).first();
    if (p) {
      faction = p.faction || '';
      bio = p.bio || '';
      capability = p.capability || '';
      try {
        const arr = JSON.parse(p.dec_badges || '[]');
        badgeCount = Array.isArray(arr) ? arr.length : 0;
      } catch (e) { badgeCount = 0; }
    }
  } catch (e) { /* 老数据可能没有 capability 列 */ }

  let days = 0;
  if (created) {
    const t = Date.parse(created.replace(' ', 'T'));
    if (!isNaN(t)) days = Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }

  return {
    posts, replies, edits, givenLikes, maxViews,
    gotLikes: likePost + likeReply,
    gotReplies,
    streak, days,
    nightPosts, earlyPosts, longPosts, quoteReplies,
    routes: flags.routes,
    divine: flags.divine,
    archive: flags.archive,
    roster: flags.roster,
    chat: flags.chat,
    dm: flags.dm,
    fav: flags.fav,
    daysActive: flags.daysActive,
    capLen: capability.length,
    badgeCount,
    avatar, faction, bio, capability, created
  };
}

/* ---------------- 判定 + 落库（只在本人请求时执行） ---------------- */

async function runUnlock(env, uid, stats) {
  const unlocked = {};
  try {
    const { results } = await env.DB.prepare(
      'SELECT ach_id,unlocked_at FROM user_achievements WHERE user_id=?'
    ).bind(uid).all();
    for (const r of (results || [])) unlocked[r.ach_id] = r.unlocked_at;
  } catch (e) { /* 表还没建好 */ }

  const newly = [];
  for (const a of ACH) {
    if (unlocked[a.id]) continue;
    if (Number(a.cur(stats)) >= a.target) {
      const at = new Date().toISOString();
      try {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO user_achievements (user_id,ach_id,unlocked_at) VALUES (?,?,?)'
        ).bind(uid, a.id, at).run();
        unlocked[a.id] = at;
        newly.push(a.id);
      } catch (e) { /* 并发插入重复，忽略 */ }
    }
  }
  return { unlocked, newly };
}

function decorOf(unlocked) {
  const ok = new Set();
  for (const a of ACH) if (unlocked[a.id]) ok.add(a.reward.id);
  return ok;
}

/* ---------------- 埋点落库 ---------------- */

async function saveFlags(env, uid, flags) {
  const at = new Date().toISOString();
  const keys = Object.keys(flags).slice(0, 24);
  let written = 0;
  for (const k of keys) {
    // flag 只允许小写字母、数字、下划线，长度限 24，防止被塞奇怪的东西进表
    const key = String(k).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
    if (!key) continue;
    let v = Number(flags[k]);
    if (!isFinite(v) || v <= 0) v = 1;
    v = Math.min(20, Math.floor(v));
    try {
      await env.DB.prepare(
        `INSERT INTO user_flags (user_id,flag,val,updated_at) VALUES (?,?,?,?)
         ON CONFLICT(user_id,flag) DO UPDATE SET val = val + ?, updated_at = ?`
      ).bind(uid, key, v, at, v, at).run();
      written++;
    } catch (e) { /* 单条失败不影响其它 */ }
  }
  return written;
}

/* ---------------- GET /api/profile?uid= ---------------- */

export async function onRequestOptions() { return preflight(); }

export async function onRequestGet({ request, env }) {
  await ensurePlus(env);
  const url = new URL(request.url);
  let uid = url.searchParams.get('uid') || '';

  const me = await getAuthUser(request, env);
  if (!uid) {
    if (!me) return json({ error: '请先登录云端账号' }, 401);
    uid = me.id;
  }

  let user = null;
  try {
    const u = await env.DB.prepare('SELECT id,name,avatar,role,created_at FROM users WHERE id=?').bind(uid).first();
    if (u) user = u;
  } catch (e) { /* 忽略 */ }
  if (!user) return json({ error: '用户不存在' }, 404);

  const stats = await loadStats(env, uid);

  // 只有查自己才跑判定，避免随便查别人的主页就把人家成就刷出来
  let unlocked = {};
  let newly = [];
  if (me && me.id === uid) {
    const r = await runUnlock(env, uid, stats);
    unlocked = r.unlocked;
    newly = r.newly;
  } else {
    try {
      const { results } = await env.DB.prepare(
        'SELECT ach_id,unlocked_at FROM user_achievements WHERE user_id=?'
      ).bind(uid).all();
      for (const row of (results || [])) unlocked[row.ach_id] = row.unlocked_at;
    } catch (e) { /* 忽略 */ }
  }

  const ok = decorOf(unlocked);

  // 当前挂的装饰：不在已解锁范围内就回落默认
  let dec = { frame: '', bg: '', plate: '', title: '', badges: [], capability: stats.capability };
  try {
    const p = await env.DB.prepare(
      'SELECT dec_frame,dec_bg,dec_plate,dec_title,dec_badges,capability FROM user_profiles WHERE user_id=?'
    ).bind(uid).first();
    if (p) {
      dec.frame = ok.has(p.dec_frame) ? p.dec_frame : '';
      dec.bg = ok.has(p.dec_bg) ? p.dec_bg : '';
      dec.plate = ok.has(p.dec_plate) ? p.dec_plate : '';
      dec.title = ok.has(p.dec_title) ? p.dec_title : '';
      dec.capability = p.capability || '';
      try {
        const arr = JSON.parse(p.dec_badges || '[]');
        // 展示徽章存的是成就 id（徽章就是成就的图标），所以按"成就是否解锁"校验
        dec.badges = Array.isArray(arr) ? arr.filter(x => unlocked[x]).slice(0, 3) : [];
      } catch (e) { dec.badges = []; }
    }
  } catch (e) { /* 忽略 */ }

  const ach = ACH.map(a => {
    const cur = Number(a.cur(stats)) || 0;
    return {
      id: a.id,
      name: a.name,
      icon: a.icon,
      desc: a.desc,
      rarity: a.rarity,
      target: a.target,
      cur: Math.min(cur, a.target),
      unlocked: !!unlocked[a.id],
      at: unlocked[a.id] || '',
      reward: a.reward,
      rewardName: (DECOR[a.reward.id] || {}).name || ''
    };
  });

  return json({
    ok: true,
    user: { id: user.id, name: user.name, avatar: user.avatar || '', role: user.role, created_at: user.created_at, isSelf: !!(me && me.id === uid) },
    stats,
    decor: dec,
    decorCatalog: DECOR,
    ach,
    unlockedCount: ach.filter(a => a.unlocked).length,
    total: ach.length,
    newly
  });
}

/* ---------------- POST /api/profile ----------------
 * 两种用途，靠请求体里有没有 flags / 装扮字段来分：
 *   { flags: { r_forum: 1, divine: 2 } }      埋点上报
 *   { frame, bg, plate, title, badges, capability }   保存装扮
 * 只传 flags 时不会碰装扮；只传装扮时不会碰埋点。
 */

export async function onRequestPost({ request, env }) {
  const me = await getAuthUser(request, env);
  if (!me) return json({ error: '请先登录云端账号' }, 401);
  await ensurePlus(env);

  const b = await readBody(request) || {};

  // 先处理埋点，它跟装扮无关
  let flagCount = 0;
  if (b.flags && typeof b.flags === 'object') {
    flagCount = await saveFlags(env, me.id, b.flags);
  }

  const hasDecor = ['frame', 'bg', 'plate', 'title', 'badges', 'capability']
    .some(k => Object.prototype.hasOwnProperty.call(b, k));
  if (!hasDecor) return json({ ok: true, flags: flagCount });

  const stats = await loadStats(env, me.id);
  const { unlocked } = await runUnlock(env, me.id, stats);  // 先判定，保证刚达成就能马上挂上
  const ok = decorOf(unlocked);

  const capability = String(b.capability || '').slice(0, 200);

  // 先读一遍现在的挂法：传了非法值（没解锁的 id）就保留原样，不清空。
  // 否则一次失败请求就把人家装扮抹了。
  let prev = null;
  try {
    prev = await env.DB.prepare(
      'SELECT dec_frame,dec_bg,dec_plate,dec_title,dec_badges FROM user_profiles WHERE user_id=?'
    ).bind(me.id).first();
  } catch (e) { prev = null; }

  // 每个装饰都必须在"已解锁"里，防止手改请求就能穿没解锁的东西
  const pick = (v, old) => {
    if (v === undefined || v === null) return String(old || '');
    const s = String(v);
    if (!s) return '';                       // 明确传空串 = 摘掉
    return ok.has(s) ? s : String(old || ''); // 非法 = 保持原样
  };
  const frame = pick(b.frame, prev && prev.dec_frame);
  const bg = pick(b.bg, prev && prev.dec_bg);
  const plate = pick(b.plate, prev && prev.dec_plate);
  const title = pick(b.title, prev && prev.dec_title);  // 称号只能挂一个

  // 徽章存成就 id（徽章就是成就图标），只留已解锁的，最多 3 个
  let badges = [];
  if (Array.isArray(b.badges)) {
    badges = b.badges.map(x => String(x || '')).filter(x => unlocked[x]).slice(0, 3);
    if (!badges.length) {
      try {
        const old = JSON.parse((prev && prev.dec_badges) || '[]');
        badges = Array.isArray(old) ? old.filter(x => unlocked[x]).slice(0, 3) : [];
      } catch (e) { badges = []; }
    }
  } else {
    try {
      const old = JSON.parse((prev && prev.dec_badges) || '[]');
      badges = Array.isArray(old) ? old.filter(x => unlocked[x]).slice(0, 3) : [];
    } catch (e) { badges = []; }
  }

  const at = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO user_profiles (user_id,updated_at) VALUES (?,?)
       ON CONFLICT(user_id) DO NOTHING`
    ).bind(me.id, at).run();
  } catch (e) { /* 已存在 */ }

  try {
    await env.DB.prepare(
      `UPDATE user_profiles
          SET capability=?, dec_frame=?, dec_bg=?, dec_plate=?, dec_title=?, dec_badges=?, updated_at=?
        WHERE user_id=?`
    ).bind(capability, frame, bg, plate, title, JSON.stringify(badges), at, me.id).run();
  } catch (e) {
    return json({ error: '保存失败：' + (e && e.message ? e.message : '未知原因') }, 500);
  }

  return json({ ok: true, decor: { frame, bg, plate, title, badges, capability } });
}
