/* ============================================================
   哪都通 · 论坛手机端视觉补丁（v48）
   ------------------------------------------------------------
   只做三件"看着不舒服"的小事，不碰 app.js：
   1) 板块 / 排序胶囊横滑时，右（左）端渐隐，让人知道还能滑
   2) 切板块后把当前选中的胶囊滚回视野内（否则高亮项被裁在外面）
   3) 横向导航条（手机上的侧栏）记住滑动位置，切板块后不跳回最左
   全部逻辑只在 680 以下生效。
   ============================================================ */
(function () {
  'use strict';
  if (!window.matchMedia) return;
  var MQ = window.matchMedia('(max-width: 680px)');
  function isMobile() { return MQ.matches; }

  /* ---------- 1. 横滑胶囊两端渐隐 ---------- */
  function fade(el) {
    if (!el) return;
    var max = el.scrollWidth - el.clientWidth;
    if (max <= 4) { el.removeAttribute('data-pf'); return; }
    var x = el.scrollLeft;
    var flags = [];
    if (x >= 3) flags.push('l');
    if (x <= max - 3) flags.push('r');
    if (flags.length) el.setAttribute('data-pf', flags.join(' '));
    else el.removeAttribute('data-pf');
  }

  function centerActive(el) {
    if (!el) return;
    var on = el.querySelector('.ft.on');
    if (!on) return;
    var left = on.offsetLeft;
    var right = left + on.offsetWidth;
    var viewL = el.scrollLeft;
    var viewR = viewL + el.clientWidth;
    /* 只在高亮项真的被裁出去时才滚，避免"点一下就整条跳一下" */
    if (left >= viewL + 8 && right <= viewR - 8) return;
    try { on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }
    catch (e) { el.scrollLeft = Math.max(0, left - 20); }
  }

  function bindTabs() {
    if (!isMobile()) return;
    var tabs = document.querySelectorAll('.forum-tabs');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      if (!t.__pfBound) {
        t.__pfBound = true;
        t.addEventListener('scroll', function (e) { fade(e.currentTarget); }, { passive: true });
      }
      fade(t);
      centerActive(t);
    }
  }

  /* ---------- 2. 横向导航记住滑动位置 ---------- */
  var sideLeft = 0;
  document.addEventListener('scroll', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('sidebar')) sideLeft = t.scrollLeft;
  }, true);

  function restoreSide() {
    if (!isMobile() || sideLeft <= 0) return;
    var side = document.querySelector('.sidebar');
    if (side && Math.abs(side.scrollLeft - sideLeft) > 4) side.scrollLeft = sideLeft;
  }

  /* ---------- 3. 页面重绘后重新绑定（路由切换会整体重建） ---------- */
  var timer = null;
  function refresh() {
    bindTabs();
    restoreSide();
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(refresh, 60);
  }

  window.addEventListener('resize', refresh);
  window.addEventListener('hashchange', function () { setTimeout(refresh, 240); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(refresh, 300); });
  } else {
    setTimeout(refresh, 300);
  }

  try {
    var app = document.getElementById('app');
    if (app && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (mo._t) return;
        mo._t = setTimeout(function () { mo._t = 0; schedule(); }, 40);
      });
      mo.observe(app, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
