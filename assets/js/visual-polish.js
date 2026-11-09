/* 哪都通 · 异人论坛 —— 空状态插画层
 * 独立文件，不改 app.js。
 * 站点里 class="empty" 有 45 处，其中 42 处只有一行字、连图标都没有，
 * 另外 3 处用的是 emoji（🕳️ ⚠️ ⛔），在 Windows 上会渲染成黑白硬边、
 * 跟站内其他线稿图标完全不是一个语言。这里统一换成线稿 SVG：
 *   - 有 .es 且是 emoji 的，直接换成同义线稿
 *   - 没有 .es 的，补一枚进去
 * 用 data-vp 标记防重入；点赞、发帖后的静默重渲染会重建 .empty，
 * 标记跟着元素消失，MutationObserver 会再补一次，不会闪烁。
 */
(function () {
  'use strict';

  var P = {
    inbox: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/>',
    msg: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 17v4l5-4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17.5" cy="9.5" r="2.3"/><path d="M16.5 15.2c3 .3 5 1.8 5 4.8"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    star: '<path d="M12 4l2.4 5 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8z"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 9v4.5"/><circle cx="12" cy="16.6" r=".9"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v5l3.4 2"/>',
    book: '<path d="M4 5h7v15H4z"/><path d="M13 5h7v15h-7z"/><path d="M11 8v12"/>'
  };

  /* 按文案选图标。顺序即优先级：出错和权限这两种含义最明确，排最前，
   * 免得"该档案为机密级别"被后面的"档案"规则抢走。
   */
  var RULES = [
    [/失败|错误|出错|加载|无法|异常|⚠/, 'alert'],
    [/权限|级别|锁定|调阅|不公开|⛔/, 'lock'],
    [/消息|聊天|回复|私信|发言|对话|讯息/, 'msg'],
    [/成员|好友|员工|管理|异人|用户|人物/, 'users'],
    [/徽章|成就|称号|收藏|精华/, 'star'],
    [/搜索|关键词|匹配|查找|未找到/, 'search'],
    [/档案|典藏|资料|记录|条目|节点|关系|帖|字卡/, 'doc'],
    [/时间|轨迹|事件|历史|节点/, 'clock'],
    [/卷宗|书|课程/, 'book']
  ];

  function pick(text) {
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(text)) return RULES[i][1];
    }
    return 'inbox';
  }

  function svg(kind) {
    return '<svg class="vp-ic" viewBox="0 0 24 24" width="28" height="28" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + (P[kind] || P.inbox) + '</svg>';
  }

  function fix(el) {
    if (el.dataset.vp) return;
    el.dataset.vp = '1';
    var es = el.querySelector('.es');
    var text = (el.textContent || '').replace(/\s+/g, '');
    var kind = pick(text);

    if (es) {
      /* 已经是图标（部分页面本来就用了 ic() 生成 svg），只补类名 */
      if (es.querySelector('svg')) {
        es.classList.add('is-ic');
        return;
      }
      es.className = 'es is-ic';
      es.innerHTML = svg(kind);
      return;
    }

    var d = document.createElement('div');
    d.className = 'es is-ic';
    d.innerHTML = svg(kind);
    el.insertBefore(d, el.firstChild);
  }

  function sweep(root) {
    var list = (root || document).querySelectorAll('.empty');
    for (var i = 0; i < list.length; i++) fix(list[i]);
  }

  /* 防抖：重渲染一次可能连带几十个变更，攒到 100ms 后统一扫一遍 */
  var timer = 0;
  var mo = new MutationObserver(function () {
    if (timer) return;
    timer = setTimeout(function () {
      timer = 0;
      sweep(document);
    }, 100);
  });

  function boot() {
    sweep(document);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
