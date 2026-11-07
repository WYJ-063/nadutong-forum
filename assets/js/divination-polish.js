/* ============================================================
   占卜模块视觉增强（脚本部分）
   只做三件事，全部是"看到页面再补 DOM"，不改 app.js 的渲染函数：
   1) 六爻爻位盘：给 #yj-throws 前面插一个六格爻位盘，接管原有文字标签
   2) 塔罗牌背：往 .tc-inner 里补一层 .tc-back，配合 CSS 做翻牌
   3) 黄大仙签筒：结果出现时盖一层签筒摇签动画，约 1.3 秒后揭晓
   ============================================================ */
(function () {
  if (window.__divinationPolishLoaded) return;
  window.__divinationPolishLoaded = true;

  var MOVING = { 6: true, 9: true };
  var VAL_TEXT = { 6: '老阴·动', 7: '少阳', 8: '少阴', 9: '老阳·动' };
  var POS_NAME = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

  /* 是否阳爻：7 少阳、9 老阳 为阳 */
  function isYang(v) { return v === 7 || v === 9; }

  /* ---------- 1. 六爻爻位盘 ---------- */

  function buildYjSlots() {
    var box = document.getElementById('yj-throws');
    if (!box) return;

    var chips = box.querySelectorAll('.yj-throw');
    var vals = [];
    for (var i = 0; i < chips.length; i++) {
      var m = (chips[i].textContent || '').match(/[：:]\s*(\d)/);
      if (m) vals.push(parseInt(m[1], 10));
    }

    var host = box.parentNode.querySelector('.dj-slots');
    if (!host) {
      host = document.createElement('div');
      host.className = 'dj-slots';
      host.setAttribute('aria-label', '六爻爻位');
      box.parentNode.insertBefore(host, box);
    }

    /* 内容签名一致就不再重建，避免观察器反复触发导致动画一直重放 */
    var sig = vals.join(',');
    if (host.dataset.sig === sig) return;
    host.dataset.sig = sig;

    var html = '';
    for (var k = 0; k < 6; k++) {
      var v = vals[k];
      var filled = typeof v === 'number';
      var cls = 'dj-slot';
      if (filled) {
        cls += ' on';
        if (MOVING[v]) cls += ' moving';
        /* 最新投出的那一爻翻面登场 */
        if (k === vals.length - 1) cls += ' dj-new';
      }
      var yang = filled ? isYang(v) : true;
      var bars = filled ? (yang ? '<i></i>' : '<i></i><i></i>') : '<i class="dj-bar-empty"></i>';
      var glyphCls = (filled && !yang) ? 'dj-glyph dj-yin' : 'dj-glyph';
      html += '<div class="' + cls + '">' +
        '<span class="dj-idx">' + POS_NAME[k] + '</span>' +
        '<span class="' + glyphCls + '">' + bars + '</span>' +
        '<span class="dj-val">' + (filled ? VAL_TEXT[v] : '待投') + '</span>' +
        '</div>';
    }
    host.innerHTML = html;

    /* 解析成功才把原来的文字标签藏起来 */
    if (vals.length || chips.length === 0) box.classList.add('dj-src-off');
  }

  /* ---------- 2. 塔罗牌背与翻牌 ---------- */

  function buildTarot() {
    var board = document.querySelector('.tarot-board');
    if (!board) return;

    var cards = board.querySelectorAll('.tarot-card');
    if (!cards.length) return;

    for (var i = 0; i < cards.length; i++) {
      var inner = cards[i].querySelector('.tc-inner');
      if (inner && !inner.querySelector('.tc-back')) {
        var back = document.createElement('div');
        back.className = 'tc-back';
        back.setAttribute('aria-hidden', 'true');
        inner.appendChild(back);
      }
    }

    /* 只有"换了牌"才播翻牌；同一副牌重新进页面就直接显示牌面 */
    var parts = [];
    for (var j = 0; j < cards.length; j++) {
      var h4 = cards[j].querySelector('.tc-face h4');
      parts.push((h4 ? h4.textContent : '') + (cards[j].classList.contains('rev') ? '|r' : '|u'));
    }
    var sig = parts.join(',');

    try {
      if (sig && sig !== sessionStorage.getItem('dj-tarot-sig')) {
        sessionStorage.setItem('dj-tarot-sig', sig);
        board.classList.add('dj-flip');
      }
    } catch (e) {
      board.classList.add('dj-flip');
    }
  }

  /* ---------- 3. 黄大仙签筒 ---------- */

  function huangRitual() {
    var res = document.querySelector('.huang-result');
    if (!res || res.dataset.djDone === '1') return;

    var numEl = res.querySelector('.huang-num');
    var poemEl = res.querySelector('.huang-poem');
    var sig = (numEl ? numEl.textContent : '') + '|' + (poemEl ? (poemEl.textContent || '').slice(0, 12) : '');

    res.dataset.djDone = '1';

    var seen = '';
    try { seen = sessionStorage.getItem('dj-huang-sig') || ''; } catch (e) {}

    /* 同一支签（比如重进页面）不再摇第二次 */
    if (sig === seen) return;
    try { sessionStorage.setItem('dj-huang-sig', sig); } catch (e) {}

    var veil = document.createElement('div');
    veil.className = 'dj-veil';
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML =
      '<div class="dj-tube">' +
        '<span class="dj-sticks"><i></i><i></i><i></i><i></i><i></i></span>' +
        '<span class="dj-body"></span>' +
        '<b class="dj-one"></b>' +
      '</div>';
    res.appendChild(veil);

    setTimeout(function () {
      if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    }, 1350);
  }

  /* ---------- 统一调度：页面一变就补一次 ---------- */

  var scheduled = false;

  function run() {
    scheduled = false;
    try { buildYjSlots(); } catch (e) {}
    try { buildTarot(); } catch (e) {}
    try { huangRitual(); } catch (e) {}
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    if (window.requestAnimationFrame) {
      requestAnimationFrame(run);
    } else {
      setTimeout(run, 16);
    }
  }

  function boot() {
    var app = document.getElementById('app') || document.body;
    if (!app) return;
    new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
