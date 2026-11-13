/* 哪都通 · 弱网不掉线（旁路脚本，不改 app.js）
 *
 * 问题：app.js 每次打开都会用 token 请求 /api/auth/me 确认身份。
 *      国内直连 Cloudflare 时这个请求很容易超时，一失败它就把当前用户置空，
 *      界面立刻变回未登录——可实际 token 还在，有效期 30 天，只是没确认上而已。
 *      于是体感就是"必须挂梯子才登得上"。
 *
 * 做法：只盯 /api/auth/me 这一条请求。
 *      · 正常返回 → 把服务端给的用户信息缓存到本地
 *      · 网络不通 / 超时 / 5xx → 用缓存的身份伪造一份正常响应，上层继续当登录态
 *      · 真正 401（token 过期或被踢下线）→ 原样返回，该掉线就掉线，不骗人
 */
(function () {
  'use strict';
  if (window.__ndtNetResilience) { return; }
  window.__ndtNetResilience = 1;
  if (!window.fetch) { return; }

  var KEY = 'ndt-cloud-user-cache';
  var RE = /\/auth\/me(\?|$)/;
  var TIMEOUT = 12000;

  function readCache() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function saveCache(user) {
    if (!user || !user.id) { return; }
    try { localStorage.setItem(KEY, JSON.stringify(user)); } catch (e) {}
  }
  function offlineResponse(user) {
    return new Response(
      JSON.stringify({ user: user, offline: true, degraded: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  var orig = window.fetch;

  window.fetch = function (input, init) {
    var url = '';
    try {
      url = (typeof input === 'string') ? input : ((input && input.url) || '');
    } catch (e) { url = ''; }
    if (!RE.test(url)) { return orig.apply(this, arguments); }

    var self = this;
    var opts = init;
    var ctrl = null, timer = null;
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

      /* 401：token 真的不认了，原样交给上层，让它按正常流程掉线 */
      if (res && res.status === 401) { return res; }

      /* 5xx / 网关报错：等同于"没连上"，用缓存身份顶上 */
      if (!res || res.status >= 500) {
        var cached = readCache();
        if (cached) { return offlineResponse(cached); }
        return res;
      }

      /* 正常返回：把最新身份存下来，下次断网才有得用 */
      if (res.ok && typeof res.clone === 'function') {
        try {
          res.clone().json().then(function (d) {
            if (d && d.user) { saveCache(d.user); }
          }).catch(function () {});
        } catch (e) {}
      }
      return res;
    }, function (err) {
      if (timer) { clearTimeout(timer); }
      var cached = readCache();
      if (cached) { return offlineResponse(cached); }
      throw err;
    });
  };
})();
