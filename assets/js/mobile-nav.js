/* ============================================================
   手机端导航：一行横滑 + 「更多」→ 底部半屏面板
   ------------------------------------------------------------
   手机上 .sidebar 是一条横滑条，28 个侧栏项加起来三千多像素宽，
   想找「个人空间」得横着划好几屏。
   这里保留一行横滑，只在右侧固定一个「更多」按钮；
   点开是一张底部面板：按原分组（论坛 / 业务系统 / 个人）
   三列铺开，点任意一项或点遮罩就收起。
   桌面端（>900px）完全不介入。
   ============================================================ */
(function () {
  'use strict';
  const MQ = '(max-width: 900px)';
  let wrap = null;
  let bar = null;
  let btn = null;
  let timer = 0;
  let mask = null;

  function isMobile() {
    try { return window.matchMedia(MQ).matches; } catch (e) { return false; }
  }

  /* 面板头部：标题 + 关闭 */
  function ensureHead() {
    if (!bar || bar.querySelector('.sb-sheet-head')) return;
    const head = document.createElement('div');
    head.className = 'sb-sheet-head';
    const title = document.createElement('span');
    title.textContent = '全部功能';
    head.appendChild(title);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sb-sheet-close';
    close.textContent = '关闭';
    close.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      hide();
    });
    head.appendChild(close);
    bar.insertBefore(head, bar.firstChild);
  }

  function ensureMask(on) {
    if (on) {
      if (!mask) {
        mask = document.createElement('div');
        mask.className = 'sb-mask';
        mask.addEventListener('click', hide);
        document.body.appendChild(mask);
      }
    } else if (mask) {
      mask.parentElement.removeChild(mask);
      mask = null;
    }
  }

  function hide(scrollToo) {
    if (bar) bar.classList.remove('sb-open');
    if (wrap) wrap.classList.remove('sb-open');
    if (btn) btn.textContent = '更多';
    ensureMask(false);
    document.body.style.overflow = '';
  }

  function show() {
    if (!bar) return;
    ensureHead();
    bar.classList.add('sb-open');
    if (wrap) wrap.classList.add('sb-open');
    if (btn) btn.textContent = '收起';
    ensureMask(true);
    bar.scrollTop = 0;
    bar.scrollLeft = 0;
    document.body.style.overflow = 'hidden';
  }

  function boot() {
    wrap = document.querySelector('.nav-wrap');
    bar = document.querySelector('.sidebar');
    if (!wrap || !bar) return;
    /* 桌上不动手：清掉手机上留下的按钮、面板和遮罩 */
    if (!isMobile()) {
      const old = wrap.querySelector('.sb-more');
      if (old) old.parentElement.removeChild(old);
      hide();
      btn = null;
      return;
    }
    btn = wrap.querySelector('.sb-more');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sb-more';
      btn.textContent = '更多';
      btn.setAttribute('aria-label', '展开全部功能');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (bar.classList.contains('sb-open')) hide();
        else show();
      });
      wrap.appendChild(btn);
    }
    /* 点侧栏任一项就收起（等路由切换的渲染过去再收，避免闪） */
    if (!bar.dataset.sbBound) {
      bar.dataset.sbBound = '1';
      bar.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('.side-item')) {
          setTimeout(function () { hide(); }, 140);
        }
      });
    }
  }

  /* 切换板块时整个 portal 会重建，按钮会跟着丢，这里补回来 */
  function tick() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = 0;
      try { boot(); } catch (e) { }
    }, 80);
  }

  window.addEventListener('resize', function () {
    if (!isMobile()) hide();
    tick();
  });
  window.addEventListener('hashchange', function () { setTimeout(tick, 120); });

  function start() {
    boot();
    try {
      const target = document.getElementById('app') || document.body;
      new MutationObserver(tick).observe(target, { childList: true, subtree: true });
    } catch (e) { }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
