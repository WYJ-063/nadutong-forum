/* ============================================================
   深度适配脚本 v46
   1) 图片点开全屏查看（帖子正文 / 聊天照片通用），双击放大，下滑关闭
   2) 手机上滚动一段距离后出现「回到顶部」悬浮球
   3) 手机上内容过高的弹窗自动变成近全屏抽屉
   4) Esc 关闭最上层弹窗（桌面用得多）
   独立文件，不改 app.js；所有节点都自己创建、自己销毁。
   ============================================================ */
(function () {
  'use strict';

  var MOBILE = window.matchMedia ? window.matchMedia('(max-width: 680px)') : null;
  function isMobile() { return !!(MOBILE && MOBILE.matches); }

  /* ================= 1. 图片查看器 ================= */
  var viewer = null, viewerImg = null, bodyOvPrev = null, opened = false;

  function buildViewer() {
    if (viewer) return viewer;
    viewer = document.createElement('div');
    viewer.id = 'ndp-viewer';
    viewer.style.display = 'none';
    var img = document.createElement('img');
    img.className = 'ndp-img';
    img.alt = '';
    var hint = document.createElement('div');
    hint.className = 'ndp-hint';
    hint.textContent = isMobile() ? '双击放大 · 下滑关闭 · 点空白处关闭' : '点击放 / 再点还原 · 点空白处关闭';
    viewer.appendChild(img);
    viewer.appendChild(hint);
    document.body.appendChild(viewer);
    viewerImg = img;

    /* 点空白关闭；点图片本身切换放大 */
    viewer.addEventListener('click', function (e) {
      if (e.target === viewerImg) {
        viewerImg.classList.toggle('zoomed');
      } else {
        closeViewer();
      }
    });

    /* 下滑关闭（手机上最顺手），横向上限 60px 避免误触 */
    var sy = 0, dy = 0, tracking = false;
    viewer.addEventListener('touchstart', function (e) {
      if (!e.touches || e.touches.length !== 1) return;
      sy = e.touches[0].clientY; dy = 0; tracking = true;
    }, { passive: true });
    viewer.addEventListener('touchmove', function (e) {
      if (!tracking || !e.touches || e.touches.length !== 1) return;
      dy = e.touches[0].clientY - sy;
      if (dy > 0) viewerImg.style.transform = 'translateY(' + Math.min(dy, 160) + 'px) scale(.98)';
    }, { passive: true });
    viewer.addEventListener('touchend', function () {
      if (!tracking) return;
      tracking = false;
      if (dy > 90) { closeViewer(); return; }
      viewerImg.style.transform = '';
    });
    return viewer;
  }

  function openViewer(src) {
    if (!src) return;
    buildViewer();
    viewerImg.classList.remove('zoomed');
    viewerImg.style.transform = '';
    viewerImg.src = src;
    /* 记住原来的 overflow，关掉后原样还回去，不跟弹窗的锁滚动打架 */
    bodyOvPrev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewer.style.display = 'flex';
    /* 下一帧再加 on，保证过渡生效 */
    requestAnimationFrame(function () { viewer.classList.add('on'); });
    opened = true;
  }

  function closeViewer() {
    if (!viewer || !opened) return;
    opened = false;
    viewer.classList.remove('on');
    viewerImg.classList.remove('zoomed');
    viewerImg.style.transform = '';
    setTimeout(function () {
      if (!opened) viewer.style.display = 'none';
      document.body.style.overflow = bodyOvPrev || '';
      viewerImg.src = '';
    }, 180);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.tagName || t.tagName !== 'IMG') return;
    if (!t.classList.contains('inline-img') && !t.classList.contains('msg-photo')) return;
    if (e.target.closest('#ndp-viewer')) return;
    /* 图片可能在聊天气泡里，先挡住气泡自己的点击，别连带弹出菜单 */
    e.preventDefault();
    e.stopPropagation();
    openViewer(t.currentSrc || t.src);
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && opened) { e.preventDefault(); closeViewer(); }
  });

  /* ================= 2. 回到顶部悬浮球 ================= */
  var topBtn = null, topShown = false;
  function ensureTopBtn() {
    if (topBtn) return topBtn;
    topBtn = document.createElement('button');
    topBtn.id = 'ndp-top';
    topBtn.type = 'button';
    topBtn.setAttribute('aria-label', '回到顶部');
    topBtn.innerHTML = '↑';
    topBtn.addEventListener('click', function () {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
    });
    document.body.appendChild(topBtn);
    return topBtn;
  }
  function syncTopBtn() {
    if (!isMobile()) {
      if (topBtn) topBtn.classList.remove('on');
      topShown = false;
      return;
    }
    var y = window.scrollY || window.pageYOffset || 0;
    var should = y > 520;
    if (should === topShown) return;
    topShown = should;
    var btn = ensureTopBtn();
    btn.classList.toggle('on', should);
    /* 底部有聊天/回复输入栏时抬高，别压在发送按钮上 */
    btn.classList.toggle('lift', !!document.querySelector('.wx-input-wrap, .chat-input-row'));
  }
  var topTick = false;
  window.addEventListener('scroll', function () {
    if (topTick) return;
    topTick = true;
    setTimeout(function () { topTick = false; syncTopBtn(); }, 120);
  }, { passive: true });
  window.addEventListener('resize', syncTopBtn);

  /* ================= 3. 高弹窗自动全屏 ================= */
  function fitModals() {
    if (!isMobile()) return;
    var list = document.querySelectorAll('.modal:not(.ndp-full)');
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      /* 内容比 78% 视口还高，就说明底部卡片装不下，改成近全屏 */
      if (m.scrollHeight > window.innerHeight * 0.78) m.classList.add('ndp-full');
    }
  }
  try {
    var mo = new MutationObserver(function () {
      if (mo._t) return;
      mo._t = setTimeout(function () { mo._t = 0; fitModals(); }, 80);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  /* ================= 4. Esc 关闭最上层弹窗 ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (opened) return; /* 图片查看器自己会处理 */
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    var masks = document.querySelectorAll('.modal-mask');
    if (!masks.length) return;
    var last = masks[masks.length - 1];
    e.preventDefault();
    if (typeof last._close === 'function') last._close(null);
    else last.click();
  });

  /* ================= 初始化 ================= */
  function boot() {
    syncTopBtn();
    fitModals();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
