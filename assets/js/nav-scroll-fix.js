/* 手机顶部横滑条「划不动」兜底修复
 *
 * 现象：手机上 .sidebar 那一条横向导航（论坛首页 / 发帖提问 / 云端账号 …）
 *      偶尔左右滑不动，尤其出现在切换板块之后。
 * 已知的两个来源：
 *   1) 手机端「全部功能」面板的全屏遮罩 .sb-mask（z-index:209, inset:0）
 *      在页面重建后可能残留，把整页手势全部吃掉；
 *   2) 面板收起没走完时，body 的 overflow:hidden 会留在新页面里。
 * 这个脚本不猜是哪一处，改成持续自检：面板没开却存在遮罩 / 存在锁滚动，就清掉；
 * 同时把横滑条自身的滚动能力钉死，避免被别的样式或重建过程改掉。
 */
(function () {
  'use strict';
  if (window.__ndtNavScrollFix) { return; }
  window.__ndtNavScrollFix = 1;

  var STYLE_ID = 'ndt-nav-scroll-fix';

  /* 把横滑条该有的能力用 !important 钉住：
     横向滚动归它自己，纵向滑动照旧交给页面。 */
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) { return; }
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = '@media (max-width:900px){' +
      '.nav-wrap{pointer-events:auto !important;}' +
      '.sidebar{overflow-x:auto !important;overflow-y:hidden !important;' +
      'touch-action:pan-x pan-y !important;-webkit-overflow-scrolling:touch !important;}' +
      '.sb-toggle{pointer-events:auto !important;}' +
      '}';
    (document.head || document.documentElement).appendChild(s);
  }

  function panelOpen() {
    var sheet = document.querySelector('.sb-sheet');
    if (!sheet) { return false; }
    return sheet.classList.contains('on');
  }

  function clean() {
    ensureStyle();
    if (panelOpen()) { return; }

    /* 面板没开着，却还留着全屏遮罩 → 删掉，否则手势全被它吃掉 */
    var masks = document.querySelectorAll('.sb-mask');
    for (var i = masks.length - 1; i >= 0; i--) {
      if (masks[i].parentElement) { masks[i].parentElement.removeChild(masks[i]); }
    }

    /* 面板没开着，却还锁着整页滚动 → 解开 */
    if (document.body && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  }

  var timer = 0;
  function tick() {
    if (timer) { return; }
    timer = setTimeout(function () {
      timer = 0;
      try { clean(); } catch (e) {}
    }, 60);
  }

  function start() {
    ensureStyle();
    clean();
    try {
      new MutationObserver(tick).observe(document.body, {
        childList: true, subtree: true,
        attributes: true, attributeFilter: ['class', 'style']
      });
    } catch (e) {}
    /* 再兜一道：重建不一定都会触发观察器，这里定期补一次 */
    setInterval(function () { try { clean(); } catch (e) {} }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
