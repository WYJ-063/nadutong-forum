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

  /* 超时与自动重试：国内直连 Cloudflare 常见"请求发出去了但一直不返回"，
     以前只会在进度条上干转，用户只能刷新重来。现在 15 秒没结果就判这次没成，
     自动再试，最多三次；重试期间进度条一直转着，不会显得卡死。 */
  var TIMEOUT = 15000;
  var RETRY_MAX = 2;
  var RETRY_GAP = 1200;

  function soft(msg) {
    try {
      ensure();
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      tip.textContent = msg;
      tip.style.background = GREY;
      tip.style.display = 'block';
      tip.style.opacity = '1';
      tip.style.transform = 'translateX(-50%) translateY(0)';
    } catch (e) {}
  }

  /* 业务性错误（账号密码错、被拉黑、字段不合法）不该重试，重试只会更慢 */
  function permanent(err) {
    var msg = String((err && err.message) || '');
    return /账号或密码错误|已被拉黑|已被禁言|不能为空|最多|请输入/.test(msg);
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
    var self = this;

    try { start(); } catch (e) {}

    function tick(n) {
      if (n > 0) { soft('网络不太稳 · 正在重试 ' + n + '/' + RETRY_MAX); }

      var opts = init;
      var ctrl = null, timer = null;
      /* 给这一层加超时；调用方自己带了 signal 就不动它 */
      var canAbort = (typeof AbortController === 'function') &&
        opts && typeof opts === 'object' && !opts.signal;
      if (canAbort) {
        try {
          ctrl = new AbortController();
          opts = Object.assign({}, opts, { signal: ctrl.signal });
        } catch (e) { ctrl = null; }
      }
      if (ctrl) {
        timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, TIMEOUT);
      }

      var req;
      try { req = orig.call(self, input, opts); }
      catch (e) { req = Promise.reject(e); }

      return req.then(function (res) {
        if (timer) { clearTimeout(timer); }
        return res;
      }, function (err) {
        if (timer) { clearTimeout(timer); }
        if (n < RETRY_MAX && !permanent(err)) {
          return new Promise(function (resolve) { setTimeout(resolve, RETRY_GAP * (n + 1)); })
            .then(function () { return tick(n + 1); });
        }
        throw err;
      });
    }

    return tick(0).then(function (res) {
      if (res && res.ok) { try { finish(true, '', verb); } catch (e) {} return res; }
      /* 服务端明确拒绝：透出服务端 error 原文，例如"账号或密码错误" */
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
      return res;
    }, function (err) {
      try { finish(false, '网络没接上 · 已试 ' + (RETRY_MAX + 1) + ' 次，换个时间再试试', verb); } catch (e) {}
      throw err;
    });
  };
})();
