/* profile-plus.js —— 云端个人主页美化 + 成就面板
 *
 * 前提：不改 app.js（那是个近万行的大文件，历史上局部编辑把它改崩过）。
 * 做法：等 app.js 把 #/space/xxx 页面渲染完，再在这块 DOM 上叠三样东西：
 *   1. 称号 / 名牌 / 展示徽章
 *   2. 数据条（发帖、回复、获赞、成就、加入天数）
 *   3. 能力简介 + 成就面板（自己主页可点开看进度，别人的只看总数）
 *
 * 数据来自 /api/profile（新建的接口）。
 * 本地静态服务没有 /api，会 404 —— 这时候用零值骨架顶上，
 * 目的是本地也能看到完整版式，不是真实数据。
 */
(function () {
  'use strict';

  var ACH_GROUPS = {
    normal: { label: '普通', color: '#8C97A8' },
    fine:   { label: '精良', color: '#2FB57C' },
    rare:   { label: '稀有', color: '#3D7BF0' },
    epic:   { label: '史诗', color: '#8A63D2' },
    legend: { label: '传说', color: '#C9A227' },
    hidden: { label: '隐藏', color: '#2A2F3A' }
  };

  var state = { key: '', data: null, busy: false, seq: 0 };

  /* ---------- 工具 ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function curUid() {
    var m = (location.hash || '').match(/^#\/space\/([^?\/]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  /* 零值骨架：接口不通时用它，保证版式完整 */
  function mock(uid) {
    return {
      ok: true, mock: true,
      user: { id: uid, name: '', avatar: '', isSelf: false },
      stats: { posts: 0, replies: 0, gotLikes: 0, days: 0, streak: 0, capability: '' },
      decor: { frame: '', bg: '', plate: '', title: '', badges: [], capability: '' },
      decorCatalog: {},
      ach: [
        { id: 'a_avatar', name: '报到', icon: '证', desc: '注册并设置头像', rarity: 'normal', target: 1, cur: 0, unlocked: false },
        { id: 'a_profile', name: '报上名号', icon: '名', desc: '资料里填了门派和签名', rarity: 'normal', target: 1, cur: 0, unlocked: false },
        { id: 'a_reply1', name: '开口', icon: '言', desc: '发出第一条回复', rarity: 'normal', target: 1, cur: 0, unlocked: false },
        { id: 'a_post1', name: '立帖', icon: '帖', desc: '发布第一个帖子', rarity: 'normal', target: 1, cur: 0, unlocked: false },
        { id: 'a_post20', name: '笔杆子', icon: '笔', desc: '累计发帖 20 篇', rarity: 'fine', target: 20, cur: 0, unlocked: false },
        { id: 'a_reply200', name: '嘴不停', icon: '聊', desc: '累计回复 200 条', rarity: 'fine', target: 200, cur: 0, unlocked: false },
        { id: 'a_streak7', name: '常驻', icon: '签', desc: '连续签到 7 天', rarity: 'normal', target: 7, cur: 0, unlocked: false },
        { id: 'a_day100', name: '老面孔', icon: '旧', desc: '注册满 100 天', rarity: 'fine', target: 100, cur: 0, unlocked: false }
      ],
      unlockedCount: 0, total: 8, newly: []
    };
  }

  /* 云端登录态：app.js 把 token 放在 localStorage 的 ndt-cloud-token 里，
     接口要用 Bearer 带上，否则一律 401。以前没带，本地静态服务又 404，
     两个失败长得一样，所以一直没暴露出来。 */
  function token() {
    try { return localStorage.getItem('ndt-cloud-token') || ''; } catch (e) { return ''; }
  }
  function apiHeaders(extra) {
    var h = {};
    if (extra) for (var k in extra) h[k] = extra[k];
    var t = token();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  function load(uid) {
    var url = '/api/profile?uid=' + encodeURIComponent(uid) + '&_=' + Date.now();
    return fetch(url, { credentials: 'same-origin', headers: apiHeaders() })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .catch(function () { return mock(uid); });
  }

  /* ---------- 版式 ---------- */

  function buildBlock(d) {
    var s = d.stats || {};
    var dec = d.decor || {};
    var catalog = d.decorCatalog || {};

    var titleName = dec.title && catalog[dec.title] ? catalog[dec.title].name : '';
    var plateName = dec.plate && catalog[dec.plate] ? catalog[dec.plate].name : '';

    // 数据条：六格
    var cells = [
      ['发帖', s.posts || 0],
      ['回复', s.replies || 0],
      ['获赞', s.gotLikes || 0],
      ['成就', (d.unlockedCount || 0) + '/' + (d.total || 0)],
      ['连续签到', (s.streak || 0) + ' 天'],
      ['加入', (s.days || 0) + ' 天']
    ];
    var statHtml = cells.map(function (c) {
      return '<div class="pp-cell"><b>' + esc(c[1]) + '</b><span>' + esc(c[0]) + '</span></div>';
    }).join('');

    // 展示徽章
    var badges = (dec.badges || []).map(function (id) {
      var a = (d.ach || []).filter(function (x) { return x.id === id; })[0];
      if (!a) return '';
      return '<span class="pp-bd" title="' + esc(a.name) + '">' + esc(a.icon || '·') + '</span>';
    }).join('');

    // 成就列表
    var achHtml = (d.ach || []).map(function (a) {
      var g = ACH_GROUPS[a.rarity] || ACH_GROUPS.normal;
      var pct = a.target > 0 ? Math.min(100, Math.round((a.cur / a.target) * 100)) : 0;
      var prog = a.target > 1 ? ('<i>' + a.cur + '/' + a.target + '</i>') : '';
      // 隐藏成就没解锁时不露条件和名字，否则"隐藏"两个字就没意义了
      var veiled = a.rarity === 'hidden' && !a.unlocked;
      var nm = veiled ? '？' : a.name;
      var ds = veiled ? '达成后自行揭开' : a.desc;
      return '<div class="pp-ach-row' + (a.unlocked ? ' on' : '') + '" data-r="' + a.rarity + '">' +
        '<span class="pp-ach-ico">' + esc(veiled ? '？' : (a.icon || '·')) + '</span>' +
        '<span class="pp-ach-main"><b>' + esc(nm) + '</b>' +
        '<em>' + esc(ds) + '</em>' +
        '<span class="pp-bar"><u style="width:' + pct + '%"></u></span></span>' +
        '<span class="pp-ach-r" style="color:' + g.color + '">' + g.label + '</span>' +
        prog +
        (a.unlocked ? '<span class="pp-ok">已解锁</span>' : '') +
        '</div>';
    }).join('');

    var capability = dec.capability || s.capability || '';
    var self = d.user && d.user.isSelf;

    var html = '';
    html += '<div class="pp-wrap">';

    // 称号 + 名牌 + 徽章位
    if (titleName || plateName || badges) {
      html += '<div class="pp-tags">';
      if (titleName) html += '<span class="pp-title" style="--ppc:' + esc((catalog[dec.title] || {}).color || '#3D7BF0') + '">' + esc(titleName) + '</span>';
      if (plateName) html += '<span class="pp-plate" style="--ppc:' + esc((catalog[dec.plate] || {}).color || 'transparent') + '">' + esc(plateName) + '</span>';
      if (badges) html += '<span class="pp-bds">' + badges + '</span>';
      html += '</div>';
    }

    // 数据条
    html += '<div class="pp-stats">' + statHtml + '</div>';

    // 能力简介
    html += '<div class="pp-cap">' +
      '<h4>能力简介</h4>' +
      '<p>' + (capability ? esc(capability) : '<span class="pp-empty">还没有写能力简介</span>') + '</p>' +
      '</div>';

    // 成就面板
    html += '<div class="pp-ach">' +
      '<div class="pp-ach-top">' +
      '<h4>成就 <b>' + (d.unlockedCount || 0) + '<i>/' + (d.total || 0) + '</i></b></h4>' +
      '<span class="pp-ach-hint">' + (self ? '点开看进度' : '只读') + '</span>' +
      '</div>' +
      '<div class="pp-ach-body">' + achHtml + '</div>' +
      '</div>';

    // 装扮按钮（只在自己主页出现）
    if (self) {
      html += '<div class="pp-tools"><button type="button" class="pp-btn" data-pp="decor">装扮</button></div>';
    }

    html += '</div>';

    return html;
  }

  /* 把装饰落到页面上：头像框、背景色 */
  function applyLook(panel, d) {
    var av = panel.querySelector('.space-head .av');
    var cover = panel.querySelector('.space-cover');
    var dec = d.decor || {};
    var catalog = d.decorCatalog || {};

    if (av) {
      if (dec.frame && catalog[dec.frame]) {
        av.setAttribute('data-ppframe', dec.frame);
        av.style.setProperty('--ppf', catalog[dec.frame].color || '#3D7BF0');
      } else {
        av.removeAttribute('data-ppframe');
        av.style.removeProperty('--ppf');
      }
    }
    if (cover) {
      if (dec.bg && catalog[dec.bg]) {
        cover.setAttribute('data-ppbg', '1');
        cover.style.setProperty('--ppb', catalog[dec.bg].color || '#3D7BF0');
      } else {
        cover.removeAttribute('data-ppbg');
        cover.style.removeProperty('--ppb');
      }
    }
  }

  /* ---------- 渲染主流程 ---------- */

  function render() {
    var uid = curUid();
    if (!uid) return;

    var panel = document.querySelector('.p-panel');
    if (!panel) return;
    var head = panel.querySelector('.space-head');
    if (!head) return;

    var key = uid + '|' + location.hash;
    if (state.key === key && panel.querySelector('.pp-wrap')) {
      // 同一个页面重复触发，只在数据换了的时候重画
      return;
    }

    var seq = ++state.seq;
    load(uid).then(function (d) {
      if (seq !== state.seq) return;        // 期间切了页面，丢弃这次结果
      var uid2 = curUid();
      if (uid2 !== uid) return;

      var p2 = document.querySelector('.p-panel');
      if (!p2) return;
      var h2 = p2.querySelector('.space-head');
      if (!h2) return;

      // 幂等：先清掉上一次叠上去的东西
      var old = p2.querySelector('.pp-wrap');
      if (old) old.parentNode.removeChild(old);

      var box = document.createElement('div');
      box.className = 'pp-host';
      box.innerHTML = buildBlock(d);
      p2.insertBefore(box, h2.nextSibling);

      applyLook(p2, d);
      state.key = key;
      state.data = d;

      // 点「装扮」开面板
      var btn = box.querySelector('[data-pp="decor"]');
      if (btn) btn.addEventListener('click', function () { openDecor(d); });

      // 成就默认收起，点标题展开
      var body = box.querySelector('.pp-ach-body');
      var top = box.querySelector('.pp-ach-top');
      if (body && top) {
        body.style.maxHeight = '0px';
        top.addEventListener('click', function () {
          var open = body.getAttribute('data-open') === '1';
          body.setAttribute('data-open', open ? '0' : '1');
          // 32 条展开会很长的，超过 420 就内部滚动，别把整页推走
          body.style.maxHeight = open ? '0px' : Math.min(body.scrollHeight + 40, 420) + 'px';
          body.style.overflowY = open ? 'hidden' : 'auto';
        });
      }
    });
  }

  /* ---------- 装扮面板 ---------- */

  function openDecor(d) {
    var old = document.querySelector('.pp-modal');
    if (old) old.parentNode.removeChild(old);

    var catalog = d.decorCatalog || {};
    var ach = d.ach || [];

    // 已解锁的装饰按类型分组
    var groups = { frame: [], plate: [], title: [], bg: [] };
    ach.forEach(function (a) {
      if (!a.unlocked) return;
      var it = catalog[a.reward && a.reward.id];
      if (!it) return;
      if (groups[it.kind]) groups[it.kind].push({ id: a.reward.id, name: it.name, color: it.color, ach: a.name });
    });

    var cur = d.decor || {};

    function row(kind, label, list, current, single) {
      if (!list.length) return '';
      var items = list.map(function (x) {
        var on = current === x.id ? ' on' : '';
        return '<button type="button" class="pp-pick' + on + '" data-kind="' + kind + '" data-id="' + esc(x.id) + '">' +
          '<i style="background:' + esc(x.color || '#8C97A8') + '"></i>' + esc(x.name) + '</button>';
      }).join('');
      var none = '<button type="button" class="pp-pick' + (current ? '' : ' on') + '" data-kind="' + kind + '" data-id="">不挂</button>';
      return '<div class="pp-row"><label>' + label + '</label><div class="pp-picks">' + none + items + '</div></div>';
    }

    /* 展示徽章是多选：用已解锁成就的图标，最多挂 3 个。
       这一行以前没有，所以 a_wearall（挂满三个）根本达不成。 */
    function badgeRow(pool, current) {
      if (!pool.length) return '';
      var items = pool.map(function (a) {
        var on = current.indexOf(a.id) >= 0 ? ' on' : '';
        return '<button type="button" class="pp-pick pp-bdpick' + on + '" data-badge="' + esc(a.id) + '" title="' + esc(a.desc) + '">' +
          '<i class="pp-bdi">' + esc(a.icon || '·') + '</i>' + esc(a.name) + '</button>';
      }).join('');
      return '<div class="pp-row"><label>展示徽章（最多 3 个）</label><div class="pp-picks">' + items + '</div></div>';
    }

    var html = '<div class="pp-modal">' +
      '<div class="pp-mbox">' +
      '<div class="pp-mhead"><b>装扮个人主页</b><button type="button" class="pp-x" data-pp="close">关闭</button></div>' +
      '<div class="pp-mbody">' +
      row('frame', '头像框', groups.frame, cur.frame) +
      row('plate', '名牌', groups.plate, cur.plate) +
      row('title', '称号（只挂一个）', groups.title, cur.title) +
      row('bg', '主页背景', groups.bg, cur.bg) +
      badgeRow(ach.filter(function (a) { return a.unlocked; }), cur.badges || []) +
      '<div class="pp-row"><label>能力简介</label>' +
      '<textarea class="pp-cap-input" maxlength="200" placeholder="一句话说明你擅长什么，200 字以内">' + esc(cur.capability || '') + '</textarea></div>' +
      (groups.frame.length || groups.plate.length || groups.title.length
        ? '' : '<div class="pp-none">还没有解锁任何装饰。做完成就才会出现可挂的东西。</div>') +
      '</div>' +
      '<div class="pp-mfoot"><span class="pp-msg"></span><button type="button" class="pp-btn" data-pp="save">保存</button></div>' +
      '</div></div>';

    var host = document.createElement('div');
    host.innerHTML = html;
    var modal = host.firstChild;
    document.body.appendChild(modal);

    var picked = { frame: cur.frame || '', plate: cur.plate || '', title: cur.title || '', bg: cur.bg || '', badges: cur.badges || [] };

    modal.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-pp],[data-kind],[data-badge]') : null;
      if (!t) { if (e.target === modal) modal.parentNode.removeChild(modal); return; }

      if (t.getAttribute('data-pp') === 'close') { modal.parentNode.removeChild(modal); return; }

      // 展示徽章：点一下挂上，再点一下摘掉，超过 3 个把最早挂的挤出去
      var bd = t.getAttribute('data-badge');
      if (bd) {
        var bi = picked.badges.indexOf(bd);
        if (bi >= 0) {
          picked.badges.splice(bi, 1);
          t.classList.remove('on');
        } else {
          if (picked.badges.length >= 3) {
            var drop = picked.badges.shift();
            var db = modal.querySelector('[data-badge="' + drop + '"]');
            if (db) db.classList.remove('on');
          }
          picked.badges.push(bd);
          t.classList.add('on');
        }
        return;
      }

      var kind = t.getAttribute('data-kind');
      if (kind) {
        picked[kind] = t.getAttribute('data-id') || '';
        var sibs = modal.querySelectorAll('[data-kind="' + kind + '"]');
        for (var i = 0; i < sibs.length; i++) sibs[i].classList.remove('on');
        t.classList.add('on');
        return;
      }

      if (t.getAttribute('data-pp') === 'save') { saveDecor(modal, picked); }
    });
  }

  function saveDecor(modal, picked) {
    var ta = modal.querySelector('.pp-cap-input');
    var capability = ta ? ta.value.trim() : '';
    var msg = modal.querySelector('.pp-msg');
    if (msg) { msg.textContent = '保存中…'; msg.className = 'pp-msg'; }

    fetch('/api/profile', {
      method: 'POST',
      credentials: 'same-origin',
      headers: apiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        frame: picked.frame, plate: picked.plate, title: picked.title,
        bg: picked.bg, badges: picked.badges, capability: capability
      })
    }).then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.error) || '保存失败');
        if (msg) { msg.textContent = '已保存'; msg.className = 'pp-msg ok'; }
        // 让主页重新拉一次数据
        state.key = '';
        setTimeout(function () {
          if (modal.parentNode) modal.parentNode.removeChild(modal);
          render();
        }, 400);
      })
      .catch(function (e) {
        if (msg) { msg.textContent = (e && e.message) || '保存失败，可能没有连上云端'; msg.className = 'pp-msg err'; }
      });
  }

  /* ---------- 埋点 ----------
   * 只记"进过哪个模块、用了几次占卜、收藏了几个帖"，不记任何内容。
   * 攒 5 秒或页面切走时发一次，别把请求打满。
   * 注意：这不是给成就作弊用的 —— 次数在服务端累加，前端只能加不能减。
   */

  var FLAG_ROUTE = {
    forum: 'r_forum', post: 'r_post', room: 'chat', workgroup: 'chat',
    chat: 'dm', messages: 'dm', oa: 'r_oa', settings: 'r_settings',
    friends: 'r_friends', network: 'r_network', dashboard: 'r_dash',
    u: 'r_u', wanted: 'r_wanted', ask: 'r_ask', essence: 'r_essence',
    search: 'r_search', space: 'r_space', decorate: 'r_deco', ability: 'r_ability',
    archives: 'roster', events: 'archive', event: 'archive',
    library: 'archive', codex: 'archive',
    divination: 'divine', yijing: 'divine', tarot: 'divine', huang: 'divine',
    tetris: 'r_tetris'
  };

  var pending = {};
  var flushTimer = 0;

  function pushFlag(k, n) {
    if (!k) return;
    pending[k] = (pending[k] || 0) + (n || 1);
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushFlags, 5000);
  }

  function flushFlags() {
    if (!Object.keys(pending).length) return;
    var body = JSON.stringify({ flags: pending });
    pending = {};
    try {
      fetch('/api/profile', {
        method: 'POST',
        credentials: 'same-origin',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: body,
        keepalive: true
      }).catch(function () { /* 断网就丢了，不重试，免得刷屏 */ });
    } catch (e) { /* 老浏览器没有 keepalive，忽略 */ }
  }

  var lastRouteAt = {};

  function flagFromRoute() {
    var seg = (location.hash || '').replace(/^#\//, '').split(/[/?]/)[0] || '';
    var key = seg.replace(/-/g, '_');
    var f = FLAG_ROUTE[key];
    if (f) {
      // 同一个模块 30 秒内只记一次。app.js 路由会来回跳，
      // 不去重的话切一个页面能记好几次，占卜这类次数成就就被刷虚了
      var now = Date.now();
      if (!lastRouteAt[f] || now - lastRouteAt[f] > 30000) {
        lastRouteAt[f] = now;
        pushFlag(f, 1);
      }
    }

    // 每天记一条 day_YYYYMMDD，用来算"来过几天"，不记具体时刻
    var d = new Date();
    pushFlag('day_' + d.getFullYear() +
      ('0' + (d.getMonth() + 1)).slice(-2) +
      ('0' + d.getDate()).slice(-2), 1);
  }

  var lastFlagHash = null;
  window.addEventListener('hashchange', function () {
    if (location.hash !== lastFlagHash) {
      lastFlagHash = location.hash;
      flagFromRoute();
    }
  });

  // 收藏按钮：app.js 是点一次切换一次，所以只在"变成收藏"那一下记一笔
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('button,a') : null;
    if (!t) return;
    var txt = (t.textContent || '').replace(/\s+/g, '');
    if (/^(收藏|☆收藏|⭐收藏)$/.test(txt)) pushFlag('fav', 1);
  }, true);

  window.addEventListener('pagehide', flushFlags);

  /* ---------- 触发 ---------- */

  var tick = 0;
  function schedule() {
    clearTimeout(tick);
    tick = setTimeout(render, 260);
  }

  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);

  // app.js 渲染是异步的，光靠 hashchange 抓不准，再加一个低频巡检兜底
  setInterval(function () {
    if (curUid()) render();
  }, 1200);

  // 首屏也算一次访问：等 app.js 把路由定下来再记
  setTimeout(function () {
    lastFlagHash = location.hash;
    flagFromRoute();
  }, 1500);
})();
