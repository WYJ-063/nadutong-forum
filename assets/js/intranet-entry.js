/* ============================================================
   表层站 → 内网：跨界进入补一层进场过渡
   ------------------------------------------------------------
   app.js 里的 enterPortal 只挂在三个登录按钮（#g-go / #lg-go / #rg-go）
   上，所以登录完再进论坛、或者从公开站点直接跳 #/forum 的时候，
   页面是一下子换掉的，很生硬。

   这里只补这一个方向：hash 从「公开站页面」变成「内网页面」时，
   播一段和 enterPortal 同款的过渡。视觉直接复用 main.css 里
   现成的 .portal-entry / .pe-* 样式，不新增任何 CSS。

   已经播过的不会重复：#portal-entry（app.js 起的）在场就跳过。
   内网内部切换、以及退回公开站都不播。
   删掉 index.html 里对应那一行引用即完全回退。
   ============================================================ */
(function () {
  "use strict";

  /* 公开站路由白名单，跟 preloader 判的是同一套；不在这里的一律算内网 */
  var SURFACE = {
    "": 1, home: 1, track: 1, service: 1, sites: 1, news: 1,
    about: 1, author: 1, login: 1, register: 1, gate: 1
  };
  var STEPS = ["建立加密安全通道", "校验身份凭证", "同步异人档案", "接入异人论坛"];
  var HOLD = 1900;   /* 停留时长，和 enterPortal 的 1720 + 淡出 620 基本对齐 */
  var busy = false;

  function firstSeg(hash) {
    var raw = String(hash || "").replace(/^#/, "");
    var segs = raw.split("?")[0].split("/").filter(Boolean);
    return segs[0] || "";
  }
  function isSurface(hash) { return SURFACE[firstSeg(hash)] === 1; }

  var SHIELD = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" '
    + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/>'
    + '<path d="M9.2 12l2 2 3.6-4"/></svg>';

  /* main.css 里 .portal-entry 是 opacity:0 起步、靠 .is-in 做 0.45s 淡入。
     那套给「点按钮前先播、播完再跳」用没问题，但这里是在路由已经渲染完
     之后才挂遮罩，淡入的 0.45s 会让底下的论坛页透出来一截。
     所以这里单独覆写：一挂上就整屏实遮，只有离场是渐变的。 */
  function injectStyle() {
    if (document.getElementById("ie-style")) return;
    var st = document.createElement("style");
    st.id = "ie-style";
    st.textContent =
      "#iv-entry{opacity:1 !important;visibility:visible !important;"
      + "transition:opacity .55s ease !important;}"
      + "#iv-entry.is-leaving{opacity:0 !important;visibility:visible !important;}"
      + "#iv-entry .pe-box{opacity:0;transform:translateY(7px);"
      + "transition:opacity .5s ease .09s,transform .5s ease .09s;}"
      + "#iv-entry.is-in .pe-box{opacity:1;transform:none;}"
      + "@media (prefers-reduced-motion: reduce){#iv-entry .pe-box{transition:none;}}";
    document.head.appendChild(st);
  }

  /* 同步挂上遮罩，调用返回时画面已经盖住了 */
  function build() {
    if (busy) return null;
    /* app.js 的 enterPortal 已经在播，就别叠一层 */
    if (document.getElementById("portal-entry") || document.getElementById("iv-entry")) return null;
    busy = true;

    var ov = document.createElement("div");
    ov.id = "iv-entry";
    ov.className = "portal-entry";
    ov.innerHTML =
        '<div class="pe-bg"></div>'
      + '<div class="pe-box">'
      +   '<div class="pe-ring">'
      +     '<div class="pe-ring-rot"></div>'
      +     '<div class="pe-ring-rot pe-ring-rot2"></div>'
      +     '<div class="pe-shield">' + SHIELD + '</div>'
      +   '</div>'
      +   '<div class="pe-title">哪都通 · 异人论坛</div>'
      +   '<div class="pe-step">' + STEPS[0] + '<span class="pe-dots"></span></div>'
      +   '<div class="pe-bar"><div class="pe-bar-fill"></div></div>'
      +   '<div class="pe-percent">0%</div>'
      + '</div>';
    document.body.appendChild(ov);
    /* 遮罩本身上来就是实心的，这里只让圆环标题这些内容淡入，
       所以紧跟一帧就开始，不留空白期 */
    requestAnimationFrame(function () { ov.classList.add("is-in"); });
    return ov;
  }

  /* 撤掉（用于「其实没登录、被 app.js 弹回 #/gate」的情况） */
  function drop(ov) {
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    busy = false;
  }

  function animate(ov) {
    var stepEl = ov.querySelector(".pe-step");
    var fill = ov.querySelector(".pe-bar-fill");
    var pct = ov.querySelector(".pe-percent");
    var i = 0, p = 0;

    var stepTimer = setInterval(function () {
      i++;
      if (i < STEPS.length) stepEl.innerHTML = STEPS[i] + '<span class="pe-dots"></span>';
    }, 420);

    var progTimer = setInterval(function () {
      p = Math.min(100, p + Math.random() * 13 + 7);
      fill.style.width = p + "%";
      pct.textContent = Math.floor(p) + "%";
      if (p >= 100) { clearInterval(progTimer); clearInterval(stepTimer); }
    }, 110);

    setTimeout(function () {
      ov.classList.add("is-leaving");
      setTimeout(function () {
        if (ov.parentNode) ov.parentNode.removeChild(ov);
        busy = false;
      }, 640);
    }, HOLD);
  }

  var prev = location.hash;
  window.addEventListener("hashchange", function () {
    var from = prev, to = location.hash;
    prev = to;

    var fromIsSurface = isSurface(from);
    var toIsSurface = isSurface(to);

    /* 两种情况要过渡：
       1) 公开站 → 内网（跨站，最典型的「进内网」）
       2) 云端账号页 → 论坛（在 #/cloud 登录完云端账号再进论坛，
          app.js 那边只 router() 不播动画，这条就补上） */
    var crossSite = fromIsSurface && !toIsSurface;
    var afterCloud = firstSeg(from) === "cloud" && firstSeg(to) === "forum";
    if (!crossSite && !afterCloud) return;

    /* 先同步挂上遮罩：这一步跟 router 渲染是同一个事件循环，
       所以底下刚渲染出来的论坛页不会被看见，也就不会出现
       「先露一下内网界面、之后才播动画」 */
    injectStyle();
    var ov = build();
    if (!ov) return;

    /* 再复查一次：没登录时 app.js 会立刻把内网地址改回 #/gate，
       那种情况把遮罩撤掉，免得白闪 */
    setTimeout(function () {
      if (isSurface(location.hash)) { drop(ov); return; }
      animate(ov);
    }, 120);
  });
})();
