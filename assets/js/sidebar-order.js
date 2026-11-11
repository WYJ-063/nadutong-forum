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
    { name: "签卜命理", items: ["抽签问吉", "塔罗占卜", "伏羲六十四卦", "黄大仙灵签"] },
    { name: "个人中心", items: ["我的好友", "私信", "个人空间", "个人能力详情", "空间装修"] },
    { name: "拓展功能", items: ["方块小游戏", "数据中心"] }
  ];

  var EXTRA_NAME = "其他";

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
    extras.forEach(function (el) { want.push("I:" + labelOf(el)); });

    if (currentSig(sd).join("\u0001") === want.join("\u0001")) return;  /* 已经对了 */

    /* 手机横滑时记住位置，排完按当前高亮项重新居中 */
    var horizontal = sd.scrollWidth > sd.clientWidth + 2;
    var oldLeft = sd.scrollLeft;

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

    if (horizontal) {
      var on = sd.querySelector(".side-item.on");
      if (on) {
        sd.scrollLeft = Math.max(0, on.offsetLeft - (sd.clientWidth - on.offsetWidth) / 2);
      } else {
        sd.scrollLeft = oldLeft;
      }
      /* 通知 app.js 那条 scroll 监听重算「右边还有更多」的渐隐提示 */
      try { sd.dispatchEvent(new Event("scroll", { bubbles: true })); } catch (e) {}
    }
  }

  var queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      apply();
    });
  }

  var innerObserver = null;
  function watch(sd) {
    if (innerObserver) innerObserver.disconnect();
    if (!sd) return;
    innerObserver = new MutationObserver(refresh);
    innerObserver.observe(sd, { childList: true });
  }

  var lastSide = null;
  var pending = null;

  /* portalShell 重建后 .sidebar 是全新节点，这里换挂新的观察者；
     同一个节点内部的变化（比如 pro-tools 插「我的收藏」）由内层观察者管 */
  new MutationObserver(function () {
    if (pending) return;
    pending = setTimeout(function () {
      pending = null;
      var sd = sideEl();
      if (!sd) return;
      if (sd !== lastSide) {
        lastSide = sd;
        apply();
        watch(sd);
      }
    }, 120);
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener("hashchange", function () { setTimeout(refresh, 300); });

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
