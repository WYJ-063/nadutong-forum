/* ============================================================
   内网进场动画 · 每页只放一次
   ------------------------------------------------------------
   app.js 的 enterPortal 只挂在三个登录按钮（#g-go / #lg-go / #rg-go）
   上，从「员工通道」「点名字」「隐藏入口」这些路径进论坛时页面是一下
   子换掉的，很生硬。这里补这一段，视觉直接复用 main.css 里现成的
   .portal-entry / .pe-* 样式。

   触发判据只有一个：.portal 从「不在」变成「在」。
   .portal 是 portalShell 渲染门户骨架时才有的根节点，表层站（快递站）
   和 #/gate 登录门都没有。所以：
     · 从任何入口第一次进内网 → 从无到有 → 放一次
     · 内网板块之间切换 → 一直在，不会从无到有 → 不打扰
     · 切到某个渲染稍慢的板块（比如数据中心）→ 顶多是节点被换新，
       不是从无到有 → 也不会放

   闸门 played 一旦置位，本页生命周期内永不复位（退出再进也不放）：
   等价于你说的「除非杀后台，再切换不会有动画」。
   首屏那次由 preloader-tone.js 的 #pl-veil 负责，不再叠第二层。

   删掉 index.html 里对应那一行引用即完全回退。
   ============================================================ */
(function () {
  "use strict";

  /* 公开站路由白名单，跟 preloader 判的是同一套；仅用于判断"冷启动时
     人到底站在哪一侧"，不再参与触发 */
  var SURFACE = {
    "": 1, home: 1, track: 1, service: 1, sites: 1, news: 1,
    about: 1, author: 1, login: 1, register: 1, gate: 1
  };
  var STEPS = ["建立加密安全通道", "校验身份凭证", "同步异人档案", "接入异人论坛"];
  var HOLD = 1900;   /* 停留时长，配上 640ms 淡出，从出现到消失约 2.5 秒 */
  var busy = false;

  function firstSeg(hash) {
    var raw = String(hash || "").replace(/^#/, "");
    var segs = raw.split("?")[0].split("/").filter(Boolean);
    return segs[0] || "";
  }
  function isSurface(hash) { return SURFACE[firstSeg(hash)] === 1; }
  function isPortal() { return !!document.querySelector(".portal"); }

  var SHIELD = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" '
    + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/>'
    + '<path d="M9.2 12l2 2 3.6-4"/></svg>';

  /* main.css 里 .portal-entry 是 opacity:0 起步、靠 .is-in 做 0.45s 淡入。
     那套给「点按钮前先播、播完再跳」用没问题，但这里是在路由已经渲染
     完之后才挂遮罩，淡入的 0.45s 会让底下的论坛页透出来一截。
     所以单独覆写：一挂上就整屏实遮，只有离场是渐变的。 */
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
    /* 别人已经在播（app.js 的 enterPortal / 首屏遮罩），就不叠 */
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
    /* 用 setTimeout 而不是 requestAnimationFrame：
       手机端页面切后台、或刚进页面还没拿到焦点时 rAF 会被完全挂起，
       内容就永远停在 opacity 0，只剩一张空遮罩。 */
    setTimeout(function () { ov.classList.add("is-in"); }, 80);
    return ov;
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

  function play() {
    injectStyle();
    var ov = build();
    if (!ov) { busy = false; return; }
    animate(ov);
  }

  /* ------------------------------------------------------------
     本页是否已经给过「进内网」的动画。置位后永不复位。
     冷启动就在内网（门户已渲染，或 hash 本身就是内网路由）时，
     这一次进入由 preloader 的首屏遮罩表达，所以直接算作已放。
     ------------------------------------------------------------ */
  var played = isPortal() || !isSurface(location.hash);

  /* 当前是否站在门户里，用来抓「从无到有」这一跳 */
  var hadPortal = isPortal();
  var pending = 0;

  var checkTimer = 0;

  /* 用 setTimeout 节流，不用 requestAnimationFrame：
     rAF 只在页面可见时跑，手机端切后台 / 进入瞬间窗口还没拿到焦点时会
     整段挂起。这一跳一旦挂掉，播放就拖到用户下一次切页面才补出来 ——
     也就是「进去没动画，切别的板块才有」。 */
  function schedule() {
    if (checkTimer) return;
    checkTimer = setTimeout(function () { checkTimer = 0; check(); }, 120);
  }

  function check() {
    /* app.js 的 enterPortal 一被点就挂 #portal-entry（比 .portal 出现还早），
       它出现就说明这一段进入的过渡已经有人负责了，直接认作已放，
       免得它 620ms 后收起、我这边又补一层。 */
    if (!played && document.getElementById("portal-entry")) played = true;

    var now = isPortal();
    if (now === hadPortal) return;
    hadPortal = now;
    if (!now) return;            /* 离开门户：played 不重置，回来也不放 */
    if (played) return;          /* 已经放过（或首屏放过） */

    /* 别人手里的遮罩正在播，认作已放 */
    played = true;
    if (document.getElementById("pl-veil")
      || document.getElementById("portal-entry")
      || document.getElementById("iv-entry")) return;

    play();
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });

  /* 兜底：个别入口可能是先设 hash、门户几拍之后才出现，
     这里只在还没放过的时候补看一眼，不影响幂等 */
  window.addEventListener("hashchange", function () {
    if (played) return;
    schedule();
  });
})();
