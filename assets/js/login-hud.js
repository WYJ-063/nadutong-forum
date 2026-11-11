/* 登录 / 注册 / 改密的进度与结果反馈
 *
 * 做法：旁路观察 fetch，不改写请求，也不改变原有返回结果。
 *      命中 /api/auth/login、/auth/register、/auth/password 时：
 *        · 发起 -> 顶部出现 3px 品牌蓝细进度条
 *        · 成功 -> 收起细条，底部弹一个蓝色胶囊「登录成功」
 *        · 失败 -> 透出服务端返回的 error 原文（账号或密码错误 / 该账号已被拉黑…）
 *        · 网络断了 -> 灰色胶囊「网络没接上 · 请检查网络后重试」
 *
 * 用法：在 index.html 的 </body> 前加一行
 *       <script src="/assets/js/login-hud.js?v=1" defer></script>
 * 依赖：无。不需要改 app.js / main.css。
 */
(function () {
  'use strict';
  if (window.__ndtLoginHud) { return; }
  if (!window.fetch) { return; }
  window.__ndtLoginHud = 1;

  var BLUE = '#1B3FA0';
  var RED = '#C0392B';
  var GREY = '#3A4256';
  var Z = '2147483000';
  var RE = /\/auth\/(login|register|password)/;
  var NAME = { login: '登录', register: '注册', password: '修改密码' };
  var FONT = '-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';

  var track = null, bar = null, tip = null, hideTimer = null, rafId = 0;

  function ensure() {
    if (track && track.parentNode) { return; }
    var host = document.body || document.documentElement;

    track = document.createElement('div');
    track.style.cssText = 'position:fixed;left:0;top:0;right:0;height:3px;z-index:' + Z +
      ';background:#E9EDF5;display:none;pointer-events:none;';

    bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;top:0;left:0;height:100%;width:34%;background:' + BLUE +
      ';border-radius:0 999px 999px 0;will-change:transform;';
    track.appendChild(bar);
    host.appendChild(track);

    tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(6px);' +
      'z-index:' + Z + ';max-width:82vw;padding:10px 18px;border-radius:999px;' +
      'font:500 13px/1.5 ' + FONT + ';color:#fff;text-align:center;' +
      'box-shadow:0 8px 24px rgba(20,30,60,.18);opacity:0;display:none;' +
      'transition:opacity .18s ease,transform .18s ease;pointer-events:none;';
    host.appendChild(tip);
  }

  function animate() {
    if (!track || track.style.display === 'none') { return; }
    if (rafId) { cancelAnimationFrame(rafId); }
    var w = track.clientWidth || window.innerWidth || 360;
    var seg = Math.max(48, w * 0.34);
    var span = w + seg;
    var t0 = performance.now();

    function step(now) {
      if (!track || track.style.display === 'none') { rafId = 0; return; }
      var p = ((now - t0) / 1200) % 1;
      bar.style.transform = 'translateX(' + (-seg + span * p) + 'px)';
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  function start() {
    ensure();
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (tip) { tip.style.display = 'none'; tip.style.opacity = '0'; }
    track.style.display = 'block';
    bar.style.transform = 'translateX(-' + (Math.max(48, (track.clientWidth || 360) * 0.34)) + 'px)';
    animate();
  }

  function finish(ok, msg, verb) {
    ensure();
    track.style.display = 'none';
    var text = msg || (ok ? (verb + '成功') : (verb + '没成功 · 请重试'));
    tip.textContent = text;
    tip.style.background = ok ? BLUE : (/^网络/.test(text) ? GREY : RED);
    tip.style.display = 'block';
    tip.style.opacity = '0';
    tip.style.transform = 'translateX(-50%) translateY(8px)';
    void tip.offsetHeight;
    tip.style.opacity = '1';
    tip.style.transform = 'translateX(-50%) translateY(0)';

    if (hideTimer) { clearTimeout(hideTimer); }
    hideTimer = setTimeout(function () {
      if (!tip) { return; }
      tip.style.opacity = '0';
      tip.style.transform = 'translateX(-50%) translateY(6px)';
      hideTimer = setTimeout(function () {
        if (tip) { tip.style.display = 'none'; }
      }, 220);
    }, ok ? 1600 : 3200);
  }

  var orig = window.fetch;

  window.fetch = function (input, init) {
    var url = '';
    try {
      url = (typeof input === 'string') ? input : ((input && input.url) || '');
    } catch (e) { url = ''; }

    var m = RE.exec(url);
    if (!m) { return orig.apply(this, arguments); }

    var op = m[1] || 'login';
    var verb = NAME[op] || '登录';

    try { start(); } catch (e) {}

    var p = orig.apply(this, arguments);

    /* 旁路观察：只挂在原 promise 上，不替换它的返回值，网页拿到的还是原始结果 */
    try {
      p.then(function (res) {
        if (res && res.ok) {
          try { finish(true, '', verb); } catch (e) {}
          return;
        }
        var st = (res && res.status) || 0;
        var fallback = '网络不太稳 · ' + verb + '没成功';
        try {
          res.clone().json().then(function (d) {
            try { finish(false, (d && d.error) || fallback, verb); } catch (e) {}
          }).catch(function () {
            try { finish(false, fallback, verb); } catch (e) {}
          });
        } catch (e2) {
          try { finish(false, fallback, verb); } catch (e3) {}
        }
      }, function () {
        try { finish(false, '网络没接上 · 请检查网络后重试', verb); } catch (e) {}
      });
    } catch (e) {}

    return p;
  };
})();
