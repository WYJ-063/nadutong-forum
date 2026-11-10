/* ==================================================================
   哪都通 · 快递查询「真实感」增强
   ------------------------------------------------------------------
   覆盖 app.js 里的 genPackage / findOrGen / trackHtml / viewTrack，
   让随机生成的模拟物流更接近真实快递：
     · 节点由 5 条扩到 8 条：下单、揽收、发出、到中转、中转发出、
       到分拨、派送中、已签收
     · 每单的城市对、中转场、重量、件数、物品、服务产品、运费、
       揽件员、派送员、签收方式都各自不同
     · 时间一律自「查询此刻」往前倒推，不会出现未来时间
     · 同一运单号多次查询结果稳定，并会随真实时间自然向后推进
   app.js 一个字节没动；删掉 index.html 里 track-realism.js 的引用即回退。
   ================================================================== */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 城市与末端营业部 ---------- */
  var CITY = [
    ["北京", ["朝阳区", "海淀区"]],
    ["上海", ["徐汇区", "浦东新区"]],
    ["广州", ["天河区", "海珠区"]],
    ["深圳", ["南山区", "福田区"]],
    ["成都", ["武侯区", "锦江区"]],
    ["杭州", ["西湖区", "滨江区"]],
    ["南京", ["鼓楼区", "江宁区"]],
    ["武汉", ["洪山区", "江汉区"]],
    ["西安", ["雁塔区", "碑林区"]],
    ["重庆", ["渝北区", "江北区"]],
    ["青岛", ["市南区", "崂山区"]],
    ["天津", ["南开区", "河西区"]],
    ["苏州", ["姑苏区", "吴中区"]],
    ["长沙", ["岳麓区", "芙蓉区"]],
    ["郑州", ["金水区", "二七区"]],
    ["厦门", ["思明区", "湖里区"]],
    ["昆明", ["五华区", "官渡区"]],
    ["沈阳", ["沈河区", "铁西区"]],
    ["合肥", ["蜀山区", "庐阳区"]],
    ["济南", ["历下区", "市中区"]]
  ];

  var NAMES = ["张伟", "李强", "王磊", "刘洋", "陈晨", "赵磊", "周涛", "吴迪", "孙鹏", "郑凯", "冯波", "韩旭"];
  var GOODS = ["日用百货", "服装鞋帽", "文件资料", "数码配件", "食品干货", "图书文具", "家居用品", "运动装备"];
  var SIGNS = ["本人签收", "家人代收", "前台代收", "门卫代收"];

  var TITLES = {
    o: "已下单", c: "已揽收", x1: "运输中", a1: "到达中转",
    x2: "运输中", a2: "到达目的地", d: "派送中", s: "已签收"
  };

  /* ---------- 小工具 ---------- */
  function hashOf(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function p2(n) { return n < 10 ? "0" + n : String(n); }
  function stamp(d) {
    return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes());
  }
  function hhmm(d) { return p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function mmdd(d) { return p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function stampValid(v) {
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(v || ""))) return false;
    return isFinite(new Date(String(v).replace(" ", "T")).getTime());
  }
  function toMs(x) { return x instanceof Date ? x.getTime() : Number(x) || 0; }
  function addHours(x, n) { return new Date(toMs(x) + n * 3600000); }
  function addMin(x, n) { return new Date(toMs(x) + n * 60000); }

  /* ---------- 节点计划（g = 与上一个节点相差多少分钟） ---------- */
  function planOf(quick) {
    if (quick) {
      return [{ k: "o", g: 24 }, { k: "c", g: 42 }, { k: "d", g: 32 }, { k: "s", g: 20 }];
    }
    return [
      { k: "o", g: 42 },
      { k: "c", g: 165 },
      { k: "x1", g: 300 },
      { k: "a1", g: 155 },
      { k: "x2", g: 320 },
      { k: "a2", g: 115 },
      { k: "d", g: 70 },
      { k: "s", g: 55 }
    ];
  }

  /* 大区：中转场按目的地区域命名，避免出现"长沙→成都途经青岛"这种离谱路线 */
  var REGION = {
    北京: "华北", 天津: "华北", 济南: "华北", 青岛: "华北",
    上海: "华东", 杭州: "华东", 南京: "华东", 苏州: "华东", 合肥: "华东", 厦门: "华东",
    广州: "华南", 深圳: "华南",
    武汉: "华中", 长沙: "华中", 郑州: "华中",
    成都: "西南", 重庆: "西南", 昆明: "西南",
    西安: "西北",
    沈阳: "东北"
  };

  function statusAt(quick, idx) {
    if (quick) return ["待揽收", "已揽收", "派送中", "已签收"][idx] || "派送中";
    return ["待揽收", "已揽收", "运输中", "已到达中转", "运输中", "已到达分拨", "派送中", "已签收"][idx] || "派送中";
  }

  /* 最后一跳距「现在」多少分钟，决定这一单看起来有多新 */
  function freshAt(quick, idx, h) {
    var base = quick ? [16, 48, 26, 40] : [20, 95, 125, 66, 115, 60, 30, 48];
    return (base[idx] || 30) + ((h >>> 24) % 18);
  }

  /* ---------- 轨迹文案 ---------- */
  function nodeText(pk, k, d, state) {
    var desc;
    var who = pk._recv, tel = pk._tel;
    if (k === "o") {
      desc = "您的快件订单已提交，" + pk.from + " 已接单，揽件员 " + who +
        " 预计 " + hhmm(addHours(d, 3)) + " 前上门揽收，请保持电话畅通。";
    } else if (k === "c") {
      desc = pk.from + " 已揽收您的快件，实计重量 " + pk.weight + "，共 " + pk.count +
        " 件，正在发往" + pk.fromCity + "转运中心。";
    } else if (k === "x1") {
      desc = "快件已由" + pk.fromCity + "转运中心装车发出，下一站" + pk.mid +
        "，预计 " + hhmm(addHours(d, 5)) + " 到达。";
    } else if (k === "a1") {
      desc = "快件已到达" + pk.mid + "，正在分拣，预计 " + hhmm(addHours(d, 4)) + " 前转出。";
    } else if (k === "x2") {
      desc = "快件已由" + pk.mid + "发出，发往" + pk.toCity + "分拨中心。";
    } else if (k === "a2") {
      desc = "快件已到达" + pk.toCity + "分拨中心，正在安排转入末端网点。";
    } else if (k === "d") {
      desc = "快件已到达" + pk.to + "，派件员 " + who + "（" + tel + "）正在为您派送，请保持电话畅通。";
    } else {
      desc = "快件已签收，签收人：" + pk._sign + "。感谢使用哪都通快递，期待再次为您服务。";
    }
    return { t: stamp(d), title: TITLES[k], desc: desc, state: state };
  }

  function buildTimeline(pk, idx, t0) {
    var plan = planOf(!!pk.quick);
    var h = hashOf(pk.code);
    var k = 1 + ((h >>> 29) % 6) / 24;      /* 节点间隔 1.0 ~ 1.25 倍抖动 */
    var offs = [], acc = freshAt(!!pk.quick, idx, h), i;
    for (i = idx; i >= 0; i--) {
      offs[i] = acc;
      acc += plan[i].g * k;
    }
    var out = [];
    for (i = idx; i >= 0; i--) {
      out.push(nodeText(pk, plan[i].k, addMin(t0, -offs[i]), i === idx ? "cur" : "done"));
    }
    return out;
  }

  /* ---------- 生成一条运单 ---------- */
  function stageOf(h, quick) {
    var r = (h >>> 19) % 100;
    if (quick) return r < 12 ? 0 : r < 34 ? 1 : r < 78 ? 2 : 3;
    if (r < 5) return 0;
    if (r < 15) return 1;
    if (r < 32) return 2;
    if (r < 44) return 3;
    if (r < 55) return 4;
    if (r < 66) return 5;
    if (r < 84) return 6;
    return 7;
  }

  function genPackage(code) {
    var normalized = String(code || "").trim().toUpperCase();
    if (!normalized) normalized = "NDT" + (1000000000 + Math.floor(Math.random() * 8000000000));

    var h = hashOf(normalized);
    var t0 = Date.now();
    var quick = (h % 27 === 0);

    var ai = h % CITY.length;
    var bi = (h >>> 5) % CITY.length;
    if (bi === ai) bi = (bi + 9) % CITY.length;

    var from = CITY[ai];
    var to = quick ? from : CITY[bi];

    var fromArea = from[1][0];
    var toArea = quick ? from[1][1] : to[1][0];
    var fromName = from[0] + fromArea + "营业部";
    var toName = to[0] + toArea + "营业部";

    /* 中转场按大区命名：同区就用出发区，跨区用目的区 */
    var regA = REGION[from[0]] || "华东";
    var regB = REGION[to[0]] || "华东";
    var midCity = quick ? "" : (regA === regB ? regA : regB) + "中转场";

    var svc = quick ? "同城急送" : ((h >>> 3) % 5 === 0 ? "次日达" : "标准快递");
    var weight = Math.round((0.5 + ((h >>> 8) % 42) / 10) * 10) / 10;
    var count = 1 + ((h >>> 12) % 3);
    var goods = GOODS[(h >>> 16) % GOODS.length];
    var fee = (12 + weight * 3.2 + (count - 1) * 2).toFixed(2);
    var recv = NAMES[(h >>> 22) % NAMES.length];
    var tel = "138****" + (1000 + ((h >>> 26) % 9000));

    var eta;
    if (quick) {
      eta = addHours(t0, 4);
    } else if (svc === "次日达") {
      eta = addHours(t0, 24);
      eta.setHours(18, 0, 0, 0);
    } else {
      eta = addHours(t0, 48);
      eta.setHours(18, 0, 0, 0);
    }

    var idx = stageOf(h, quick);
    var pk = {
      id: (typeof genId === "function" ? genId("pk") : "pk" + h),
      code: normalized,
      v: 2,
      _t0: t0,
      _stage: idx,
      _recv: recv,
      _tel: tel,
      _sign: SIGNS[(h >>> 14) % SIGNS.length],
      quick: quick,
      from: fromName,
      to: toName,
      fromCity: from[0],
      toCity: to[0],
      mid: midCity,
      weight: weight.toFixed(1) + " kg",
      count: count,
      goods: goods,
      service: svc,
      fee: fee,
      eta: stamp(eta),
      status: statusAt(quick, idx),
      timeline: []
    };
    pk.timeline = buildTimeline(pk, idx, t0);
    return pk;
  }

  /* ---------- 查询 / 复用 / 随时间推进 ---------- */
  function advance(pk) {
    var t0 = pk._t0 || Date.now();
    var max = pk.quick ? 3 : 7;
    var bump = Math.floor((Date.now() - t0) / 3600000 / 10);   /* 每 10 小时推进一档 */
    var idx = Math.min(max, (pk._stage || 0) + bump);
    if (idx !== pk._stage) {
      pk._stage = idx;
      pk.status = statusAt(!!pk.quick, idx);
      pk.timeline = buildTimeline(pk, idx, t0);
      if (typeof DB !== "undefined" && DB.save) DB.save();
    }
    return pk;
  }

  function findOrGen(code) {
    var normalized = String(code || "").trim().toUpperCase();
    if (typeof DB === "undefined" || !DB.data) return genPackage(normalized);
    if (!Array.isArray(DB.data.packages)) DB.data.packages = [];

    var list = DB.data.packages, i, at = -1;
    for (i = 0; i < list.length; i++) {
      if (String(list[i] && list[i].code || "").trim().toUpperCase() === normalized) { at = i; break; }
    }

    if (at >= 0) {
      var old = list[at];
      var ok = old && old.v === 2 && Array.isArray(old.timeline) && old.timeline.length &&
        old.timeline.every(function (x) { return x && x.title && stampValid(x.t); });
      if (ok) return advance(old);
      var fresh = genPackage(normalized);
      fresh.id = (old && old.id) || fresh.id;
      list[at] = fresh;
      DB.save();
      return fresh;
    }

    var pk = genPackage(normalized);
    list.push(pk);
    if (list.length > 200) list.splice(0, list.length - 200);
    DB.save();
    return pk;
  }

  /* ---------- 渲染 ---------- */
  function tagClass(status) {
    if (status === "已签收") return "tag tag-green";
    if (status === "派送中") return "tag tag-orange";
    return "tag";
  }

  function trackHtml(pk) {
    if (!pk) return "";
    var rows = (pk.timeline || []).filter(function (x) { return x && x.title; }).map(function (x) {
      return '<div class="tl-item ' + esc(x.state || "") + (x.state === "cur" ? " current" : "") + '">' +
        '<div class="t">' + esc(x.t || "") + "</div>" +
        "<h4>" + esc(x.title) + "</h4>" +
        "<p>" + esc(x.desc || "") + "</p></div>";
    }).join("") || '<div class="empty">暂无物流轨迹</div>';

    function dayOf(s) {
      var d = new Date(String(s || "").replace(" ", "T"));
      return isNaN(d.getTime()) ? "" : mmdd(d);
    }

    var etaText;
    if (pk.status === "已签收") {
      var signed = (pk.timeline[0] && pk.timeline[0].t) || "";
      etaText = dayOf(signed) ? ("已于 " + esc(dayOf(signed)) + " 送达") : "已送达";
    } else {
      var etaDay = dayOf(pk.eta);
      etaText = etaDay ? ("预计 <b>" + esc(etaDay) + " 前</b> 送达") : "预计送达时间待更新";
    }

    return '<div class="trk-hero">' +
        '<div class="trk-top">' +
          '<div class="trk-status' + (pk.status === "已签收" ? "" : " on") + '">' + esc(pk.status) + "</div>" +
          '<div class="trk-eta">' + etaText + "</div>" +
        "</div>" +
        '<div class="trk-meta">' +
          '<span class="trk-code">' + esc(pk.code) + "</span>" +
          '<span class="trk-dot"></span>' +
          "<span>" + esc(pk.service) + "</span>" +
          '<span class="trk-dot"></span>' +
          "<span>" + esc(pk.weight) + " · " + esc(pk.count) + " 件</span>" +
        "</div>" +
        '<div class="trk-route">' +
          '<span class="trk-city"><b>' + esc(pk.fromCity) + "</b><i>" + esc(pk.from.replace(pk.fromCity, "")) + "</i></span>" +
          '<span class="trk-line"></span>' +
          '<span class="trk-city r"><b>' + esc(pk.toCity) + "</b><i>" + esc(pk.to.replace(pk.toCity, "")) + "</i></span>" +
        "</div>" +
      "</div>" +

      '<div class="trk-card">' +
        '<div class="trk-head"><span class="trk-title">物流轨迹</span><span class="trk-sublabel">共 ' +
          esc((pk.timeline || []).length) + " 条</span></div>" +
        '<div class="tl">' + rows + "</div>" +
      "</div>" +

      '<div class="trk-card">' +
        '<div class="trk-head"><span class="trk-title">面单信息</span><span class="trk-sublabel">' +
          esc(pk.code) + "</span></div>" +
        '<div class="trk-fields">' +
          "<div><span>物品</span><b>" + esc(pk.goods) + "</b></div>" +
          "<div><span>件数 / 重量</span><b>" + esc(pk.count) + " 件 · " + esc(pk.weight) + "</b></div>" +
          "<div><span>服务产品</span><b>" + esc(pk.service) + "</b></div>" +
          "<div><span>运费</span><b>￥" + esc(pk.fee) + "</b></div>" +
          "<div><span>揽件员</span><b>" + esc(pk._recv) + " · " + esc(pk._tel) + "</b></div>" +
          "<div><span>预计送达</span><b>" + esc(dayOf(pk.eta) ? dayOf(pk.eta) + " 前" : "待更新") + "</b></div>" +
        "</div>" +
      "</div>";
  }

  function viewTrack(code) {
    var body;
    if (code) {
      body = trackHtml(findOrGen(code));
    } else {
      body = '<div class="trk-card trk-empty">' +
        '<div class="trk-empty-ico">📦</div>' +
        "<p>请输入运单号开始查询</p>" +
        '<div class="trk-samples">' +
          '<a class="trk-sample" href="#/track/NDT7770001234">NDT7770001234</a>' +
          '<a class="trk-sample" href="#/track/NDT6660005678">NDT6660005678</a>' +
          '<a class="trk-sample" href="#/track/NDT8890004321">NDT8890004321</a>' +
        "</div>" +
        '<p class="trk-tip">以上为示例单号，直接点击即可查看轨迹</p>' +
      "</div>";
    }
    return surfaceHeader("track") +
      '<div class="page-head"><div class="wrap"><h1>快递查询</h1><p>输入运单号，实时查询包裹动态</p></div></div>' +
      '<div class="section"><div class="wrap">' +
        '<div class="track-box" style="max-width:none;margin:0 0 24px">' +
          '<input id="tb-code" placeholder="请输入运单号，如 NDT7770001234" value="' + esc(code || "") + '">' +
          '<button class="btn btn-orange" id="tb-go">查询</button>' +
        "</div>" +
        '<div id="track-result">' + body + "</div>" +
      "</div></div>" + surfaceFooter();
  }

  /* ---------- 覆盖 ---------- */
  window.genPackage = genPackage;
  window.findOrGen = findOrGen;
  window.trackHtml = trackHtml;
  window.viewTrack = viewTrack;

  /* app.js 自身加载时可能已经按当前 hash 渲染过一次首屏，
     若此刻正停在快递查询页，就用新的实现再渲染一遍。 */
  try {
    if (location.hash.indexOf("#/track") === 0 && typeof router === "function") router();
  } catch (e) { /* 忽略：首屏未就绪也不影响后续路由 */ }
})();
