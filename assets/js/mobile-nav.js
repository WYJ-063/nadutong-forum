/* ============================================================
   手机端导航：一行横滑 + 「更多」→ 底部半屏面板
   ------------------------------------------------------------
   手机上 .sidebar 是一条横滑条，28 个侧栏项加起来三千多像素宽，
   想找「个人空间」得横着划好几屏。这里保留一行横滑，右侧固定一颗
   「更多」按钮；点开是一张自己的底部面板，按原分组铺开。

   面板是一块独立的 DOM（.sb-sheet），不是把 .sidebar 本身改造成面板：
   .sidebar 的宽高被 main.css 锁着，就地改造成面板会塌成一行标题。
   面板里的每一项只是「影子」，点下去会转发给原来那一项，导航逻辑不动。
   桌面端（>900px）完全不介入。
   ============================================================ */
(function () {
  'use strict';
  var MQ = '(max-width: 900px)';
  var wrap = null;
  var bar = null;
  var btn = null;
  var sheet = null;
  var sheetBody = null;
  var mask = null;
  var timer = 0;

  function isMobile() {
    try { return window.matchMedia(MQ).matches; } catch (e) { return false; }
  }

  /* 面板挂在 .portal 里（同一个层叠上下文，z-index 才比得动）。
     .portal 是 static、无 transform，fixed 仍然相对视口。 */
  function host() {
    return document.querySelector('.portal') || document.body;
  }

  function ensureSheet() {
    if (sheet && sheet.parentElement) return;
    sheet = document.createElement('div');
    sheet.className = 'sb-sheet';

    var head = document.createElement('div');
    head.className = 'sb-sheet-head';
    var title = document.createElement('span');
    title.textContent = '全部功能';
    head.appendChild(title);
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'sb-sheet-close';
    close.textContent = '关闭';
    close.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      hide();
    });
    head.appendChild(close);

    sheetBody = document.createElement('div');
    sheetBody.className = 'sb-sheet-body';

    sheet.appendChild(head);
    sheet.appendChild(sheetBody);
    host().appendChild(sheet);
  }

  function ensureMask() {
    if (mask && mask.parentElement) return;
    mask = document.createElement('div');
    mask.className = 'sb-mask';
    mask.addEventListener('click', hide);
    host().appendChild(mask);
  }

  function dropMask() {
    if (mask && mask.parentElement) mask.parentElement.removeChild(mask);
    mask = null;
  }

  /* 按 .sidebar 里的原顺序重建成「分组标题 + 卡片」 */
  function build() {
    ensureSheet();
    if (!bar || !sheetBody) return;
    sheetBody.innerHTML = '';

    var groups = [];
    var cur = null;
    Array.prototype.forEach.call(bar.children, function (el) {
      if (!el.classList) return;
      if (el.classList.contains('sd-group')) {
        cur = { title: (el.textContent || '').trim(), items: [] };
        groups.push(cur);
        return;
      }
      if (el.classList.contains('side-item')) {
        if (!cur) { cur = { title: '', items: [] }; groups.push(cur); }
        cur.items.push(el);
      }
    });

    groups.forEach(function (g) {
      if (g.title) {
        var gt = document.createElement('div');
        gt.className = 'sb-sheet-g';
        gt.textContent = g.title;
        sheetBody.appendChild(gt);
      }
      g.items.forEach(function (src) {
        var it = document.createElement('button');
        it.type = 'button';
        it.className = 'sb-sheet-i' + (src.classList.contains('on') ? ' on' : '');
        var icon = src.querySelector('svg');
        if (icon) it.appendChild(icon.cloneNode(true));
        var label = src.querySelector('.side-item-label');
        var sp = document.createElement('span');
        sp.textContent = (label ? (label.textContent || '') : (src.textContent || '')).trim();
        it.appendChild(sp);
        it.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          hide();
          /* 延一小会儿再转发，让面板先收起来，不然会看到背景跳一下 */
          setTimeout(function () {
            try { src.click(); } catch (err) { }
          }, 60);
        });
        sheetBody.appendChild(it);
      });
    });
  }

  function hide() {
    if (sheet) sheet.classList.remove('on');
    if (btn) btn.classList.remove('is-hidden');
    dropMask();
    document.body.style.overflow = '';
  }

  function show() {
    build();
    if (!sheet) return;
    sheet.classList.add('on');
    if (btn) btn.classList.add('is-hidden');
    ensureMask();
    if (sheetBody) sheetBody.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function boot() {
    wrap = document.querySelector('.nav-wrap');
    bar = document.querySelector('.sidebar');
    if (!wrap || !bar) return;

    if (!isMobile()) {
      var old = wrap.querySelector('.sb-more');
      if (old && old.parentElement) old.parentElement.removeChild(old);
      btn = null;
      hide();
      return;
    }

    var exist = wrap.querySelector('.sb-more');
    if (!exist) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sb-more';
      btn.textContent = '更多';
      btn.setAttribute('aria-label', '展开全部功能');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (sheet && sheet.classList.contains('on')) hide();
        else show();
      });
      wrap.appendChild(btn);
    } else {
      btn = exist;
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
      var target = document.getElementById('app') || document.body;
      new MutationObserver(tick).observe(target, { childList: true, subtree: true });
    } catch (e) { }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
