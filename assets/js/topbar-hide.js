/* ============================================================
   手机端顶栏「永久收起」—— 逻辑部分
   ------------------------------------------------------------
   开关状态存在 localStorage（nadutong.topbar.hide）。
   开启后：顶栏被一直按住（.portal-top.is-hidden + .portal.is-top-hidden），
   这两个 class 原本是滚动隐藏用的，页面里 --topbar-h / 上边距 / 横滑导航
   的位置都跟着它联动，所以按住它不会留下一条空白。
   顶上只留一个下拉箭头，点它把顶栏拉下来，再点或往下滚就推回去。
   关掉：清掉这两个 class，完全交回 app.js 的滚动隐藏。
   独立文件，不想用删掉这一行引用即可。
   ============================================================ */
(function () {
  "use strict";

  var KEY = "nadutong.topbar.hide";
  var MAXW = 900;
  /* 预览用：地址栏带 tvh=1 / tvh=0 可临时强制状态，不写盘 */
  var forced = /[?&]tvh=1\b/.test(location.search) ? true
    : (/[?&]tvh=0\b/.test(location.search) ? false : null);
  var persist = forced === null;

  var ICON_UP = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V7M6 13l6-6 6 6"/></svg>';
  var ICON_DOWN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v12M6 11l6 6 6-6"/></svg>';

  function mobile() { return window.innerWidth <= MAXW; }
  function stored() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function save(v) { try { if (v) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch (e) {} }

  var on = forced === null ? stored() : forced;

  var tgl = document.createElement("button");
  tgl.type = "button";
  tgl.className = "tvh-btn";
  tgl.id = "tvh-toggle";

  var peeker = document.createElement("button");
  peeker.type = "button";
  peeker.id = "tvh-peek";
  peeker.setAttribute("aria-label", "展开顶部栏");
  peeker.innerHTML = '<span class="tvh-arrow"></span>';
  document.body.appendChild(peeker);

  function paint() {
    tgl.innerHTML = on ? ICON_DOWN : ICON_UP;
    tgl.classList.toggle("tv-on", on);
    tgl.setAttribute("aria-label", on ? "展开顶部栏" : "收起顶部栏");
  }

  function topBar() {
    var p = document.querySelector(".portal");
    return p ? p.querySelector(".portal-top") : null;
  }

  /* 只有内网论坛门户才有「顶栏」这回事；表层站（哪都通快递）不启用 */
  function hasPortal() {
    return !!topBar();
  }

  function measure() {
    var t = topBar();
    if (t && t.offsetHeight) document.documentElement.style.setProperty("--tvh-top", t.offsetHeight + "px");
  }

  /* 按住顶栏那一行：只把 .portal-top 的滚动隐藏常驻，
     不动 .portal.is-top-hidden —— 那个会连带把导航条一起顶走，
     而导航条是要留着的（收起时它顶上来）。 */
  function enforce() {
    if (!on || !mobile() || !hasPortal()) return;
    if (document.body.classList.contains("tvh-peek")) return;
    var t = topBar();
    if (t && !t.classList.contains("is-hidden")) t.classList.add("is-hidden");
  }

  /* 放行：交回页面自己的滚动逻辑 */
  function release() {
    var t = topBar();
    if (t) t.classList.remove("is-hidden");
  }

  function applyMode() {
    var live = !!on && mobile() && hasPortal();
    document.body.classList.toggle("tvh-on", live);
    if (!live) document.body.classList.remove("tvh-peek");
    paint();
    if (live) enforce(); else release();
    measure();
  }

  function setOn(v) {
    on = !!v;
    if (persist) save(on);
    applyMode();
  }

  function setPeek(v) {
    var open = !!v && hasPortal();
    document.body.classList.toggle("tvh-peek", open);
    if (open) release(); else enforce();
    measure();
  }

  tgl.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!mobile()) return;
    setOn(!on);
  });

  peeker.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    setPeek(!document.body.classList.contains("tvh-peek"));
  });

  /* SPA 每次路由都会整块重建顶栏，按钮要补回去 */
  function repin() {
    var top = topBar();
    if (!top) return;
    if (!top.contains(tgl)) {
      var lo = top.querySelector("#p-logout");
      if (lo && lo.parentNode === top) top.insertBefore(tgl, lo);
      else top.appendChild(tgl);
    }
    paint();
  }

  var queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    /* 用 setTimeout 而不是 requestAnimationFrame：
       页面在后台、或宿在 iframe 里不可见时 rAF 整段不跑，
       收起状态就永远补不上（手机端切出去再进来必现）。 */
    setTimeout(function () {
      queued = false;
      repin();
      /* 路由切换会整块换掉页面（表层站 ↔ 内网），激活条件要重新判一遍 */
      applyMode();
      enforce();
    }, 0);
  }

  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].type === "childList") { refresh(); return; }
    }
    if (on && mobile()) refresh();
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", applyMode);
  window.addEventListener("orientationchange", function () { setTimeout(applyMode, 260); });

  /* 顶栏拉下来以后，往下滚就推回去 */
  var lastY = window.scrollY || 0;
  document.addEventListener("scroll", function () {
    var y = window.scrollY || 0;
    if (document.body.classList.contains("tvh-peek") && y - lastY > 8) setPeek(false);
    lastY = y;
  }, { passive: true });

  /* 顶栏拉下来以后，点到顶栏本身以外的地方也推回去（抽屉的老规矩） */
  document.addEventListener("click", function (e) {
    if (!document.body.classList.contains("tvh-peek")) return;
    var t = topBar();
    if (t && e.target && t.contains(e.target)) return;
    setPeek(false);
  }, true);

  repin();
  applyMode();
})();
