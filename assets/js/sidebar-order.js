/* ============================================================
   侧边栏重排 · 六组分类
   ------------------------------------------------------------
   只做一件事：把门户侧栏里现有的 .side-item 按下面的分组顺序
   重新排一遍，顺带把三组标题换成六组。

   为什么用「移动原节点」而不是重建：
   .side-item 上挂着 data-hash（跳转靠它）、on 高亮、未读红点、
   锁标、SVG 图标，点击事件也在 app.js 那边绑在容器上。重建就得
   把这些重新造一遍，极易漏。移动节点则原样保留，功能零风险。

   为什么要幂等：
   pro-tools.js 会往侧栏里插「我的收藏」，portalShell 每次切板块
   又会把整个 .sidebar 重建。两边都有 MutationObserver，如果每次都
   无脑重排，就会互相触发转圈。所以 apply() 先比对「当前序列」和
   「目标序列」，一致就直接返回。

   删掉 index.html 里对应引用即完全回退。
   ============================================================ */
(function () {
  "use strict";

  /* 组名 + 组内项。项用 .side-item-label 的文字精确匹配，
     因为部分项的 data-section 是空的（锁定态 data-hash 也是空的），
     只有 label 是稳定且唯一的。 */
  var GROUPS = [
    { name: "论坛大厅", items: ["论坛首页", "发帖提问", "云端账号", "帖子消息", "我的收藏", "论坛聊天室"] },
    { name: "情报档案", items: ["在逃异人", "异闻典藏"] },
    { name: "业务系统", items: ["异人档案", "事件档案", "资料库", "势力关系网", "重点异人关系网", "专属名片", "工作组", "OA 办公", "管理员工作台"] },
    { name: "签卜命理", items: ["抽签问吉", "四柱八字", "塔罗占卜", "伏羲六十四卦", "黄大仙灵签"] },
    { name: "个人中心", items: ["我的好友", "私信", "个人空间", "个人能力详情", "空间装修"] },
    { name: "拓展功能", items: ["方块小游戏", "数据中心"] }
  ];

  var EXTRA_NAME = "其他";

  /* 跨节点记住用户最后的滚动位置。
     portalShell 切板块是新建一个 .sidebar 节点，在新节点上读 scrollTop
     永远是 0，所以恢复时不能就地读，只能记住「上一次的真实位置」。 */
  var lastTop = 0;
  var lastLeft = 0;

  function noteScroll(sd) {
    if (!sd) return;
    lastTop = sd.scrollTop;
    lastLeft = sd.scrollLeft;
  }

  function sideEl() {
    return document.querySelector(".nav-wrap .sidebar") || document.querySelector(".sidebar");
  }

  function labelOf(el) {
    var l = el.querySelector(".side-item-label");
    return l ? String(l.textContent || "").trim() : "";
  }

  /* 当前侧栏的「组标题 + 项」序列，用来判断要不要动 */
  function currentSig(sd) {
    var out = [];
    [].forEach.call(sd.children, function (el) {
      if (el.classList && el.classList.contains("sd-group")) {
        out.push("G:" + String(el.textContent || "").trim());
      } else if (el.classList && el.classList.contains("side-item")) {
        var k = labelOf(el);
        if (k) out.push("I:" + k);
      }
    });
    return out;
  }

  function apply() {
    var sd = sideEl();
    if (!sd) return;

    var items = [].slice.call(sd.querySelectorAll(".side-item"));
    if (!items.length) return;

    var map = {};
    items.forEach(function (el) {
      var k = labelOf(el);
      if (k && !map[k]) map[k] = el;
    });

    /* 配置里没列到的项（将来新加的菜单）不丢，兜底放最后一组 */
    var listed = {};
    GROUPS.forEach(function (g) {
      g.items.forEach(function (n) { listed[n] = 1; });
    });
    var extras = items.filter(function (el) {
      var k = labelOf(el);
      return k && !listed[k];
    });

    var want = [];
    GROUPS.forEach(function (g) {
      var members = g.items.map(function (n) { return map[n]; }).filter(Boolean);
      if (!members.length) return;           /* 整组没有可显示的项就不出标题 */
      want.push("G:" + g.name);
      members.forEach(function (el) { want.push("I:" + labelOf(el)); });
    });
    /* 兜底组也必须带上标题一起比对：重建时会 append「其他」标题，
       但 want 早先只收了项、没收标题，导致 currentSig 永远对不上，
       每次刷新都判定「需要重排」→ 无脑重建侧栏。侧栏一有白名单外的项
       （四柱八字、我的收藏之类）就变成死循环，手机上表现为抖动、划不动。 */
    if (extras.length) {
      want.push("G:" + EXTRA_NAME);
      extras.forEach(function (el) { want.push("I:" + labelOf(el)); });
    }

    /* 保存滚动位置再动 DOM。
        portalShell 每次切板块都会新建一个 .sidebar 节点，新节点的
       scrollTop / scrollLeft 都是 0 —— 不接住的话，PC 上侧栏会先跳回顶部、
       手机上横滑条会先跳回最左，看起来就是「闪出以前的位置再闪回去」。 */
    var horizontal = sd.scrollWidth > sd.clientWidth + 2;
    var oldTop = lastTop;
    var oldLeft = lastLeft;

    if (currentSig(sd).join("\u0001") === want.join("\u0001")) {
      keepScroll(sd, horizontal, oldTop, oldLeft);
      noteScroll(sd);
      return;                                                            /* 已经对了 */
    }

    while (sd.firstChild) sd.removeChild(sd.firstChild);

    GROUPS.forEach(function (g) {
      var members = g.items.map(function (n) { return map[n]; }).filter(Boolean);
      if (!members.length) return;
      var h = document.createElement("div");
      h.className = "sd-group";
      h.textContent = g.name;
      sd.appendChild(h);
      members.forEach(function (el) { sd.appendChild(el); });
    });

    if (extras.length) {
      var eh = document.createElement("div");
      eh.className = "sd-group";
      eh.textContent = EXTRA_NAME;
      sd.appendChild(eh);
      extras.forEach(function (el) { sd.appendChild(el); });
    }

    keepScroll(sd, horizontal, oldTop, oldLeft);
    noteScroll(sd);
  }

  /* 排完之后把视口放回该在的地方：
     竖向（PC）保持用户刚才滚到的位置；横向（手机）把当前高亮项滚到中间。
     这些都紧跟 DOM 改动，同一帧内完成，不会看到中间态。 */
  function keepScroll(sd, horizontal, oldTop, oldLeft) {
    if (horizontal) {
      var on = sd.querySelector(".side-item.on");
      if (on) {
        sd.scrollLeft = Math.max(0, on.offsetLeft - (sd.clientWidth - on.offsetWidth) / 2);
      } else {
        sd.scrollLeft = oldLeft;
      }
      /* 通知 app.js 那条 scroll 监听重算「右边还有更多」的渐隐提示 */
      try { sd.dispatchEvent(new Event("scroll", { bubbles: true })); } catch (e) {}
    } else {
      sd.scrollTop = oldTop;
    }
  }

  var queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    /* setTimeout 而非 rAF：页面在后台/宿主 iframe 不可见时 rAF 不跑，
       这条兜底就永远不触发。主路径仍是 MutationObserver 里同步 apply()。 */
    setTimeout(function () {
      queued = false;
      apply();
    }, 0);
  }

  var innerObserver = null;
  function watch(sd) {
    if (innerObserver) innerObserver.disconnect();
    if (!sd) return;
    innerObserver = new MutationObserver(refresh);
    innerObserver.observe(sd, { childList: true });

    /* 侧栏自己的滚动也要记下来，否则用户滚到中段再切板块，
       新节点会从 0 开始、看起来像跳回顶部 */
    if (!sd.__soScroll) {
      sd.__soScroll = 1;
      sd.addEventListener("scroll", function () { noteScroll(sd); }, { passive: true });
    }
  }

  var lastSide = null;

  /* portalShell 重建后 .sidebar 是一个全新节点，里的内容是 app.js 原本的三组
     顺序。这里必须「同步」重排：MutationObserver 的回调在浏览器绘制之前执行，
     所以重排和渲染落在同一帧，用户看不到旧的排列闪一下。
     早先这里是 setTimeout 120ms 节流 —— 中间那七帧左右恰恰就是真机上看到的
     「先闪出原来位置、再跳回来」。 */
  var mo = new MutationObserver(function () {
    var sd = sideEl();
    if (!sd) return;
    if (sd === lastSide) return;      /* 侧栏没换节点，内部变动交给内层观察者 */

    lastSide = sd;
    apply();
    watch(sd);

    /* 后备：万一 app.js 是分几笔把侧栏拼进 DOM 的，第一笔之后节点还不完整，
       下一帧（仍在绘制前）再对一次，幂等短路不会重排第二次。 */
    refresh();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("hashchange", function () { refresh(); });

  function boot() {
    var sd = sideEl();
    if (sd) {
      lastSide = sd;
      apply();
      watch(sd);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
