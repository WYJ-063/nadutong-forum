/* ============================================================
   手机端导航：一行横滑 + 右侧一颗下箭头 → 底部半屏面板
   ------------------------------------------------------------
   手机上 .sidebar 是一条横滑条，28 个侧栏项加起来三千多像素宽，
   想找「个人空间」得横着划好几屏。这里保留一行横滑，右侧放一颗小小的
   下箭头；点开是一张自己的底部面板，按原分组铺开。

   面板是一块独立的 DOM（.sb-sheet），不是把 .sidebar 本身改造成面板：
   .sidebar 的宽高被 main.css 锁着，就地改造成面板会塌成一行标题。
   面板里的每一项只是「影子」，点下去会转发给原来那一项，导航逻辑不动。

   箭头永远可见、只做旋转，不做隐藏 —— 之前那版在打开时把按钮淡出，
   一旦某次收起没走到，按钮就永久消失、再也点不开。现在开/关都靠它，
   不存在「找不到入口」这种情况。桌面端（>900px）完全不介入。
   ============================================================ */
(function () {
  'use strict';
  var MQ = '(max-width: 900px)';
  var wrap = null;
  var bar = null;
  var btn = null;
  var sheet = null;
  var sheetBody = null;
  var timer = 0;

  function isMobile() {
    try { return window.matchMedia(MQ).matches; } catch (e) { return false; }
  }

  /* 面板挂在 document.body 上，不挂 .portal。
     .portal 是 SPA 的渲染区，切板块、局部刷新的时候会被整体清空重建，
     挂进去的面板会跟着一起消失 —— 表现就是「点开过一次以后再也点不开」。
     body 不参与重建，fixed 定位也不受 body 滚动影响。 */
  function host() {
    return document.body;
  }

  /* 清旧版残留（只清侧栏里的，不碰面板本身）：
     上一版是把 .sidebar 改造成面板的，会往横滑条里插一条「全部功能 / 关闭」
     头部，并给 .sidebar 加 sb-open；再上一版是右上角一颗「更多」胶囊按钮。
     浏览器里留着旧 JS 缓存时这些东西会一直挂着，所以每次启动都扫一遍。 */
  function cleanSidebar() {
    var b = document.querySelector('.sidebar');
    if (b) {
      if (b.classList.contains('sb-open')) b.classList.remove('sb-open');
      var heads = b.querySelectorAll('.sb-sheet-head');
      for (var i = heads.length - 1; i >= 0; i--) {
        if (heads[i].parentElement) heads[i].parentElement.removeChild(heads[i]);
      }
    }
    var w = document.querySelector('.nav-wrap');
    if (w) {
      var more = w.querySelectorAll('.sb-more');
      for (var j = more.length - 1; j >= 0; j--) {
        if (more[j].parentElement) more[j].parentElement.removeChild(more[j]);
      }
    }
    /* 注意：这里不能碰 .sb-mask。
       这个清理函数挂在每次 DOM 变动（80ms 节流）上跑，如果顺手把遮罩删了，
       面板刚打开遮罩就没了；遮罩本来负责"点外面收起"，删掉之后点面板外
       没有任何反应，看起来就像"点开一次就卡死、再也点不开"。
       遮罩的增删只由 show() / hide() 管。 */
  }

  /* 启动时额外清一次彻底现场：任何残留的面板都删掉，引用置空 */
  function purgeAll() {
    var olds = document.querySelectorAll('.sb-sheet');
    for (var i = olds.length - 1; i >= 0; i--) {
      if (olds[i].parentElement) olds[i].parentElement.removeChild(olds[i]);
    }
    sheet = null;
    sheetBody = null;
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
    var old = document.querySelectorAll('.sb-mask');
    for (var i = 0; i < old.length; i++) {
      if (old[i].parentElement) old[i].parentElement.removeChild(old[i]);
    }
    var mask = document.createElement('div');
    mask.className = 'sb-mask';
    mask.addEventListener('click', hide);
    host().appendChild(mask);
    return mask;
  }

  function dropMask() {
    var masks = document.querySelectorAll('.sb-mask');
    for (var i = masks.length - 1; i >= 0; i--) {
      if (masks[i].parentElement) masks[i].parentElement.removeChild(masks[i]);
    }
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
    if (btn) btn.classList.remove('is-open');
    dropMask();
    document.body.style.overflow = '';
  }

  function show() {
    build();
    if (!sheet) return;
    dropMask();          /* 先清干净，避免叠两层遮罩 */
    ensureMask();
    sheet.classList.add('on');
    if (btn) btn.classList.add('is-open');
    if (sheetBody) sheetBody.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function makeToggle() {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sb-toggle';
    btn.setAttribute('aria-label', '展开全部功能');
    var caret = document.createElement('span');
    caret.className = 'sb-toggle-caret';
    caret.textContent = '\u25BE';   /* ▾ */
    btn.appendChild(caret);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (sheet && sheet.classList.contains('on')) hide();
      else show();
    });
    return btn;
  }

  function boot() {
    cleanSidebar();
    wrap = document.querySelector('.nav-wrap');
    bar = document.querySelector('.sidebar');
    if (!wrap || !bar) return;

    if (!isMobile()) {
      var t = wrap.querySelector('.sb-toggle');
      if (t && t.parentElement) t.parentElement.removeChild(t);
      btn = null;
      hide();
      return;
    }

    var exist = wrap.querySelector('.sb-toggle');
    if (exist) {
      btn = exist;
    } else {
      btn = makeToggle();
      wrap.appendChild(btn);
    }

    /* 面板被上一次的页面重建一起删掉了，这里把引用丢掉，下次打开会重建 */
    if (sheet && !sheet.parentElement) {
      sheet = null;
      sheetBody = null;
    }
  }

  /* 切换板块时整个 portal 会重建，箭头会跟着丢，这里补回来 */
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
    cleanSidebar();
    purgeAll();
    boot();
    try {
      var target = document.getElementById('app') || document.body;
      new MutationObserver(tick).observe(target, { childList: true, subtree: true });
    } catch (e) { }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
