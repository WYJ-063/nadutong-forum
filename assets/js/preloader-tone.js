/* ============================================================
   首屏加载遮罩 · 全屏磨砂玻璃
   ------------------------------------------------------------
   做两件事：
   1) 判断这次是从哪进来的——表面站（公开）还是内网（要登录）；
   2) 顶掉原来的 #page-preloader，铺一层雾面玻璃，等页面就绪再擦开。

   【为什么要自己起一层，而不是直接改原 preloader 的退出时机】
   app.js 里的 hidePreloader 是"加 is-done → setTimeout 700ms 后
   remove()"两步，节点句柄被闭包拿着，从外面既拦不住 add 也拦不住
   remove。想让它停久一点，只能抢在它前面把节点换掉，很脆。
   改成自己起一层覆盖在最上面、同时把原节点 display:none，
   app.js 那套逻辑照旧空转，互不干扰。

   【为什么磨砂一定得等页面渲染完再擦】
   backdrop-filter 模糊的是它底下的东西。首屏 #app 还空着的时候，
   雾面只是一块半透明纯色；等页面渲染出来了，柔焦才真的透得出来。
   所以"擦开"这一步永远发生在 readyState=complete 之后，
   最短停留只是保证"页面再快也别一闪而过"。
   ============================================================ */
(function(){
  "use strict";

  /* ---------- 本轮会话只播一次 ----------
     以前每次页面加载都会重新铺这层全屏动画，而且固定播 2.5 秒，
     于是"首页一次、进内网又一次"，来来回回地等。
     这里用 sessionStorage 记一次：同一轮会话里播过就不再播。
     · 切后台、来回切板块 —— 不清，继续用（正是用户想要的行为）
     · 彻底关掉标签页 / 杀掉 App —— 清掉，下次冷启动重新播 */
  var SEEN_KEY = "ndt.preloaderSeen";
  var seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch(e) {}

  if(seen){
    /* 不播了，但基础遮罩 #page-preloader 是写在 index.html 里的白底 logo，
       不压掉的话每次加载都会闪一下再消失，比不播还难看。这里用 head 里的
       一条样式直接压掉，早于 body 渲染生效，连闪都不会有。 */
    try{
      var kill = document.createElement("style");
      kill.textContent = "#page-preloader{display:none !important;}";
      (document.head || document.documentElement).appendChild(kill);
    }catch(e){}
    /* 顺手清掉上一轮可能还挂着的 veil */
    try{
      var old = document.getElementById("pl-veil");
      if(old && old.parentNode) old.parentNode.removeChild(old);
    }catch(e){}
    return;
  }
  try { sessionStorage.setItem(SEEN_KEY, "1"); } catch(e) {}

  /* 表面站路由白名单。其余一律按内网处理：
     内网路由很多（论坛/档案/关系网/OA/占卜…），将来加新的也不会漏判；
     表面站就这么几页，白名单更稳妥。 */
  var SURFACE = {
    "":1, home:1, track:1, service:1, sites:1, news:1,
    about:1, author:1, login:1, register:1, gate:1
  };

  var raw = String(location.hash || "").replace(/^#/, "");
  var segs = raw.split("?")[0].split("/").filter(Boolean);
  var first = segs[0] || "";
  var isSurface = SURFACE[first] === 1;

  var MIN  = 1800;   /* 最短停留：留出渐隐与加载的余量，整体观感约 2.5 秒 */
  var FADE = isSurface ? 560  : 700;    /* 渐隐时长 */
  var CAP  = 2600;   /* 最长停留 */

  var t0 = Date.now();
  var done = false;

  function build(){
    var veil = document.createElement("div");
    veil.id = "pl-veil";
    veil.className = isSurface ? "is-surface" : "is-intranet";
    veil.setAttribute("role", "status");
    veil.setAttribute("aria-label", isSurface ? "正在载入服务" : "正在接入内网");

    /* 线走满的时间比最短停留略短，让"走满"和"擦开"之间有一点从容 */
    veil.style.setProperty("--pv-bar-dur", Math.round(MIN * 0.75) + "ms");

    var tag   = isSurface ? "Nadutong Express" : "Intranet";
    var name  = isSurface ? "哪都通快递" : "异人论坛";
    var note  = isSurface ? "正在载入服务" : "内网接入中";

    veil.innerHTML =
        '<div class="pv-grain"></div>'
      + '<div class="pv-frame"><span class="c1"></span><span class="c2"></span><span class="c3"></span><span class="c4"></span></div>'
      + '<div class="pv-center">'
      +   '<div class="pv-tag">' + tag + '</div>'
      +   '<div class="pv-name">' + name + '</div>'
      +   '<div class="pv-line"><i></i></div>'
      +   '<div class="pv-note">' + note + '</div>'
      + '</div>';
    return veil;
  }

  function leave(){
    if(done) return;
    done = true;
    var v = document.getElementById("pl-veil");
    if(!v) return;
    v.classList.add("is-out");
    setTimeout(function(){
      if(v.parentNode) v.parentNode.removeChild(v);
    }, FADE + 60);
  }

  var veil = build();
  (document.body || document.documentElement).appendChild(veil);

  function tick(){
    var el = Date.now() - t0;
    var need = MIN - el;
    if(need > 0){ setTimeout(tick, need); return; }
    if(document.readyState === "complete"){ leave(); return; }
    window.addEventListener("load", leave, {once:true});
    setTimeout(leave, Math.max(0, CAP - el));
  }
  setTimeout(tick, 60);
})();
