/* 哪都通 · 站点访问统计（旁路脚本，不修改 app.js）
 *
 * ① 每次打开页面上报一次，后端按天记 PV/UV；访客标识只存本机，不记录 IP
 * ② 管理员在「云端账号」页里直接看到统计
 *
 * 【为什么不再往侧栏插入口】
 * 早先的做法是在侧栏加一个「访问统计」项。手机端侧栏是一条横滑条，
 * 登录后这项被插进去，容器内容一变，浏览器就把 scrollLeft 拉回 0：
 * 手指往右划，条子立刻弹回左边，看起来就是"划不动 + 左右抖"；
 * 退出登录这项没了，现象自然消失。所以这里改成不碰侧栏，
 * 统计只在「云端账号」这一页里以内嵌卡片的形式出现。
 */
(function () {
  'use strict';

  var VID_KEY = 'ndt-visit-id';
  var CARD_ID = 'ndt-visit-card';

  function uid() {
    try {
      if (window.crypto && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID().replace(/-/g, '');
      }
    } catch (e) {}
    var s = '';
    for (var i = 0; i < 4; i++) { s += Math.random().toString(36).slice(2, 10); }
    return s.slice(0, 32);
  }
  function visitorId() {
    var v = null;
    try { v = localStorage.getItem(VID_KEY); } catch (e) {}
    if (!v || !/^[A-Za-z0-9_-]{8,64}$/.test(v)) {
      v = uid();
      try { localStorage.setItem(VID_KEY, v); } catch (e) {}
    }
    return v;
  }
  function ping() {
    try {
      fetch('/api/stats/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid: visitorId() }),
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* 统计失败一律不影响页面 */ }
  }
  function isAdmin() {
    try {
      return !!(Cloud && Cloud.connected && Cloud.user && Number(Cloud.user.role) >= 3);
    } catch (e) { return false; }
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- 卡片渲染（跟「云端账号」页同一套浅色风格） ---------- */
  function tile(label, value, unit) {
    return '<div style="background:#fff;border:1px solid var(--pt-line,#e5e8f0);border-radius:10px;padding:10px 12px">' +
      '<div style="color:#7f8a9d;font-size:12px">' + esc(label) + '</div>' +
      '<div style="margin-top:3px"><b style="font-size:19px;color:#1a2233">' + esc(value) + '</b>' +
      '<span style="color:#8b95a7;margin-left:3px;font-size:12px">' + esc(unit) + '</span></div>' +
      '</div>';
  }

  function render(box, d) {
    d = d || {};
    var today = d.today || {}, yest = d.yesterday || {}, tot = d.total || {};
    var l7 = d.last7 || [], daily = d.daily || [];
    var max = 1;
    for (var i = 0; i < l7.length; i++) {
      if (Number(l7[i].pv) > max) { max = Number(l7[i].pv); }
    }
    var bars = l7.map(function (x) {
      var w = Math.max(3, Math.round((Number(x.pv) || 0) / max * 100));
      return '<div style="display:flex;align-items:center;gap:8px;margin:5px 0;font-size:12px">' +
        '<span style="width:52px;color:#7f8a9d">' + esc(String(x.day).slice(5)) + '</span>' +
        '<span style="flex:1 1 auto;height:7px;background:#e9edf5;border-radius:4px;overflow:hidden">' +
          '<span style="display:block;height:7px;width:' + w + '%;background:linear-gradient(90deg,#3b82f6,#f97316)"></span>' +
        '</span>' +
        '<span style="flex:0 0 92px;text-align:right;color:#6a7185">' + esc(x.uv) + ' 人 / ' + esc(x.pv) + ' 次</span>' +
        '</div>';
    }).join('');

    var table = daily.length
      ? '<div style="color:#7f8a9d;margin:12px 0 4px;font-size:12px">最近 30 天</div>' +
        '<div style="max-height:200px;overflow:auto;border-top:1px solid var(--pt-line,#e5e8f0)">' +
        daily.map(function (x) {
          return '<div style="display:flex;justify-content:space-between;padding:4px 0;' +
            'border-bottom:1px solid #f0f2f7;font-size:12px">' +
            '<span style="color:#6a7185">' + esc(x.day) + '</span>' +
            '<span style="color:#1a2233">访客 <b>' + esc(x.uv) + '</b> · 浏览 <b>' + esc(x.pv) + '</b></span>' +
            '</div>';
        }).join('') + '</div>'
      : '<div style="margin-top:10px;color:#9aa3b5;font-size:12px">还没有数据，等有过访问之后这里就会出现。</div>';

    box.style.color = 'inherit';
    box.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px">' +
        tile('今日访客', today.uv || 0, '人') +
        tile('今日浏览', today.pv || 0, '次') +
        tile('昨日访客', yest.uv || 0, '人') +
        tile('昨日浏览', yest.pv || 0, '次') +
      '</div>' +
      '<div style="color:#7f8a9d;margin-bottom:2px;font-size:12px">近 7 天</div>' + bars +
      '<div style="margin-top:10px;padding-top:9px;border-top:1px solid var(--pt-line,#e5e8f0);' +
        'color:#6a7185;font-size:12px">' +
        '累计访客 <b style="color:#1a2233">' + esc(tot.uv || 0) + '</b> 人 · ' +
        '累计浏览 <b style="color:#1a2233">' + esc(tot.pv || 0) + '</b> 次' +
      '</div>' + table +
      '<div style="margin-top:8px;color:#9aa3b5;font-size:11.5px">' +
        '从功能上线当天开始累计；访客按本机随机标识去重，不记录 IP、不记录看过的内容。' +
      '</div>';
  }

  function load(box) {
    if (!box) { return; }
    /* Cloud 是 app.js 顶层脚本作用域里的变量，不挂在 window 上 */
    if (typeof Cloud === 'undefined' || !Cloud || typeof Cloud.request !== 'function') {
      box.textContent = '云端未连接，暂时读不到数据。';
      return;
    }
    Cloud.request('/stats/visit').then(function (d) {
      render(box, d);
    }).catch(function (e) {
      box.textContent = '读取失败：' + ((e && e.message) || '未知错误');
    });
  }

  /* ---------- 只在「云端账号」页内嵌一块 ---------- */
  function onCloudPage() {
    return /^#\/cloud(?:[?/]|$)/.test(location.hash || '');
  }

  /* 「云端账号」页里有账号设置，用它认页面；别的页面的 .p-panel 不碰 */
  function findHost() {
    var panels = document.querySelectorAll('.p-panel');
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].querySelector('#acct-name-save') || panels[i].querySelector('#cloud-export')) {
        return panels[i];
      }
    }
    return null;
  }

  function ensureCard() {
    if (!onCloudPage()) { return; }
    if (!isAdmin()) { return; }
    if (document.getElementById(CARD_ID)) { return; }
    var host = findHost();
    if (!host) { return; }
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.style.cssText = 'margin-top:14px;padding:14px 16px;border:1px solid var(--pt-line,#e5e8f0);' +
      'border-radius:14px;background:var(--pt-soft,#f7f8fc)';
    card.innerHTML = '<strong>📊 访问统计</strong>' +
      '<div data-body style="color:#7f8a9d;margin-top:8px;font-size:12.5px">正在读取…</div>';
    host.appendChild(card);
    load(card.querySelector('[data-body]'));
  }

  var timer = 0;
  function tick() {
    if (timer) { return; }
    timer = setTimeout(function () {
      timer = 0;
      try { ensureCard(); } catch (e) {}
    }, 80);
  }

  function boot() {
    ping();
    tick();
    window.addEventListener('hashchange', function () { setTimeout(tick, 150); });
    try {
      new MutationObserver(tick).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
