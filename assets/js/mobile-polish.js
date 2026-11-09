/* ============================================================
   手机端打磨脚本（v45）
   独立文件，不修改 app.js；只做四件事，全部在"手机宽度"下生效：
   1) 弹窗打开时锁住背景滚动（关掉后恢复原位置）
   2) 双击顶部栏回到顶部
   3) 输入框被软键盘挡住时自动滚到可见
   4) 横向导航条把当前项自动滚到中间
   ============================================================ */
(function () {
  'use strict';
  if (!window.matchMedia) return;
  var MQ = window.matchMedia('(max-width: 680px)');
  function isMobile() { return MQ.matches; }

  /* ---------- 1. 弹窗：锁背景滚动，避免手指一动整页跟着滑 ---------- */
  var lockY = 0, locked = false;
  function lockScroll() {
    if (locked || !isMobile()) return;
    lockY = window.scrollY || window.pageYOffset || 0;
    var b = document.body;
    b.style.position = 'fixed';
    b.style.top = -lockY + 'px';
    b.style.left = '0';
    b.style.right = '0';
    b.style.width = '100%';
    locked = true;
  }
  function unlockScroll() {
    if (!locked) return;
    var b = document.body;
    b.style.position = '';
    b.style.top = '';
    b.style.left = '';
    b.style.right = '';
    b.style.width = '';
    window.scrollTo(0, lockY);
    locked = false;
  }
  function watchMask() {
    var hasMask = !!document.querySelector('.modal-mask');
    if (hasMask) lockScroll(); else unlockScroll();
  }
  try {
    var mo = new MutationObserver(function () {
      /* 合并同一轮的多次变动，避免每次 DOM 改动都查一遍 */
      if (mo._t) return;
      mo._t = setTimeout(function () { mo._t = 0; watchMask(); }, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  /* ---------- 2. 双击顶部栏回到顶部（像微信双击状态栏） ---------- */
  var lastTap = 0;
  document.addEventListener('click', function (e) {
    if (!isMobile()) return;
    var top = e.target && e.target.closest ? e.target.closest('.portal-top, .topbar') : null;
    if (!top) return;
    /* 点在顶栏里的按钮/头像上时不要触发，避免误伤功能 */
    if (e.target.closest('.p-logo, .user-chip, a, button, input, .side-item')) return;
    var now = Date.now();
    if (now - lastTap < 340) {
      lastTap = 0;
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch (err) { window.scrollTo(0, 0); }
    } else {
      lastTap = now;
    }
  }, true);

  /* ---------- 3. 输入框被键盘挡住时滚到可见 ---------- */
  var vv = window.visualViewport;
  function ensureVisible(el) {
    if (!el || !vv) return;
    var r = el.getBoundingClientRect();
    var visibleBottom = vv.height + vv.offsetTop - 12;
    if (r.bottom <= visibleBottom && r.top >= vv.offsetTop) return;
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    catch (e) { el.scrollIntoView(); }
  }
  document.addEventListener('focusin', function (e) {
    if (!isMobile()) return;
    var t = e.target;
    if (!t || !t.tagName) return;
    if (!/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    /* 等键盘完全弹起（大约 260ms）再判断位置 */
    setTimeout(function () { ensureVisible(t); }, 280);
  });

  /* ---------- 4. 横向导航：当前项滚到中间 + 两端渐隐提示 ---------- */
  function centerActiveNav() {
    if (!isMobile()) return;
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var on = nav.querySelector('a.on');
    if (!on) return;
    try { on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }
    catch (e) {}
  }
  /* 按实际滚动位置决定左右要不要渐隐：滑到头就不再提示，避免"看着被切掉" */
  function updateFade(nav) {
    if (!nav) return;
    var max = nav.scrollWidth - nav.clientWidth;
    if (max <= 4) { nav.removeAttribute('data-mpf'); return; }
    var x = nav.scrollLeft;
    var flags = [];
    if (x >= 3) flags.push('l');
    if (x <= max - 3) flags.push('r');
    if (flags.length) nav.setAttribute('data-mpf', flags.join(' '));
    else nav.removeAttribute('data-mpf');
  }
  function refreshAllFades() {
    var list = document.querySelectorAll('.nav');
    for (var i = 0; i < list.length; i++) updateFade(list[i]);
  }
  function bindNavFade() {
    var list = document.querySelectorAll('.nav');
    for (var i = 0; i < list.length; i++) {
      var nav = list[i];
      if (nav.__mpBound) continue;
      nav.__mpBound = true;
      nav.addEventListener('scroll', function (e) { updateFade(e.currentTarget); }, { passive: true });
    }
    refreshAllFades();
  }
  window.addEventListener('hashchange', function () { setTimeout(centerActiveNav, 260); });
  window.addEventListener('resize', refreshAllFades);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () { centerActiveNav(); bindNavFade(); }, 400);
    });
  } else {
    setTimeout(function () { centerActiveNav(); bindNavFade(); }, 400);
  }
  /* 页面切路由会重建导航条，用 MutationObserver 补绑（带 60ms 合并） */
  try {
    var navMo = new MutationObserver(function () {
      if (navMo._t) return;
      navMo._t = setTimeout(function () { navMo._t = 0; bindNavFade(); }, 60);
    });
    navMo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
