/* 哪都通 · 论坛小工具（v47）
   1) 帖子收藏 / 稍后再看     2) 发帖·回帖草稿自动保存
   3) 楼层直达 + 楼号小标     4) 帖子消息中心同类合并
   做法：独立文件 + MutationObserver 增量注入，完全不修改 app.js 与 main.css。 */
(function () {
  'use strict';

  var FAV_KEY = 'ndt_favs_v1';
  var DRAFT_PREFIX = 'ndt_draft_v1:';
  var MERGE_KEY = 'ndt_merge_kind_v1';
  var DRAFT_KEEP_MS = 7 * 24 * 3600 * 1000;

  /* ---------------- 存储包装（localStorage 不可用时静默降级） ---------------- */
  function storeGet(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return null; }
  }
  function storeSet(k, v) {
    try { window.localStorage.setItem(k, v); } catch (e) { }
  }
  function storeDel(k) {
    try { window.localStorage.removeItem(k); } catch (e) { }
  }
  function readJSON(k, fb) {
    var raw = storeGet(k);
    if (!raw) return fb;
    try { return JSON.parse(raw); } catch (e) { return fb; }
  }
  function writeJSON(k, v) {
    try { storeSet(k, JSON.stringify(v)); } catch (e) { }
  }

  /* ---------------- 轻提示 ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('ndf-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ndf-toast';
      el.className = 'ndf-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ---------------- 1. 收藏 ---------------- */
  function favList() {
    var arr = readJSON(FAV_KEY, []);
    return Array.isArray(arr) ? arr : [];
  }
  function favSave(arr) { writeJSON(FAV_KEY, arr); favCountRefresh(); }
  function favHas(id) {
    return favList().some(function (f) { return f.id === id; });
  }
  function favAdd(item) {
    var arr = favList();
    if (arr.some(function (f) { return f.id === item.id; })) return false;
    arr.unshift(item);
    favSave(arr);
    return true;
  }
  function favRemove(id) {
    var arr = favList().filter(function (f) { return f.id !== id; });
    favSave(arr);
  }

  /* 当前帖子上下文：从详情页操作行里的“分享”按钮取，站点自己就带了这三个属性 */
  function postCtx() {
    var share = document.querySelector('.q-meta [data-share]');
    if (!share) return null;
    var id = share.getAttribute('data-share');
    if (!id) return null;
    return {
      id: id,
      title: share.getAttribute('data-share-title') || '（无标题）',
      board: share.getAttribute('data-share-board') || '',
      author: share.getAttribute('data-share-author') || ''
    };
  }

  function syncFavBtn(btn) {
    if (!btn) return;
    var ctx = postCtx();
    var on = !!(ctx && favHas(ctx.id));
    btn.classList.toggle('on', on);
    btn.textContent = on ? '★ 已收藏' : '☆ 收藏';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? '点击取消收藏' : '收藏到「我的收藏」，稍后再看';
  }

  function injectFavBtn() {
    var share = document.querySelector('.q-meta [data-share]');
    if (!share) return;
    var row = share.parentNode;
    var btn = row.querySelector('[data-ndf-fav]');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-ghost ndf-fav';
      btn.setAttribute('data-ndf-fav', '1');
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var ctx = postCtx();
        if (!ctx) return;
        if (favHas(ctx.id)) {
          favRemove(ctx.id);
          toast('已取消收藏');
        } else {
          favAdd({ id: ctx.id, title: ctx.title, board: ctx.board, author: ctx.author, ts: Date.now() });
          toast('已加入我的收藏');
        }
        syncFavBtn(btn);
      });
      /* 插在“分享”前面，和原有按钮排在一起 */
      row.insertBefore(btn, share);
    }
    syncFavBtn(btn);
  }

  function favCountRefresh() {
    var n = favList().length;
    var badges = document.querySelectorAll('.ndf-fav-entry .ndf-fav-count');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = n > 99 ? '99+' : String(n);
      badges[i].style.display = n ? '' : 'none';
    }
  }

  function injectSideEntry(force) {
    var side = document.querySelector('.sidebar');
    if (!side) return;
    if (side.querySelector('[data-ndf-fav-entry]')) { favCountRefresh(); return; }
    var anchor = side.querySelector('.side-item[data-section="forum-notices"]');
    /* 锚点还没渲染出来：先别急着插，否则会插到第一个项后面再挪回原位，
       位置一跳就是"闪"。下一帧/下一次 DOM 变化会再试；实在等不到才兜底。 */
    if (!anchor) {
      if (!force) return;
      anchor = side.querySelector('.side-item');
    }
    var entry = document.createElement('div');
    entry.className = 'side-item ndf-fav-entry';
    entry.setAttribute('data-ndf-fav-entry', '1');
    entry.setAttribute('role', 'button');
    entry.setAttribute('tabindex', '0');
    entry.innerHTML = '<span class="ndf-ico">★</span><span class="side-item-label">我的收藏</span>' +
      '<span class="side-unread-badge ndf-fav-count"></span>';
    entry.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      openFavPanel();
    });
    entry.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openFavPanel(); }
    });
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(entry, anchor.nextSibling);
    else side.appendChild(entry);
    favCountRefresh();
  }

  var favMask = null;
  function closeFavPanel() {
    if (!favMask) return;
    var mask = favMask;
    favMask = null;
    mask.style.opacity = '0';
    document.body.style.overflow = mask.__prevOv || '';
    setTimeout(function () { if (mask.parentNode) mask.parentNode.removeChild(mask); }, 200);
  }

  function favRowHtml(f) {
    var meta = [];
    if (f.board) meta.push(f.board);
    if (f.author) meta.push(f.author);
    meta.push(f.ts ? relTimeText(f.ts) : '');
    return '<div class="ndf-fav-item" data-ndf-fav-id="' + escAttr(f.id) + '">' +
      '<div class="ndf-fav-main">' +
      '<a class="ndf-fav-title" href="#/post/' + encodeURIComponent(f.id) + '">' + escText(f.title) + '</a>' +
      '<span class="ndf-fav-meta">' + escText(meta.join(' · ')) + '</span>' +
      '</div>' +
      '<button type="button" class="ndf-fav-del" data-ndf-fav-del="1">移除</button>' +
      '</div>';
  }

  function relTimeText(ts) {
    var d = Date.now() - ts;
    if (d < 60 * 1000) return '刚刚';
    if (d < 3600 * 1000) return Math.floor(d / 60000) + ' 分钟前';
    if (d < 24 * 3600 * 1000) return Math.floor(d / 3600000) + ' 小时前';
    if (d < 30 * 24 * 3600 * 1000) return Math.floor(d / 86400000) + ' 天前';
    var dt = new Date(ts);
    return dt.getFullYear() + '/' + pad(dt.getMonth() + 1) + '/' + pad(dt.getDate());
  }

  function escText(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
    });
  }
  function escAttr(s) {
    return escText(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderFavList(box) {
    var arr = favList();
    if (!arr.length) {
      box.innerHTML = '<div class="ndf-fav-empty"><span class="big">☆</span>' +
        '还没有收藏的帖子。<br>在帖子右上角的操作行里点「☆ 收藏」，之后就能在这里找到它。</div>';
      return;
    }
    box.innerHTML = arr.map(favRowHtml).join('');
  }

  function openFavPanel() {
    if (favMask) return;
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = '<div class="modal ndf-panel">' +
      '<div class="ndf-panel-head"><strong>我的收藏</strong><span id="ndf-fav-sub"></span>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="ndf-fav-close" style="margin-left:auto">关闭</button></div>' +
      '<p class="ph-sub" style="margin:6px 0 0;font-size:13px;color:var(--pt-muted,#66719B)">只存在这台设备的浏览器里，清缓存会丢。</p>' +
      '<div class="ndf-fav-list" id="ndf-fav-list"></div>' +
      '</div>';
    var body = mask.querySelector('#ndf-fav-list');
    renderFavList(body);
    var arr = favList();
    mask.querySelector('#ndf-fav-sub').textContent = arr.length ? '共 ' + arr.length + ' 篇' : '';

    mask.addEventListener('click', function (ev) {
      if (ev.target === mask) { closeFavPanel(); return; }
      var del = ev.target.closest && ev.target.closest('[data-ndf-fav-del]');
      if (del) {
        var row = del.closest('.ndf-fav-item');
        var id = row && row.getAttribute('data-ndf-fav-id');
        if (id) {
          favRemove(id);
          renderFavList(body);
          var n = favList().length;
          mask.querySelector('#ndf-fav-sub').textContent = n ? '共 ' + n + ' 篇' : '';
          toast('已移除');
        }
        return;
      }
      if (ev.target.closest && ev.target.closest('#ndf-fav-close')) closeFavPanel();
    });
    mask.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a.ndf-fav-title');
      if (a) closeFavPanel();
    });

    mask.__prevOv = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mask.style.opacity = '0';
    mask.style.transition = 'opacity .18s ease';
    mask._close = closeFavPanel; /* 让 pro-polish 的 Esc 关弹窗也能关掉它 */
    document.body.appendChild(mask);
    favMask = mask;
    requestAnimationFrame(function () { mask.style.opacity = '1'; });
  }

  /* ---------------- 2. 草稿自动保存 ---------------- */
  /* 字段 → 存储键：发帖页固定 ask:xxx；回答框按帖子区分；楼中楼按回复 id 区分 */
  function draftKeyFor(el) {
    if (!el || !el.id && !el.className) return '';
    var id = el.id;
    if (id === 'a-title') return DRAFT_PREFIX + 'ask:title';
    if (id === 'a-body') return DRAFT_PREFIX + 'ask:body';
    if (id === 'ans-body') {
      var pid = postIdFromHash();
      return pid ? DRAFT_PREFIX + 'post:' + pid + ':answer' : '';
    }
    if (el.classList && el.classList.contains('ir-body')) {
      var box = el.closest('.inline-reply');
      var bid = box && box.id ? box.id.replace(/^ir-/, '') : '';
      return bid ? DRAFT_PREFIX + 'reply:' + bid : '';
    }
    return '';
  }

  function postIdFromHash() {
    var h = location.hash || '';
    var m = h.match(/^#\/post\/([^?&/]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function saveDraft(el) {
    var key = draftKeyFor(el);
    if (!key) return;
    var val = el.value || '';
    if (!val.trim()) {
      storeDel(key);
      var hintOld = el.parentNode && el.parentNode.querySelector('.ndf-draft-hint');
      if (hintOld) hintOld.parentNode.removeChild(hintOld);
      return;
    }
    writeJSON(key, { v: val, ts: Date.now() });
    showDraftHint(el, true);
  }

  var draftTimers = new WeakMap();
  function onDraftInput(el) {
    var key = draftKeyFor(el);
    if (!key) return;
    var hint = showDraftHint(el, false);
    if (hint) hint.classList.add('is-saving');
    clearTimeout(draftTimers.get(el));
    draftTimers.set(el, setTimeout(function () { saveDraft(el); }, 700));
  }

  function showDraftHint(el, saved) {
    var host = el.parentNode;
    if (!host) return null;
    var hint = host.querySelector('.ndf-draft-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'ndf-draft-hint';
      hint.innerHTML = '<span class="dot"></span><span class="txt"></span>' +
        '<button type="button" class="ndf-draft-clear" data-ndf-draft-clear="1">清空草稿</button>';
      hint.querySelector('[data-ndf-draft-clear]').addEventListener('click', function (ev) {
        ev.preventDefault();
        var key = draftKeyFor(el);
        if (key) storeDel(key);
        el.value = '';
        var h = hint.parentNode && hint.parentNode.querySelector('.ndf-draft-hint');
        if (h) h.parentNode.removeChild(h);
        toast('草稿已清空');
      });
      /* 插在字段后面 */
      if (el.nextSibling) host.insertBefore(hint, el.nextSibling);
      else host.appendChild(hint);
    }
    hint.classList.remove('is-saving');
    var txt = hint.querySelector('.txt');
    txt.textContent = saved ? ('草稿已自动保存 · ' + stamp()) : '正在保存草稿…';
    return hint;
  }

  function restoreDrafts() {
    var fields = document.querySelectorAll('#a-title, #a-body, #ans-body, .ir-body');
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (el.value && el.value.trim()) continue;
      if (el.parentNode && el.parentNode.querySelector('.ndf-draft-hint')) continue;
      var key = draftKeyFor(el);
      if (!key) continue;
      var rec = readJSON(key, null);
      if (!rec || typeof rec.v !== 'string' || !rec.v.trim()) continue;
      if (rec.ts && Date.now() - rec.ts > DRAFT_KEEP_MS) { storeDel(key); continue; }
      el.value = rec.v;
      var hint = showDraftHint(el, false);
      if (hint) {
        hint.classList.remove('is-saving');
        var txt = hint.querySelector('.txt');
        txt.textContent = '已恢复上次未提交的草稿 · ' + (rec.ts ? new Date(rec.ts).toLocaleString('zh-CN') : '');
      }
    }
  }

  function clearDraftsFor(scope) {
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(DRAFT_PREFIX + scope) === 0) keys.push(k);
      }
    } catch (e) { return; }
    keys.forEach(storeDel);
    /* 顺手把提示条收掉 */
    var hints = document.querySelectorAll('.ndf-draft-hint');
    for (var j = 0; j < hints.length; j++) {
      var h = hints[j];
      if (h.parentNode) h.parentNode.removeChild(h);
    }
  }

  /* ---------------- 3. 楼层直达 ---------------- */
  function answersOfPanel() {
    var panels = document.querySelectorAll('.p-panel');
    for (var i = 0; i < panels.length; i++) {
      var list = panels[i].querySelectorAll('.answer');
      if (list.length) return panels[i];
    }
    return null;
  }

  function markFloors(panel) {
    if (!panel || panel.getAttribute('data-ndf-floors') === '1') return;
    var answers = panel.querySelectorAll('.answer');
    for (var i = 0; i < answers.length; i++) {
      var meta = answers[i].querySelector('.q-meta');
      if (!meta || meta.querySelector('.ndf-floor')) continue;
      var chip = document.createElement('span');
      chip.className = 'ndf-floor';
      chip.textContent = (i + 1) + ' 楼';
      meta.appendChild(chip);
    }
    panel.setAttribute('data-ndf-floors', '1');
  }

  function injectFloorNav() {
    var panel = answersOfPanel();
    if (!panel || panel.querySelector('[data-ndf-jump]')) return;
    markFloors(panel);
    var total = panel.querySelectorAll('.answer').length;
    var h2 = panel.querySelector('h2');
    var wrap = document.createElement('div');
    wrap.className = 'ndf-jump';
    wrap.setAttribute('data-ndf-jump', '1');
    wrap.innerHTML = '<span>楼层直达</span>' +
      '<input type="number" min="1" max="' + total + '" inputmode="numeric" placeholder="楼层" aria-label="输入楼层号">' +
      '<button type="button" data-ndf-go="1">跳转</button>' +
      '<span class="ndf-jump-total">共 ' + total + ' 层</span>';
    var input = wrap.querySelector('input');
    function go() {
      var n = parseInt(input.value, 10);
      if (!n || n < 1 || n > total) { toast('请输入 1 到 ' + total + ' 之间的楼层号'); return; }
      var target = panel.querySelectorAll('.answer')[n - 1];
      if (!target) return;
      target.classList.remove('ndf-hl');
      void target.offsetWidth; /* 强制回流，让动画能重放 */
      target.classList.add('ndf-hl');
      try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      catch (e) { target.scrollIntoView(); }
      /* 老浏览器或关掉了平滑滚动时，smooth 可能压根没动，兜个底 */
      setTimeout(function () {
        var r = target.getBoundingClientRect();
        if (r.top < 48 || r.bottom > (window.innerHeight || 0) - 32) {
          try { target.scrollIntoView({ block: 'center' }); } catch (e2) { target.scrollIntoView(); }
        }
      }, 420);
      setTimeout(function () { target.classList.remove('ndf-hl'); }, 2600);
    }
    wrap.querySelector('[data-ndf-go]').addEventListener('click', go);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); go(); }
    });
    if (h2 && h2.parentNode) h2.parentNode.insertBefore(wrap, h2.nextSibling);
    else if (panel.firstChild) panel.insertBefore(wrap, panel.firstChild);
    else panel.appendChild(wrap);
    /* 楼号是老帖子重绘后才有的，这里再补一次 */
    markFloors(panel);
  }

  /* ---------------- 4. 消息中心同类合并 ---------------- */
  function mergePref() {
    var v = storeGet(MERGE_KEY);
    return v === null ? true : v === '1';
  }

  function actorOf(item) {
    var strong = item.querySelector('.fnc-title-row strong');
    if (!strong) return '';
    var t = (strong.textContent || '').trim();
    t = t.replace(/\s*赞了.*$/, '').replace(/\s*等\s*\d+\s*人$/, '');
    return t;
  }

  function ensureMergeSwitch(actions) {
    if (!actions || actions.querySelector('[data-ndf-merge-switch]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-ghost fnc-merge-switch';
    btn.setAttribute('data-ndf-merge-switch', '1');
    btn.innerHTML = '<i></i>合并同类';
    btn.classList.toggle('on', mergePref());
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      storeSet(MERGE_KEY, mergePref() ? '0' : '1');
      btn.classList.toggle('on', mergePref());
      var list = document.querySelector('.fnc-list');
      if (list) list.removeAttribute('data-ndf-merging');
      applyMerge();
    });
    actions.insertBefore(btn, actions.firstChild);
  }

  function unmerge(list) {
    var hidden = list.querySelectorAll('[data-ndf-hidden-by-merge]');
    for (var i = 0; i < hidden.length; i++) {
      hidden[i].style.display = '';
      hidden[i].removeAttribute('data-ndf-hidden-by-merge');
    }
    var heads = list.querySelectorAll('.fnc-title-row strong[data-ndf-orig]');
    for (var j = 0; j < heads.length; j++) {
      heads[j].innerHTML = heads[j].getAttribute('data-ndf-orig');
      heads[j].removeAttribute('data-ndf-orig');
      var badge = heads[j].parentNode && heads[j].parentNode.querySelector('.fnc-merged');
      if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
    }
    var extra = list.querySelectorAll('[data-ndf-read-all]');
    for (var k = 0; k < extra.length; k++) {
      if (extra[k].parentNode) extra[k].parentNode.removeChild(extra[k]);
    }
    list.setAttribute('data-ndf-merging', '0');
  }

  function applyMerge() {
    var list = document.querySelector('.fnc-list');
    if (!list) return;
    var items = list.querySelectorAll('[data-cn-item]');
    if (!items.length) {
      /* 本地版消息中心（离线数据）：条目已自带合并计数，不再处理 */
      return;
    }
    if (!mergePref()) { unmerge(list); return; }
    if (list.getAttribute('data-ndf-merging') === '1') return;
    unmerge(list); /* 先还原，保证重复执行不叠加 */

    var groups = [];
    var index = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var icon = it.querySelector('.fnc-icon');
      var isLike = icon && icon.classList.contains('is-growth');
      if (!isLike) continue; /* 只合并“点赞”，回复内容各不相同，合并不合适 */
      var post = it.querySelector('.fnc-post-title');
      var open = it.querySelector('[data-cn-open]');
      /* 同一篇帖子的点赞才合并；拿不到帖子链接时退回标题文本 */
      var key = (open && open.getAttribute('href')) || (post ? post.textContent.trim() : '');
      if (!key) continue;
      if (!index[key]) { index[key] = []; groups.push(index[key]); }
      index[key].push(it);
    }

    groups.forEach(function (g) {
      if (g.length < 2) return;
      var first = g[0];
      var strong = first.querySelector('.fnc-title-row strong');
      if (!strong) return;
      var names = [];
      g.forEach(function (it) {
        var n = actorOf(it);
        if (n && names.indexOf(n) < 0) names.push(n);
      });
      var head = names.length ? (names.slice(0, 2).join('、') + (names.length > 2 ? ' 等 ' + names.length + ' 人' : '')) : ('共 ' + g.length + ' 人');
      strong.setAttribute('data-ndf-orig', strong.innerHTML);
      strong.innerHTML = '<span class="fnc-actor-names">' + escText(head) + '</span>赞了你的帖子';
      var badge = document.createElement('span');
      badge.className = 'fnc-merged';
      badge.textContent = '已合并 ' + g.length + ' 条';
      if (strong.parentNode) strong.parentNode.insertBefore(badge, strong.nextSibling);

      /* 组内其余条目先藏起来，但它们身上“标为已读”的按钮还要留着用 */
      var hasUnread = false;
      for (var k = 1; k < g.length; k++) {
        g[k].style.display = 'none';
        g[k].setAttribute('data-ndf-hidden-by-merge', '1');
        if (g[k].classList.contains('is-unread')) hasUnread = true;
      }
      if (first.classList.contains('is-unread')) hasUnread = true;
      if (!hasUnread) return;
      var actions = first.querySelector('.fnc-item-actions');
      if (!actions) return;
      var all = document.createElement('button');
      all.type = 'button';
      all.className = 'btn btn-sm btn-ghost';
      all.setAttribute('data-ndf-read-all', '1');
      all.textContent = '全部标为已读';
      all.addEventListener('click', function (ev) {
        ev.preventDefault();
        g.forEach(function (it) {
          var btn = it.querySelector('[data-cn-read]');
          if (btn) btn.click();
        });
        toast('这 ' + g.length + ' 条已标为已读');
      });
      actions.appendChild(all);
    });
    list.setAttribute('data-ndf-merging', '1');
  }

  /* ---------------- 汇总执行 ---------------- */
  var busy = false;
  function run() {
    if (busy) return;
    busy = true;
    try {
      injectSideEntry(true);
      injectFavBtn();
      injectFloorNav();
      restoreDrafts();
      var actions = document.querySelector('.fnc-actions');
      /* 只有云端消息中心（每条点赞一个条目）需要合并；离线版本来就带计数 */
      if (actions && document.querySelector('[data-cn-item]')) {
        ensureMergeSwitch(actions);
        applyMerge();
      }
    } catch (e) {
      /* 任一功能出错都不影响页面其它部分 */
      if (window.console && console.warn) console.warn('[pro-tools]', e);
    }
    busy = false;
  }

  /* ---------------- 事件绑定 ---------------- */
  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (!t || !t.tagName) return;
    if (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.id === 'a-title')) {
      if (t.id || (t.classList && t.classList.contains('ir-body'))) onDraftInput(t);
    }
  }, true);

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    /* 发布 / 提交回答 / 发送楼中楼 之后把对应草稿清掉 */
    if (t.closest('#a-sub')) { clearDraftsFor('ask:'); return; }
    if (t.closest('#ans-sub')) {
      var pid = postIdFromHash();
      if (pid) clearDraftsFor('post:' + pid + ':answer');
      return;
    }
    var send = t.closest('.ir-send');
    if (send) {
      var box = send.closest('.inline-reply');
      var bid = box && box.id ? box.id.replace(/^ir-/, '') : '';
      if (bid) clearDraftsFor('reply:' + bid);
    }
  }, true);

  window.addEventListener('hashchange', function () {
    /* 切板块时侧栏正在重建：先当场补入口，再延后干别的 */
    repinSide();
    schedule(90);
  });

  /* DOM 变化后重建注入（app.js 每次路由都会重写 #app） */
  var timer = null;
  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(run, ms || 90);
  }
  /* 侧栏在切换板块时会被整体重建，注入的"我的收藏"跟着消失。
     MutationObserver 的回调在浏览器绘制之前跑，所以这里是"当场"补回去，
     用户不会看到它先消失再出现。 */
  function repinSide() {
    try {
      if (!document.querySelector('.ndf-fav-entry')) injectSideEntry();
      /* 再等一帧确认：万一 app.js 在同一个任务里又把侧栏重写了一遍，
         这里能在绘制之前补回来，避免"消失一下再出现" */
      requestAnimationFrame(function () {
        try {
          if (!document.querySelector('.ndf-fav-entry')) injectSideEntry(true);
        } catch (e) {}
      });
    } catch (e) {}
  }
  function boot() {
    run();
    var app = document.getElementById('app');
    if (app && window.MutationObserver) {
      new MutationObserver(function () {
        repinSide();
        if (busy) return;
        schedule(90);
      }).observe(app, { childList: true, subtree: true });
    }
    setTimeout(run, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
