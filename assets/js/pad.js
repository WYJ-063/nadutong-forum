/* 哪都通 · 在页画板（站内模块 v1） —— 不再用 iframe
   依赖：无。调用：NDTPad.open({meta,id,onStick,onClose,onSaved})  */
(function () {
  if (window.NDTPad) return;

  var PRESETS = [
    { w: 1000, h: 800, label: '标清' },
    { w: 1200, h: 960, label: '普清' },
    { w: 1600, h: 1280, label: '高清' },
    { w: 2000, h: 1600, label: '超清' }
  ];
  var W = 1000, H = 800;          // 默认最小档
  var VIEW_R = 144 / 174;          // 取景框比例（跟卡片相纸一致）

  /* ---------------- 样式 ---------------- */
  var CSS = '' +
    '#ndtpad{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;' +
    'background:rgba(12,16,28,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);' +
    'font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;color:#101828}' +
    '#ndtpad.on{display:flex}' +
    '#ndtpad *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}' +
    '.np-panel{width:100%;height:100%;background:#fff;display:flex;flex-direction:column;overflow:hidden}' +
    '@media(min-width:1000px){.np-panel{width:96vw;height:94vh;max-width:1340px;border-radius:14px;box-shadow:0 24px 64px rgba(10,16,36,.36)}}' +
    '.np-head{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #E7EAF1;flex-wrap:wrap;flex:none}' +
    '.np-head h3{margin:0;font-size:14.5px;font-weight:700;letter-spacing:.02em}' +
    '.np-head .sp{flex:1}' +
    '.np-mini{border:1px solid #DDE2EB;background:#fff;color:#5A6373;border-radius:20px;padding:5px 11px;' +
    'font-size:11.5px;cursor:pointer;font-family:inherit}' +
    '.np-mini.on{background:#1F2A44;border-color:#1F2A44;color:#fff}' +
    '.np-close{border:1px solid #8C2D22;background:#8C2D22;color:#fff;border-radius:20px;padding:6px 15px;' +
    'font-size:12px;font-weight:700;letter-spacing:.04em;cursor:pointer;font-family:inherit;' +
    'box-shadow:0 4px 12px rgba(140,45,34,.28)}' +
    '.np-close:active{transform:translateY(1px)}' +
    '.np-slotbtn{border:1px solid #C7D2E5;background:#F4F7FC;color:#33405A;border-radius:20px;padding:6px 13px;' +
    'font-size:12px;cursor:pointer;font-family:inherit}' +
    '.np-slotbtn.on{background:#1F2A44;border-color:#1F2A44;color:#fff}' +
    /* 存档面板 */
    '.np-save{position:absolute;inset:0;background:rgba(12,16,28,.5);display:none;align-items:center;' +
    'justify-content:center;z-index:5;padding:18px}' +
    '.np-save.on{display:flex}' +
    '.np-savebox{background:#fff;border-radius:14px;padding:16px 18px;width:min(560px,94vw);max-height:88vh;overflow:auto;' +
    'box-shadow:0 24px 60px rgba(10,16,36,.4)}' +
    '.np-savebox h4{margin:0 0 4px;font-size:14.5px}' +
    '.np-savebox p{margin:0 0 12px;font-size:11.5px;color:#8A93A3;line-height:1.6}' +
    '.np-slot{display:flex;gap:10px;align-items:center;border:1px solid #E6EAF2;border-radius:10px;' +
    'padding:9px;margin-bottom:8px;background:#FAFBFD}' +
    '.np-slot .th{width:64px;height:64px;border-radius:6px;background:#EFEFEA;flex:none;overflow:hidden;' +
    'display:flex;align-items:center;justify-content:center;font-size:11px;color:#AEB4C0;' +
    'box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}' +
    '.np-slot .th img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.np-slot .meta{flex:1;min-width:0}' +
    '.np-slot .meta b{display:block;font-size:12.5px;margin-bottom:3px}' +
    '.np-slot .meta span{font-size:11px;color:#8A93A3}' +
    '.np-slot .ops{display:flex;gap:6px;flex-wrap:wrap}' +
    '.np-opt{display:flex;align-items:center;gap:9px;margin:7px 0;font-size:12px;color:#48505E}' +
    '.np-opt span{width:32px;flex:none;color:#6B7484}' +
    '.np-opt input[type=range]{flex:1;height:26px;accent-color:#1F2A44}' +
    '.np-opt em{width:58px;flex:none;text-align:right;font-style:normal;font-size:11.5px;color:#8A93A3}' +
    '.np-confirm{position:fixed;inset:0;background:rgba(12,16,28,.55);display:none;align-items:center;' +
    'justify-content:center;z-index:2147483003;padding:20px}' +
    '.np-confirm.on{display:flex}' +
    '.np-cbox{background:#fff;border-radius:14px;padding:20px;width:min(360px,92vw);' +
    'box-shadow:0 24px 60px rgba(10,16,36,.42)}' +
    '.np-cbox b{font-size:15px;display:block;margin-bottom:8px}' +
    '.np-cbox p{font-size:12.5px;color:#6B7484;line-height:1.7;margin:0 0 16px}' +
    '.np-cbox .row{display:flex;gap:9px}' +
    '.np-cbox .row .np-btn{flex:1;text-align:center;padding:10px}' +
    '.np-danger{background:#8C2D22!important;border-color:#8C2D22!important;color:#fff!important}' +
    '.np-body{flex:1;min-height:0;display:flex;gap:12px;padding:12px 14px;overflow:hidden}' +
    '@media(max-width:900px){.np-body{flex-direction:column;gap:10px;padding:10px 10px 0}}' +
    '.np-stage{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}' +
    '.np-cwrap{position:relative;max-width:100%;max-height:100%;border-radius:10px;overflow:hidden;' +
    'background:#FDFCF8;box-shadow:inset 0 0 0 1px rgba(70,58,40,.2),0 10px 24px rgba(60,44,22,.12);touch-action:none}' +
    '.np-cwrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '.np-art{mix-blend-mode:multiply}' +
    '.np-grain{mix-blend-mode:multiply;pointer-events:none}' +
    '.np-view{position:absolute;border:1.5px dashed rgba(31,42,68,.45);background:rgba(31,42,68,.03);' +
    'pointer-events:none;border-radius:2px}' +
    '.np-view::after{content:"取景框";position:absolute;left:0;top:-19px;font-size:10px;color:#7A8394;' +
    'letter-spacing:.08em;background:rgba(255,255,255,.7);padding:0 4px;border-radius:3px}' +
    '.np-vh{position:absolute;left:50%;top:-15px;transform:translateX(-50%);min-width:52px;height:20px;' +
    'pointer-events:auto;cursor:grab;touch-action:none;border-radius:10px;background:rgba(31,42,68,.92);' +
    'color:#fff;font-size:9.5px;line-height:1;white-space:nowrap;display:flex;align-items:center;' +
    'justify-content:center;letter-spacing:.04em;border:0;font-family:inherit;' +
    'box-shadow:0 2px 8px rgba(10,16,36,.28);padding:0 8px}' +
    '.np-side{width:330px;flex:none;overflow:auto;display:flex;flex-direction:column;gap:8px;padding-right:2px}' +
    '@media(max-width:900px){.np-side{width:100%;flex:none;max-height:42vh;overflow:auto}}' +
    '.np-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
    '.np-lbl{font-size:10.5px;color:#9AA0AE;letter-spacing:.1em;width:30px;flex:none}' +
    '.np-chip{border:1px solid #DDE2EB;background:#fff;border-radius:7px;padding:5px 9px;font-size:11.5px;' +
    'color:#4B5468;cursor:pointer;font-family:inherit;white-space:nowrap}' +
    '.np-chip.on{background:#1F2A44;color:#fff;border-color:#1F2A44}' +
    '.np-brushes{display:flex;gap:5px;flex-wrap:wrap}' +
    '.np-sw{width:22px;height:22px;border-radius:50%;border:1px solid rgba(0,0,0,.14);cursor:pointer;flex:none;padding:0}' +
    '.np-sw.on{box-shadow:0 0 0 2px #fff,0 0 0 4px #1F2A44}' +
    '.np-pick{position:relative;width:28px;height:22px;border-radius:6px;overflow:hidden;border:1px solid #DDE2EB;' +
    'background:conic-gradient(#f44,#fc4,#4f4,#4ff,#44f,#f4f,#f44);display:flex;cursor:pointer;flex:none;padding:0}' +
    '.np-pick input{opacity:0;width:100%;height:100%;position:absolute;inset:0;cursor:pointer;border:0}' +
    '.np-range{flex:1;min-width:90px;accent-color:#1F2A44;height:18px}' +
    '.np-num{font-size:11px;color:#5A6373;min-width:30px;text-align:right;font-variant-numeric:tabular-nums}' +
    '.np-toggle{display:flex;align-items:center;gap:5px;font-size:11.5px;color:#4B5468;cursor:pointer;margin-left:auto}' +
    '.np-toggle input{width:31px;height:18px;appearance:none;background:#D6DCE7;border-radius:20px;position:relative;' +
    'outline:none;cursor:pointer;transition:.18s;flex:none;border:0}' +
    '.np-toggle input:checked{background:#1F2A44}' +
    '.np-toggle input::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;' +
    'background:#fff;transition:.18s}' +
    '.np-toggle input:checked::after{transform:translateX(13px)}' +
    '.np-btn{border:1px solid #D9DEE8;background:#fff;color:#3A4354;border-radius:8px;padding:8px 12px;' +
    'font-size:12px;cursor:pointer;font-family:inherit}' +
    '.np-btn.primary{background:#1F2A44;color:#fff;border-color:#1F2A44}' +
    '.np-btn:disabled{opacity:.42;cursor:not-allowed}' +
    '.np-acts{display:flex;gap:7px;flex-wrap:wrap}' +
    '.np-acts .np-btn{flex:1;min-width:74px;text-align:center;padding:8px 8px}' +
    '.np-layers{border:1px solid #E6EAF2;border-radius:9px;overflow:hidden;background:#FAFBFD}' +
    '.np-lhead{display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:1px solid #EDF0F6}' +
    '.np-lhead b{font-size:11.5px;letter-spacing:.08em;color:#5A6373}' +
    '.np-lhead .ops{margin-left:auto;display:flex;gap:4px}' +
    '.np-lhead button{border:1px solid #DCE2EC;background:#fff;border-radius:6px;padding:3px 7px;font-size:10.5px;' +
    'color:#4B5468;cursor:pointer;font-family:inherit}' +
    '.np-lyr{display:flex;align-items:center;gap:6px;padding:5px 8px;border-bottom:1px solid #F0F3F8;' +
    'font-size:11.5px;color:#4B5468;cursor:pointer}' +
    '.np-lyr:last-child{border-bottom:0}' +
    '.np-lyr.on{background:#EEF3FF}' +
    '.np-lyr .ico{border:0;background:transparent;font-size:12px;line-height:1;padding:2px 3px;cursor:pointer;' +
    'border-radius:4px;color:#7A8394;font-family:inherit}' +
    '.np-lyr .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.np-lyr .bd{font-size:9.5px;border:1px solid #D8DFEA;border-radius:4px;padding:1px 5px;color:#6B7484;' +
    'background:#fff;cursor:pointer;font-family:inherit}' +
    '.np-lyr .bd.mult{background:#1F2A44;color:#fff;border-color:#1F2A44}' +
    '.np-tip{font-size:10.5px;color:#A6ADBA;line-height:1.6}' +
    '.np-toast{position:fixed;left:50%;bottom:40px;transform:translateX(-50%);z-index:2147483001;' +
    'background:rgba(24,30,46,.94);color:#fff;font-size:12.5px;padding:9px 16px;border-radius:9px;' +
    'opacity:0;transition:.2s;pointer-events:none;max-width:82vw;text-align:center}' +
    '.np-toast.on{opacity:1}' +
    '.np-stamp .np-chip{padding:3px}' +
    '.np-stamp .np-chip canvas{width:34px;height:34px;display:block}' +
    '.np-imp{border:1px dashed #C9D1DE;background:#FAFBFD;color:#7A8394;border-radius:7px;padding:6px 9px;' +
    'font-size:11.5px;cursor:pointer;font-family:inherit}' +
    '.np-sel{display:none;gap:8px;align-items:center;background:#F7F9FC;border:1px solid #E3E8F2;border-radius:8px;' +
    'padding:7px 9px;flex-wrap:wrap}' +
    '.np-sel.on{display:flex}' +
    '.np-sel input[type=range]{width:80px;accent-color:#1F2A44}' +
    '.np-size{display:flex;gap:5px;align-items:center}' +
    '.np-size button{border:1px solid #DDE2EB;background:#fff;border-radius:6px;padding:3px 8px;font-size:11px;' +
    'color:#4B5468;cursor:pointer;font-family:inherit}' +
    '.np-size button.on{background:#1F2A44;border-color:#1F2A44;color:#fff}';

  function injectCSS() {
    if (document.getElementById('ndtpad-css')) return;
    var s = document.createElement('style');
    s.id = 'ndtpad-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------------- 工具 ---------------- */
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function nc(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = el('div', 'np-toast');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1600);
  }

  /* ---------------- 笔 ---------------- */
  var BRUSHES = {
    pen: { label: '钢笔', w: .95, alpha: .96, bleed: 0, fringe: .55, body: .12, gsz: .7 },
    ball: { label: '圆珠笔', w: .62, alpha: .9, bleed: 0, fringe: .30, body: .24, gsz: .6 },
    pencil: { label: '铅笔', w: .68, alpha: .7, bleed: .10, fringe: .45, body: .34, gsz: 1.0 },
    charcoal: { label: '炭笔', w: 1.35, alpha: .86, bleed: .16, fringe: .55, body: .18, gsz: .7, rough: 2 },
    brush: { label: '毛笔', w: 1.2, alpha: .9, bleed: .6, fringe: .5, body: .14, gsz: .9 },
    marker: { label: '马克笔', w: 1.75, alpha: .4, bleed: .06, fringe: .22, body: .1, gsz: .9, flat: true },
    eraser: { label: '橡皮', w: 1, alpha: 1, erase: 'hard' },
    air: { label: '柔边喷枪', w: 2.2, alpha: .055, air: true },
    airErase: { label: '喷枪橡皮', w: 2.4, alpha: .07, erase: 'soft' }
  };
  var SIZES = { pen: 4, ball: 3, pencil: 4.5, charcoal: 7, brush: 8, marker: 11, eraser: 30, air: 46, airErase: 56 };
  var brush = 'pen', usePressure = true, color = '#241C12';
  var PRESET_COLORS = ['#241C12', '#8C2D22', '#B4402B', '#3B4A6B', '#8A5B2A', '#5E3A22', '#6B6459', '#2F6B58'];
  function B() { return BRUSHES[brush]; }
  function curSize() { return SIZES[brush] || 4; }
  function isErase() { return !!B().erase; }

  /* ---------------- 运行时状态 ---------------- */
  var root = null, wrap = null, paperC, artC, grainC, pctx, actx, gctx, viewBox;
  var layers = [], active = 0, uid = 0, paperKind = 'pure';
  var liveC, liveCtx, txC, txCtx, frC, frCtx, spC, spCtx, hcC, hcCtx, beforeBuf, beforeCtx;
  var stroking = false, drawing = false, lastPt = null, lastT = 0, strokeBox = null, strokeSum = 0, strokeN = 0;
  var selObj = null, dragObj = null;
  var photoImg = null;
  var META = { name: '吕 良', code: 'ND-WANTED-009', danger: 'B 级', faction: '原吕家成员', skill: '明魂术', lastSeen: '行踪不明', status: '在逃', reward: '￥300,000', note: '掌握记忆相关异术，具有较高情报价值。' };
  var CUR_ID = '', OPTS = {}, draftAsked = false;
  var view = { x: 0, y: 0, w: 0, h: 0 };

  /* ---------------- 历史（patch 差分，100 步） ---------------- */
  var hist = [], pos = -1, HIST_MAX = 100, HIST_BYTES = 48 * 1024 * 1024, histBytes = 0;

  function bytesOf(c) { return c.width * c.height * 4; }
  function pushOp(op) {
    // 丢掉 redo 分支
    while (hist.length > pos + 1) { histBytes -= hist.pop().bytes || 0; }
    hist.push(op); pos = hist.length - 1;
    histBytes += op.bytes || 0;
    while (hist.length > HIST_MAX || histBytes > HIST_BYTES) {
      var old = hist.shift(); histBytes -= old.bytes || 0; pos--;
    }
    if (pos < 0) pos = 0;
    syncUndo();
  }
  function syncUndo() {
    var u = root.querySelector('#npUndo'), r = root.querySelector('#npRedo');
    if (u) u.disabled = pos < 0;
    if (r) r.disabled = pos + 1 >= hist.length;
  }
  function cropFrom(src, x, y, w, h) {
    var t = nc(w, h);
    t.getContext('2d').drawImage(src, x, y, w, h, 0, 0, w, h);
    return t;
  }
  function applyPatch(layer, buf, x, y, w, h) {
    var c = layer.ctx;
    c.save();
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.clearRect(x, y, w, h);
    c.drawImage(buf, x, y);
    c.restore();
  }
  function undo() {
    if (pos < 0) return;
    var op = hist[pos];
    if (op.kind === 'patch') applyPatch(op.layer, op.before, op.bx, op.by, op.bw, op.bh);
    else if (op.kind === 'objs') { op.layer.objects.length = 0; op.before.forEach(function (o) { op.layer.objects.push(o); }); }
    else if (op.kind === 'full') { op.layer.ctx.clearRect(0, 0, W, H); op.layer.ctx.drawImage(op.before, 0, 0); }
    pos--; syncUndo(); composite(true); renderLayers();
  }
  function redo() {
    if (pos + 1 >= hist.length) return;
    pos++;
    var op = hist[pos];
    if (op.kind === 'patch') applyPatch(op.layer, op.after, op.bx, op.by, op.bw, op.bh);
    else if (op.kind === 'objs') { op.layer.objects.length = 0; op.after.forEach(function (o) { op.layer.objects.push(o); }); }
    else if (op.kind === 'full') { op.layer.ctx.clearRect(0, 0, W, H); if (op.after) op.layer.ctx.drawImage(op.after, 0, 0); }
    syncUndo(); composite(true); renderLayers();
  }
  function beginSnapshot() {
    beforeCtx.clearRect(0, 0, W, H);
    var l = layers[active];
    if (l) beforeCtx.drawImage(l.ink, 0, 0);
  }
  function markBox(x, y, pad) {
    if (!strokeBox) strokeBox = { x0: x, y0: y, x1: x, y1: y, pad: pad || 6 };
    else {
      if (x < strokeBox.x0) strokeBox.x0 = x;
      if (y < strokeBox.y0) strokeBox.y0 = y;
      if (x > strokeBox.x1) strokeBox.x1 = x;
      if (y > strokeBox.y1) strokeBox.y1 = y;
      if (pad > strokeBox.pad) strokeBox.pad = pad;
    }
  }
  function commitStrokePatch(layer) {
    if (!strokeBox) return;
    var pd = strokeBox.pad + 6;
    var x = Math.max(0, Math.floor(strokeBox.x0 - pd));
    var y = Math.max(0, Math.floor(strokeBox.y0 - pd));
    var w = Math.min(W, Math.ceil(strokeBox.x1 + pd)) - x;
    var h = Math.min(H, Math.ceil(strokeBox.y1 + pd)) - y;
    if (w <= 0 || h <= 0) { strokeBox = null; return; }
    var before = cropFrom(beforeBuf, x, y, w, h);
    var after = cropFrom(layer.ink, x, y, w, h);
    pushOp({ kind: 'patch', layer: layer, bx: x, by: y, bw: w, bh: h, before: before, after: after, bytes: bytesOf(before) + bytesOf(after) });
    strokeBox = null;
  }

  /* ---------------- 纸 ---------------- */
  var PAPER = {};
  PAPER.pure = function () { pctx.fillStyle = '#FFFFFF'; pctx.fillRect(0, 0, W, H); };
  PAPER.white = function () { pctx.fillStyle = '#FDFCF7'; pctx.fillRect(0, 0, W, H); };
  PAPER.note = function () {
    pctx.fillStyle = '#FCFDFB'; pctx.fillRect(0, 0, W, H);
    var gap = Math.round(H / 14);
    pctx.strokeStyle = '#D6E1F0'; pctx.lineWidth = Math.max(1, W / 620);
    for (var y = gap; y < H; y += gap) { pctx.beginPath(); pctx.moveTo(0, y); pctx.lineTo(W, y); pctx.stroke(); }
    var lx = Math.round(W * .1);
    pctx.strokeStyle = '#E9C9C9'; pctx.beginPath(); pctx.moveTo(lx, 0); pctx.lineTo(lx, H); pctx.stroke();
    pctx.fillStyle = 'rgba(120,140,170,.05)'; pctx.fillRect(0, 0, lx, H);
  };
  PAPER.kraft = function () {
    var g = pctx.createLinearGradient(0, 0, W * .8, H);
    g.addColorStop(0, '#D3A46F'); g.addColorStop(.5, '#C69560'); g.addColorStop(1, '#B9834F');
    pctx.fillStyle = g; pctx.fillRect(0, 0, W, H);
    var rnd = mulberry(3171), n = Math.round(W * H / 1100);
    pctx.lineWidth = Math.max(1, W / 600);
    for (var i = 0; i < n; i++) {
      var x = rnd() * W, y = rnd() * H, len = (5 + rnd() * 13) * (W / 720), ang = rnd() * Math.PI;
      pctx.strokeStyle = rnd() > .5 ? 'rgba(255,242,218,' + (.05 + rnd() * .08) + ')'
        : 'rgba(122,80,40,' + (.04 + rnd() * .07) + ')';
      pctx.beginPath(); pctx.moveTo(x, y);
      pctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); pctx.stroke();
    }
  };
  function hasFilter() { return paperKind !== 'pure'; }
  function drawPaper() {
    pctx.clearRect(0, 0, W, H);
    (PAPER[paperKind] || PAPER.white)();
    drawGrain();
    if (grainC) grainC.style.display = hasFilter() ? '' : 'none';
  }
  function drawGrain() {
    if (!gctx) return;
    gctx.clearRect(0, 0, W, H);
    var img = gctx.createImageData(W, H), d = img.data, rnd = mulberry(7788);
    for (var i = 0; i < d.length; i += 4) {
      var n = 176 + Math.floor(rnd() * 70);
      d[i] = d[i + 1] = d[i + 2] = n; d[i + 3] = 11 + Math.floor(rnd() * 16);
    }
    gctx.putImageData(img, 0, 0);
    var r2 = mulberry(4711);
    for (var k = 0; k < 9; k++) {
      var x = r2() * W, y = r2() * H, r = W * (.18 + r2() * .34);
      var gr = gctx.createRadialGradient(x, y, r * .1, x, y, r);
      gr.addColorStop(0, 'rgba(122,96,58,' + (.04 + r2() * .06) + ')');
      gr.addColorStop(.55, 'rgba(122,96,58,' + (.02 + r2() * .03) + ')');
      gr.addColorStop(1, 'rgba(122,96,58,0)');
      gctx.fillStyle = gr; gctx.beginPath(); gctx.arc(x, y, r, 0, Math.PI * 2); gctx.fill();
    }
    var vg = gctx.createRadialGradient(W / 2, H / 2, W * .42, W / 2, H / 2, W * .78);
    vg.addColorStop(0, 'rgba(120,100,70,0)'); vg.addColorStop(1, 'rgba(120,100,70,.16)');
    gctx.fillStyle = vg; gctx.fillRect(0, 0, W, H);
  }

  /* ---------------- 图层 ---------------- */
  function newLayer(name) {
    var c = nc(W, H);
    return { id: ++uid, name: name, ink: c, ctx: c.getContext('2d'), objects: [], mode: 'multiply', visible: true, locked: false };
  }
  function activeLayer() { return layers[active]; }
  function drawObjects(ctx, objs) {
    objs.forEach(function (o) {
      ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot * Math.PI / 180);
      ctx.drawImage(o.img, -o.w / 2, -o.w / 2, o.w, o.w); ctx.restore();
    });
  }
  var compQ = 0;
  function composite(now) {
    if (!now) {
      if (compQ) return;
      compQ = requestAnimationFrame(function () { compQ = 0; composite(true); });
      return;
    }
    compQ = 0;
    ANIM.sig = '';
    actx.clearRect(0, 0, W, H);
    for (var i = 0; i < layers.length; i++) {
      var l = layers[i]; if (!l.visible) continue;
      var t = l.tmp || (l.tmp = nc(W, H));
      var tc = t.getContext('2d');
      tc.setTransform(1, 0, 0, 1, 0, 0);
      tc.clearRect(0, 0, W, H);
      tc.globalCompositeOperation = 'source-over';
      tc.drawImage(l.ink, 0, 0);
      drawObjects(tc, l.objects);
      actx.globalCompositeOperation = l.mode === 'multiply' ? 'multiply' : 'source-over';
      actx.drawImage(t, 0, 0);
    }
    if (stroking && liveC) {
      actx.globalAlpha = (B().air ? 1 : B().alpha);
      actx.globalCompositeOperation = 'multiply';
      actx.drawImage(liveC, 0, 0);
      actx.globalAlpha = 1;
    }
    actx.globalCompositeOperation = 'source-over';
  }
  function renderLayers() {
    var list = root.querySelector('#npLayerList');
    if (!list) return;
    list.innerHTML = '';
    for (var i = layers.length - 1; i >= 0; i--) {
      (function (i) {
        var l = layers[i], row = el('div', 'np-lyr' + (i === active ? ' on' : ''));
        row.onclick = function () { active = i; renderLayers(); };
        var eye = el('button', 'ico', l.visible ? '◉' : '○');
        eye.title = '显示/隐藏';
        eye.onclick = function (e) { e.stopPropagation(); l.visible = !l.visible; renderLayers(); composite(true); };
        var nm = el('span', 'nm', l.name);
        var lock = el('button', 'ico', l.locked ? '🔒' : '锁');
        lock.title = l.locked ? '已锁定' : '未锁定';
        lock.onclick = function (e) { e.stopPropagation(); l.locked = !l.locked; renderLayers(); };
        var bd = el('button', 'bd' + (l.mode === 'multiply' ? ' mult' : ''), l.mode === 'multiply' ? '正片' : '正常');
        bd.title = '切换混合模式';
        bd.onclick = function (e) {
          e.stopPropagation(); l.mode = l.mode === 'multiply' ? 'normal' : 'multiply';
          renderLayers(); composite(true);
        };
        row.appendChild(eye); row.appendChild(nm); row.appendChild(lock); row.appendChild(bd);
        list.appendChild(row);
      })(i);
    }
  }
  function structuralReset(msg) {
    hist.length = 0; pos = -1; histBytes = 0; syncUndo();
    if (msg) toast(msg);
  }

  /* ---------------- 印章 / 贴纸 ---------------- */
  var SEAL = null;
  function makeSeal(size) {
    var c = nc(size, size), x = c.getContext('2d'), s = size, red = '#A12A20';
    x.translate(s / 2, s / 2); x.rotate(-0.055);
    x.strokeStyle = red; x.lineCap = 'round';
    x.globalAlpha = .5; x.lineWidth = s * .055;
    x.beginPath(); x.arc(0, 0, s * .4265, 0, Math.PI * 2); x.stroke();
    x.globalAlpha = .9; x.lineWidth = s * .049;
    x.beginPath(); x.arc(0, 0, s * .425, 0, Math.PI * 2); x.stroke();
    x.globalAlpha = .62; x.lineWidth = s * .011;
    x.beginPath(); x.arc(0, 0, s * .368, 0, Math.PI * 2); x.stroke();
    x.globalAlpha = .97; x.fillStyle = red; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = 'bold ' + (s * .405) + 'px "KaiTi","STKaiti","Kaiti SC",serif';
    x.save(); x.scale(1.02, 1.06); x.fillText('缉', s * .004, s * .026); x.restore();
    var rnd = mulberry(90210); x.globalCompositeOperation = 'destination-out';
    for (var i = 0; i < 90; i++) {
      var a = rnd() * Math.PI * 2, r = s * (.30 + rnd() * .14);
      x.globalAlpha = .03 + rnd() * .09;
      x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, Math.max(.7, s * .006 + rnd() * s * .01), 0, Math.PI * 2); x.fill();
    }
    for (var j = 0; j < 34; j++) {
      var a2 = rnd() * Math.PI * 2;
      x.globalAlpha = .18 + rnd() * .35;
      x.beginPath(); x.arc(Math.cos(a2) * s * .425, Math.sin(a2) * s * .425, s * .003 + rnd() * s * .012, 0, Math.PI * 2); x.fill();
    }
    for (var k = 0; k < 6; k++) {
      var a3 = rnd() * Math.PI * 2, span = .10 + rnd() * .22;
      x.globalAlpha = .3 + rnd() * .3; x.lineWidth = s * (.012 + rnd() * .02);
      x.beginPath(); x.arc(0, 0, s * .425, a3, a3 + span); x.stroke();
    }
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
    return c;
  }
  function getSeal() { if (!SEAL) SEAL = makeSeal(Math.max(256, Math.round(W * .34))); return SEAL; }
  function addSticker(img, size, rot) {
    var l = activeLayer(); if (!l) return;
    if (l.locked) return toast('当前图层已锁定');
    var before = l.objects.slice();
    var o = { img: img, x: W / 2, y: H / 2, w: size, rot: rot || 0, layer: l };
    l.objects.push(o); selObj = o; syncSel(); composite(true);
    pushOp({ kind: 'objs', layer: l, before: before, after: l.objects.slice(), bytes: 4 * l.objects.length });
  }
  function syncSel() {
    var p = root.querySelector('#npSel');
    if (selObj) {
      p.classList.add('on');
      root.querySelector('#npStkSize').value = selObj.w;
      root.querySelector('#npStkRot').value = Math.round(selObj.rot);
    } else p.classList.remove('on');
  }
  function findObj(p) {
    for (var i = layers.length - 1; i >= 0; i--) {
      var l = layers[i]; if (!l.visible || l.locked) continue;
      for (var j = l.objects.length - 1; j >= 0; j--) {
        var o = l.objects[j], dx = p.x - o.x, dy = p.y - o.y, a = -o.rot * Math.PI / 180;
        var rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
        if (Math.abs(rx) <= o.w / 2 && Math.abs(ry) <= o.w / 2) return o;
      }
    }
    return null;
  }

  /* ---------------- 笔触渲染（沿用原画板内核） ---------------- */
  function canvasPos(e) {
    var r = wrap.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  function widthFor(e, speed) {
    var b = B(), w = curSize() * b.w;
    if (b.flat) return w;
    if (usePressure) {
      var p = (e.pointerType === 'pen' && e.pressure > 0) ? e.pressure : 0;
      if (p > 0) w *= (0.5 + p * 1.2);
      else w *= Math.max(0.55, 1 / (1 + speed * 0.45));
    }
    return Math.max(0.6, w);
  }
  function paint(ctx, x0, y0, x1, y1, w) {
    var b = B();
    ctx.lineCap = b.flat ? 'butt' : 'round'; ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    if (b.rough) {
      ctx.globalAlpha = 1; ctx.strokeStyle = color;
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.lineWidth = w * .62;
      ctx.beginPath();
      ctx.moveTo(x0 + (Math.random() - .5) * 2.4, y0 + (Math.random() - .5) * 2.4);
      ctx.lineTo(x1 + (Math.random() - .5) * 2.4, y1 + (Math.random() - .5) * 2.4); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x1, y1, Math.max(.5, w / 2), 0, Math.PI * 2); ctx.fill();
      return;
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x1, y1, Math.max(.5, w / 2), 0, Math.PI * 2); ctx.fill();
  }
  function grainMask(level, seed) {
    var s = 64, c = nc(s, s), x = c.getContext('2d'), rnd = mulberry(seed || 777);
    var img = x.createImageData(s, s), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = rnd();
      d[i] = d[i + 1] = d[i + 2] = 0;
      d[i + 3] = v > .52 ? Math.round((v - .52) / .48 * 238 * level) : 0;
    }
    x.putImageData(img, 0, 0);
    var b = nc(128, 128), bx = b.getContext('2d');
    bx.imageSmoothingEnabled = true;
    try { bx.filter = 'blur(.6px)'; } catch (e) { }
    bx.drawImage(c, 0, 0, 128, 128);
    return b;
  }
  function applyGrain(ctx, level, px, seed) {
    var mask = grainMask(level, seed);
    var pat = ctx.createPattern(mask, 'repeat');
    var k = Math.max(.85, Math.min(2.2, (px || 6) / 8));
    try {
      var m = new DOMMatrix();
      m.translateSelf(Math.random() * 128, Math.random() * 128);
      m.scaleSelf(k, k); pat.setTransform(m);
    } catch (e) { }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1;
    ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  function bboxArea() {
    if (!strokeBox) return { x: 0, y: 0, w: W, h: H };
    var pd = strokeBox.pad + 8;
    var x = Math.max(0, Math.floor(strokeBox.x0 - pd)), y = Math.max(0, Math.floor(strokeBox.y0 - pd));
    var w = Math.min(W, Math.ceil(strokeBox.x1 + pd)) - x, h = Math.min(H, Math.ceil(strokeBox.y1 + pd)) - y;
    return { x: x, y: y, w: Math.max(1, w), h: Math.max(1, h) };
  }
  function finishStroke(layer, avgW) {
    var b = B(), bb = bboxArea();
    // 只在笔画范围内算晕开/颗粒，2000 画布也不会卡
    txCtx.clearRect(0, 0, W, H);
    txCtx.globalCompositeOperation = 'source-over'; txCtx.globalAlpha = 1;
    txCtx.drawImage(liveC, 0, 0);
    if (b.body > 0) applyGrain(txCtx, b.body, avgW * (b.gsz || .8), Math.floor(Math.random() * 1e6));

    hcCtx.clearRect(0, 0, W, H);
    hcCtx.globalCompositeOperation = 'source-over'; hcCtx.globalAlpha = 1;
    hcCtx.save();
    try { hcCtx.filter = 'blur(' + Math.max(3.4, avgW * .72) + 'px)'; } catch (e) { }
    hcCtx.drawImage(liveC, 0, 0);
    hcCtx.filter = 'none'; hcCtx.restore();

    frCtx.clearRect(0, 0, W, H);
    frCtx.globalCompositeOperation = 'source-over'; frCtx.globalAlpha = 1;
    frCtx.save();
    try { frCtx.filter = 'blur(' + Math.max(1.8, avgW * .26) + 'px)'; } catch (e) { }
    frCtx.drawImage(liveC, 0, 0);
    frCtx.filter = 'none'; frCtx.restore();
    frCtx.globalCompositeOperation = 'destination-out';
    frCtx.drawImage(liveC, 0, 0);
    frCtx.globalCompositeOperation = 'source-over';

    spCtx.clearRect(0, 0, W, H);
    var n = Math.round(1200 * (bb.w * bb.h) / (720 * 720));
    n = Math.max(400, Math.min(2400, n));
    for (var i = 0; i < n; i++) {
      spCtx.globalAlpha = .3 + Math.random() * .7;
      var rr = .95 * (.35 + Math.random() * 1.15);
      spCtx.beginPath();
      spCtx.arc(bb.x + Math.random() * bb.w, bb.y + Math.random() * bb.h, rr, 0, Math.PI * 2);
      spCtx.fillStyle = color; spCtx.fill();
    }
    spCtx.globalAlpha = 1;
    spCtx.globalCompositeOperation = 'destination-in';
    spCtx.drawImage(frC, 0, 0);
    spCtx.globalCompositeOperation = 'source-over';

    var c = layer.ctx;
    c.save(); c.globalCompositeOperation = 'multiply';
    if (b.fringe > 0) {
      c.globalAlpha = Math.min(.68, b.alpha * .34); c.drawImage(hcC, 0, 0);
      c.globalAlpha = Math.min(1, b.alpha * b.fringe * 2); c.drawImage(spC, 0, 0);
    }
    if (b.bleed > 0) {
      c.globalAlpha = b.alpha * b.bleed;
      try { c.filter = 'blur(' + Math.max(1.2, avgW * .34) + 'px)'; } catch (e) { }
      c.drawImage(txC, 0, 0); c.filter = 'none';
    }
    c.globalAlpha = b.alpha; c.drawImage(txC, 0, 0);
    c.restore();
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }
  function airStamp(ctx, x, y, r, alpha, erase) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (erase) {
      g.addColorStop(0, 'rgba(0,0,0,' + alpha + ')');
      g.addColorStop(.55, 'rgba(0,0,0,' + (alpha * .55) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      var rgb = hexRGB(color);
      g.addColorStop(0, 'rgba(' + rgb + ',' + alpha + ')');
      g.addColorStop(.5, 'rgba(' + rgb + ',' + (alpha * .6) + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  function hexRGB(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
  }
  function eraseHard(ctx, x, y, w) {
    ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; ctx.fillStyle = '#000';
    ctx.lineCap = 'round'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.arc(x, y, Math.max(3, w / 2), 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------------- 指针 ---------------- */
  var dwellTimer = 0;
  function stampAir(obj) {
    var b = B();
    var r = Math.max(4, curSize() * (b.w || 1) * .5);
    if (b.erase === 'soft') {
      airStamp(activeLayer().ctx, obj.x, obj.y, r, b.alpha, true);
      markBox(obj.x, obj.y, r + 4);
      composite(true);
    } else {
      airStamp(liveCtx, obj.x, obj.y, r, b.alpha, false);
      markBox(obj.x, obj.y, r + 4);
      composite();
    }
  }
  function down(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (ANIM.on) animStop();
    var p = canvasPos(e);
    var o = findObj(p);
    if (o) {
      selObj = o; syncSel(); composite(true);
      dragObj = { o: o, dx: p.x - o.x, dy: p.y - o.y };
      try { wrap.setPointerCapture(e.pointerId); } catch (err) { }
      return;
    }
    if (selObj) { selObj = null; syncSel(); composite(true); }
    var l = activeLayer();
    if (!l || l.locked) return toast('当前图层已锁定，换个图层或解锁');
    try { wrap.setPointerCapture(e.pointerId); } catch (err) { }
    beginSnapshot();
    strokeBox = null; strokeSum = 0; strokeN = 0;
    drawing = true; lastPt = p; lastT = performance.now();
    var b = B();
    if (b.air) {
      stroking = true; liveCtx.clearRect(0, 0, W, H);
      stampAir(p); strokeSum = curSize(); strokeN = 1;
      clearInterval(dwellTimer);
      dwellTimer = setInterval(function () {
        if (!drawing || !lastPt) return;
        stampAir({ x: lastPt.x, y: lastPt.y });
      }, 90);
    } else if (b.erase === 'hard') {
      eraseHard(l.ctx, p.x, p.y, curSize());
      markBox(p.x, p.y, curSize() + 4);
    } else if (b.erase === 'soft') {
      var r = Math.max(4, curSize() * (b.w || 1) * .5);
      airStamp(l.ctx, p.x, p.y, r, b.alpha, true);
      markBox(p.x, p.y, r + 4);
    } else {
      stroking = true; liveCtx.clearRect(0, 0, W, H);
      var w0 = widthFor(e, 0);
      strokeSum = w0; strokeN = 1;
      paint(liveCtx, p.x, p.y, p.x, p.y, w0);
      markBox(p.x, p.y, w0 + 6);
    }
    composite();
  }
  function move(e) {
    var p = canvasPos(e);
    if (dragObj) { dragObj.o.x = p.x - dragObj.dx; dragObj.o.y = p.y - dragObj.dy; composite(true); return; }
    if (!drawing) return;
    var l = activeLayer(); if (!l) return;
    var b = B();
    var evts = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    if (!evts.length) evts = [e];
    for (var i = 0; i < evts.length; i++) {
      var q = canvasPos(evts[i]);
      var now = performance.now(), dt = Math.max(1, now - lastT);
      var dist = Math.hypot(q.x - lastPt.x, q.y - lastPt.y), speed = dist / dt;
      if (b.air) {
        var step = Math.max(2, curSize() * .18), seg = Math.max(1, Math.round(dist / step));
        for (var s = 1; s <= seg; s++) {
          var t = s / seg, mx = lastPt.x + (q.x - lastPt.x) * t, my = lastPt.y + (q.y - lastPt.y) * t;
          stampAir({ x: mx, y: my });
        }
      } else if (b.erase === 'hard') {
        eraseHard(l.ctx, q.x, q.y, curSize());
        markBox(q.x, q.y, curSize() + 4);
      } else if (b.erase === 'soft') {
        var rr = Math.max(4, curSize() * (b.w || 1) * .5);
        airStamp(l.ctx, q.x, q.y, rr, b.alpha, true);
        markBox(q.x, q.y, rr + 4);
      } else {
        var wv = widthFor(evts[i], speed);
        paint(liveCtx, lastPt.x, lastPt.y, q.x, q.y, wv);
        strokeSum += wv; strokeN++;
        markBox(q.x, q.y, wv + 6);
      }
      lastPt = q; lastT = now;
    }
    composite();
  }
  function up() {
    if (dragObj) { dragObj = null; return; }
    if (!drawing) return;
    drawing = false;
    clearInterval(dwellTimer);
    var l = activeLayer();
    if (l) {
      if (B().air && !B().erase) {
        // 喷枪：整笔按浓度一次性叠进图层
        l.ctx.save();
        l.ctx.globalCompositeOperation = 'source-over';
        l.ctx.globalAlpha = 1;
        l.ctx.drawImage(liveC, 0, 0);
        l.ctx.restore();
        liveCtx.clearRect(0, 0, W, H);
      } else if (!B().erase && stroking) {
        var avgW = strokeN ? strokeSum / strokeN : curSize();
        finishStroke(l, avgW);
        liveCtx.clearRect(0, 0, W, H);
      }
      stroking = false;
      commitStrokePatch(l);
    }
    composite(true);
  }
  function bindPointer() {
    wrap.addEventListener('pointerdown', function (e) { if (e.preventDefault) e.preventDefault(); down(e); });
    wrap.addEventListener('pointermove', function (e) { if (dragObj || drawing) { if (e.preventDefault) e.preventDefault(); move(e); } });
    wrap.addEventListener('pointerup', function (e) { if (e.preventDefault) e.preventDefault(); up(); });
    wrap.addEventListener('pointercancel', up);
    wrap.addEventListener('pointerleave', function () { if (drawing) up(); });
  }

  /* ---------------- 取景框 ---------------- */
  function layoutView() {
    // 取景框：高度占画布 78%，比例 0.83 竖幅，居中
    var vh = Math.min(H * .78, W * .9 / VIEW_R);
    var vw = vh * VIEW_R;
    view.w = vw; view.h = vh;
    view.x = (W - vw) / 2; view.y = (H - vh) / 2;
    paintView();
  }
  function paintView() {
    if (!viewBox) return;
    var r = wrap.getBoundingClientRect();
    viewBox.style.left = (view.x / W * 100) + '%';
    viewBox.style.top = (view.y / H * 100) + '%';
    viewBox.style.width = (view.w / W * 100) + '%';
    viewBox.style.height = (view.h / H * 100) + '%';
  }
  function bindView() {
    var handle = viewBox.querySelector('#npViewHandle');
    var dragV = null;
    handle.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); e.preventDefault();
      var r = wrap.getBoundingClientRect();
      dragV = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y, kx: W / r.width, ky: H / r.height };
      try { handle.setPointerCapture(e.pointerId); } catch (err) { }
    });
    handle.addEventListener('pointermove', function (e) {
      if (!dragV) return;
      e.stopPropagation();
      var nx = dragV.ox + (e.clientX - dragV.sx) * dragV.kx;
      var ny = dragV.oy + (e.clientY - dragV.sy) * dragV.ky;
      view.x = Math.max(0, Math.min(W - view.w, nx));
      view.y = Math.max(0, Math.min(H - view.h, ny));
      paintView();
    });
    function endV(e) { if (dragV) { dragV = null; try { e.stopPropagation(); } catch (er) { } } }
    handle.addEventListener('pointerup', endV);
    handle.addEventListener('pointercancel', endV);
  }

  /* ---------------- 画布尺寸 ---------------- */
  function resizeSystem() {
    [paperC, artC, grainC].forEach(function (c) { if (c) { c.width = W; c.height = H; } });
    pctx = paperC.getContext('2d'); actx = artC.getContext('2d'); gctx = grainC.getContext('2d');
    liveC = nc(W, H); liveCtx = liveC.getContext('2d');
    txC = nc(W, H); txCtx = txC.getContext('2d');
    frC = nc(W, H); frCtx = frC.getContext('2d');
    spC = nc(W, H); spCtx = spC.getContext('2d');
    hcC = nc(W, H); hcCtx = hcC.getContext('2d');
    beforeBuf = nc(W, H); beforeCtx = beforeBuf.getContext('2d');
  }
  function applySize(w, h, keep) {
    var old = [];
    if (keep) {
      layers.forEach(function (l) {
        var c = nc(w, h);
        c.getContext('2d').drawImage(l.ink, 0, 0, w, h);
        old.push({ l: l, c: c });
      });
    }
    W = w; H = h;
    resizeSystem();
    if (old.length) {
      old.forEach(function (o) {
        var c = nc(W, H);
        c.getContext('2d').drawImage(o.c, 0, 0, W, H);
        o.l.ink = c; o.l.ctx = c.getContext('2d'); o.l.tmp = null;
      });
    } else {
      layers.forEach(function (l) {
        var c = nc(W, H); l.ink = c; l.ctx = c.getContext('2d'); l.tmp = null;
      });
    }
    drawPaper();
    layoutView();
    structuralReset(keep ? '画布已按比例缩放，撤销记录已清空' : '画布尺寸已切换');
    composite(true);
    fitCanvas();
  }
  function fitCanvas() {
    var box = root.querySelector('.np-stage');
    if (!box) return;
    var availW = box.clientWidth, availH = box.clientHeight;
    var ratio = W / H;
    var w = availW, h = w / ratio;
    if (h > availH) { h = availH; w = h * ratio; }
    wrap.style.width = Math.floor(w) + 'px';
    wrap.style.height = Math.floor(h) + 'px';
    paintView();
  }

  /* ---------------- 合成 / 导出 ---------------- */
  function composeArt() {
    var c = nc(W, H), x = c.getContext('2d');
    x.drawImage(paperC, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.drawImage(artC, 0, 0);
    x.globalCompositeOperation = 'source-over';
    if (hasFilter()) { x.globalCompositeOperation = 'multiply'; x.drawImage(grainC, 0, 0); x.globalCompositeOperation = 'source-over'; }
    return c;
  }
  function artCanvas() {
    if (photoImg) {
      var c = nc(W, H), cx = c.getContext('2d');
      var iw = photoImg.naturalWidth, ih = photoImg.naturalHeight;
      var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
      cx.drawImage(photoImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      return c;
    }
    return composeArt();
  }
  function viewCanvas() {
    var src = artCanvas();
    var c = nc(Math.round(view.w), Math.round(view.h));
    c.getContext('2d').drawImage(src, Math.round(view.x), Math.round(view.y), Math.round(view.w), Math.round(view.h), 0, 0, c.width, c.height);
    return c;
  }
  function download(canvas, name, type) {
    var url = canvas.toDataURL(type || 'image/png');
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function stickCard() {
    var src = viewCanvas();
    var tw = 720, th = Math.round(tw * src.height / src.width);
    var t = nc(tw, th), tx = t.getContext('2d');
    tx.fillStyle = '#FFFFFF'; tx.fillRect(0, 0, tw, th);
    tx.drawImage(src, 0, 0, tw, th);
    var data = t.toDataURL('image/jpeg', .9);
    if (OPTS.onStick) OPTS.onStick(CUR_ID, data);
    toast('已设为这张通缉令的画像');
  }

  /* ---------------- 动效：线条抖动 + GIF ---------------- */
  var ANIM = { on: false, amp: 1.2, dens: 34, fps: 8, idx: 0, timer: 0, cache: [], sig: '' };
  function isArt(l) { return l.name.indexOf('印章') < 0; }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function warpLayer(src, frame, ampPx, dens) {
    var out = nc(W, H), o = out.getContext('2d');
    var cols = Math.max(4, Math.round(dens));
    var rows = Math.max(3, Math.round(dens * H / W));
    var cw = W / cols, ch = H / rows, pad = ampPx + 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var rnd = mulberry32((r * 1973 + c * 9277 + frame * 15486071) | 0);
        var dx = (rnd() - .5) * 2 * ampPx, dy = (rnd() - .5) * 2 * ampPx;
        var sx = c * cw, sy = r * ch;
        o.drawImage(src, sx - pad, sy - pad, cw + pad * 2, ch + pad * 2,
          sx + dx - pad, sy + dy - pad, cw + pad * 2, ch + pad * 2);
      }
    }
    return out;
  }
  function artFrame(i, ampPx, dens) {
    var c = nc(W, H), x = c.getContext('2d');
    for (var k = 0; k < layers.length; k++) {
      var l = layers[k];
      if (!l.visible) continue;
      var src = isArt(l) ? warpLayer(l.ink, i, ampPx, dens) : l.ink;
      x.globalCompositeOperation = l.mode === 'multiply' ? 'multiply' : 'source-over';
      x.drawImage(src, 0, 0);
      x.globalCompositeOperation = 'source-over';
      drawObjects(x, l.objects);
    }
    return c;
  }
  function animSig() {
    return [W, H, ANIM.amp, ANIM.dens, paperKind, layers.length,
      layers.map(function (l) { return l.visible ? 1 : 0; }).join('')].join('|');
  }
  function animFrames() {
    var sig = animSig();
    if (ANIM.sig !== sig || ANIM.cache.length !== 4) {
      ANIM.cache = [];
      var ampPx = ANIM.amp * (W / 1000);
      for (var i = 0; i < 4; i++) ANIM.cache.push(artFrame(i, ampPx, ANIM.dens));
      ANIM.sig = sig;
    }
    return ANIM.cache;
  }
  function animShow(i) {
    var f = animFrames()[i];
    if (!f) return;
    actx.clearRect(0, 0, W, H);
    actx.drawImage(f, 0, 0);
  }
  function animPlay() {
    if (ANIM.on) { animStop(); return; }
    ANIM.on = true;
    animShow(0);
    root.querySelector('#npAnimPlay').textContent = '停止';
    var last = 0;
    function loop(t) {
      if (!ANIM.on) return;
      if (t - last >= 1000 / ANIM.fps) {
        last = t; ANIM.idx = (ANIM.idx + 1) % 4;
        animShow(ANIM.idx);
      }
      ANIM.timer = requestAnimationFrame(loop);
    }
    ANIM.timer = requestAnimationFrame(loop);
  }
  function animStop() {
    ANIM.on = false;
    if (ANIM.timer) cancelAnimationFrame(ANIM.timer);
    ANIM.timer = 0;
    var btn = root.querySelector('#npAnimPlay');
    if (btn) btn.textContent = '预览';
    composite(true);
  }
  function composeAnim(i, outW) {
    var art = artFrame(i, ANIM.amp * (W / 1000), ANIM.dens);
    var c = nc(outW, Math.round(outW * H / W)), x = c.getContext('2d');
    x.drawImage(paperC, 0, 0, c.width, c.height);
    x.globalCompositeOperation = 'multiply';
    x.drawImage(art, 0, 0, c.width, c.height);
    if (hasFilter()) x.drawImage(grainC, 0, 0, c.width, c.height);
    x.globalCompositeOperation = 'source-over';
    return c;
  }

  /* --- GIF 编码 --- */
  function buildPalette(frames) {
    var hist = new Map();
    frames.forEach(function (f) {
      var d = f.data;
      for (var i = 0; i < d.length; i += 16) {
        var r = d[i], g = d[i + 1], b = d[i + 2];
        var key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
        var e = hist.get(key);
        if (e) { e[0]++; e[1] += r; e[2] += g; e[3] += b; }
        else hist.set(key, [1, r, g, b]);
      }
    });
    var items = [];
    hist.forEach(function (v) { items.push({ n: v[0], r: v[1] / v[0], g: v[2] / v[0], b: v[3] / v[0] }); });
    var boxes = [items];
    while (boxes.length < 256) {
      var bi = -1, bs = -1, bw = 0;
      for (var i = 0; i < boxes.length; i++) {
        var bx = boxes[i];
        if (bx.length < 2) continue;
        var mr = 255, xr = 0, mg = 255, xg = 0, mb = 255, xb = 0;
        for (var j = 0; j < bx.length; j++) {
          var e = bx[j];
          if (e.r < mr) mr = e.r; if (e.r > xr) xr = e.r;
          if (e.g < mg) mg = e.g; if (e.g > xg) xg = e.g;
          if (e.b < mb) mb = e.b; if (e.b > xb) xb = e.b;
        }
        var w = Math.max(xr - mr, xg - mg, xb - mb);
        var score = w * Math.log(bx.length + 1);
        if (score > bs) { bs = score; bi = i; bw = w; }
      }
      if (bi < 0) break;
      var box = boxes[bi], ch = 'r', rng = 0;
      ['r', 'g', 'b'].forEach(function (k) {
        var mn = 1e9, mx = -1e9;
        box.forEach(function (e) { if (e[k] < mn) mn = e[k]; if (e[k] > mx) mx = e[k]; });
        if (mx - mn > rng) { rng = mx - mn; ch = k; }
      });
      box.sort(function (a, b) { return a[ch] - b[ch]; });
      var mid = box.length >> 1;
      boxes.splice(bi, 1, box.slice(0, mid), box.slice(mid));
    }
    return boxes.map(function (b) {
      var r = 0, g = 0, bb = 0, n = 0;
      b.forEach(function (e) { r += e.r * e.n; g += e.g * e.n; bb += e.b * e.n; n += e.n; });
      n = n || 1;
      return [Math.round(r / n), Math.round(g / n), Math.round(bb / n)];
    });
  }
  function nearest(pal, r, g, b) {
    var best = 0, bd = 1e9;
    for (var i = 0; i < pal.length; i++) {
      var p = pal[i];
      var d = (p[0] - r) * (p[0] - r) * 3 + (p[1] - g) * (p[1] - g) * 4 + (p[2] - b) * (p[2] - b) * 2;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  function mapFrame(f, pal) {
    var d = f.data, n = f.width * f.height, out = new Uint8Array(n), cache = {};
    for (var i = 0, p = 0; i < n; i++, p += 4) {
      var r = d[p], g = d[p + 1], b = d[p + 2];
      var k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      var v = cache[k];
      if (v === undefined) { v = nearest(pal, r, g, b); cache[k] = v; }
      out[i] = v;
    }
    return out;
  }
  function lzwEncode(px, minCode) {
    var clear = 1 << minCode, eoi = clear + 1;
    var out = [], cur = 0, bits = 0, codeSize = minCode + 1, next = eoi + 1;
    var dict = {};
    function emit(code) {
      cur |= code << bits; bits += codeSize;
      while (bits >= 8) { out.push(cur & 255); cur >>>= 8; bits -= 8; }
    }
    emit(clear);
    var ent = px[0];
    for (var i = 1; i < px.length; i++) {
      var c = px[i], key = ent + ',' + c;
      var got = dict[key];
      if (got !== undefined) { ent = got; continue; }
      emit(ent);
      if (next < 4096) {
        dict[key] = next++;
        if (next > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        emit(clear);
        dict = {}; next = eoi + 1; codeSize = minCode + 1;
      }
      ent = c;
    }
    emit(ent); emit(eoi);
    if (bits > 0) out.push(cur & 255);
    return out;
  }
  function gifBytes(frames, w, h, delayCs) {
    var pal = buildPalette(frames);
    var b = [], push = function () { for (var i = 0; i < arguments.length; i++) b.push(arguments[i] & 255); };
    push(71, 73, 70, 56, 57, 97);
    push(w & 255, w >> 8 & 255, h & 255, h >> 8 & 255, 0xF7, 0, 0);
    for (var i = 0; i < 256; i++) {
      var c = pal[i] || [18, 20, 28];
      push(c[0], c[1], c[2]);
    }
    push(0x21, 0xFF, 0x0B);
    'NETSCAPE2.0'.split('').forEach(function (ch) { push(ch.charCodeAt(0)); });
    push(3, 1, 0, 0, 0);
    frames.forEach(function (f) {
      push(0x21, 0xF9, 0x04, 0x04, delayCs & 255, delayCs >> 8 & 255, 0, 0);
      push(0x2C, 0, 0, 0, 0, w & 255, w >> 8 & 255, h & 255, h >> 8 & 255, 0);
      var idx = mapFrame(f, pal), data = lzwEncode(idx, 8);
      push(8);
      for (var p = 0; p < data.length; p += 255) {
        var n = Math.min(255, data.length - p);
        push(n);
        for (var k = 0; k < n; k++) push(data[p + k]);
      }
      push(0);
    });
    push(0x3B);
    return new Uint8Array(b);
  }
  function exportGif() {
    toast('正在生成 GIF…');
    setTimeout(function () {
      try {
        var w = 560, frames = [];
        for (var i = 0; i < 4; i++) {
          var c = composeAnim(i, w);
          frames.push(c.getContext('2d').getImageData(0, 0, c.width, c.height));
        }
        var bytes = gifBytes(frames, frames[0].width, frames[0].height, Math.max(4, Math.round(100 / ANIM.fps)));
        var blob = new Blob([bytes], { type: 'image/gif' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = '通缉画像-抖动.gif';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast('GIF 已生成（4 帧 · ' + ANIM.fps + ' 帧/秒）');
      } catch (e) { toast('生成失败：' + (e && e.message ? e.message : '未知错误')); }
    }, 60);
  }
  function exportStatic() {
    var c = composeAnim(0, W);
    download(c, '通缉画像.jpg', 'image/jpeg');
    toast('静态图已保存');
  }

  /* ---------------- 存档（4 个位，IndexedDB） ---------------- */
  var DB_NAME = 'ndt-pad-db', DB_STORE = 'slots', dbCache = null, memStore = {}, slotMeta = {};

  function withDB(fn, fail) {
    if (dbCache) return fn(dbCache);
    var done = false;
    try {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { if (done) return; done = true; dbCache = req.result; fn(dbCache); };
      req.onerror = function () { if (done) return; done = true; if (fail) fail(); };
      req.onblocked = function () { if (fail) fail(); };
    } catch (e) { if (fail) fail(); }
  }
  function idbPut(id, data, ok) {
    withDB(function (db) {
      try {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put({ id: id, data: data });
        tx.oncomplete = function () { if (ok) ok(true); };
        tx.onerror = function () { if (ok) ok(false); };
      } catch (e) { if (ok) ok(false); }
    }, function () { memStore[id] = data; if (ok) ok(true); });
  }
  function idbGet(id, cb) {
    withDB(function (db) {
      try {
        var tx = db.transaction(DB_STORE, 'readonly'), r = tx.objectStore(DB_STORE).get(id);
        r.onsuccess = function () { cb(r.result ? r.result.data : null); };
        r.onerror = function () { cb(memStore[id] || null); };
      } catch (e) { cb(memStore[id] || null); }
    }, function () { cb(memStore[id] || null); });
  }
  function idbDel(id, ok) {
    withDB(function (db) {
      try {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).delete(id);
        tx.oncomplete = function () { delete memStore[id]; if (ok) ok(); };
      } catch (e) { delete memStore[id]; if (ok) ok(); }
    }, function () { delete memStore[id]; if (ok) ok(); });
  }

  function imgURL(img) {
    if (img.toDataURL) { try { return img.toDataURL('image/png'); } catch (e) { } }
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    var c = nc(w, h);
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/png');
  }
  function thumbURL() {
    var v = viewCanvas();
    var t = nc(128, Math.round(128 * v.height / v.width));
    var x = t.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, t.width, t.height);
    x.drawImage(v, 0, 0, t.width, t.height);
    return t.toDataURL('image/jpeg', .72);
  }
  function serialize() {
    return {
      ts: Date.now(), w: W, h: H, paper: paperKind, active: active,
      view: { x: view.x, y: view.y, w: view.w, h: view.h },
      thumb: thumbURL(),
      layers: layers.map(function (l) {
        return {
          name: l.name, mode: l.mode, visible: l.visible, locked: l.locked,
          ink: l.ink.toDataURL('image/png'),
          objs: l.objects.map(function (o) { return { x: o.x, y: o.y, w: o.w, rot: o.rot, img: imgURL(o.img) }; })
        };
      })
    };
  }
  function saveTo(id, cb) {
    var data;
    try { data = serialize(); } catch (e) { if (cb) cb(false); return; }
    idbPut(id, data, function (ok) {
      slotMeta[id] = { ts: data.ts, w: data.w, h: data.h, thumb: data.thumb };
      if (cb) cb(ok);
    });
  }
  function restoreState(st, done) {
    if (!st || !st.layers) return;
    W = st.w || W; H = st.h || H;
    paperKind = st.paper || 'pure';
    view = st.view || view;
    resizeSystem();
    var newLayers = st.layers.map(function (l) {
      var c = nc(W, H);
      return {
        id: ++uid, name: l.name || '图层', ink: c, ctx: c.getContext('2d'),
        objects: [], mode: l.mode || 'multiply',
        visible: l.visible !== false, locked: !!l.locked
      };
    });
    layers = newLayers;
    var pending = newLayers.length;
    var objPending = 0;
    newLayers.forEach(function (l, i) {
      var src = st.layers[i];
      var im = new Image();
      im.onload = function () { l.ctx.drawImage(im, 0, 0, W, H); tick(); };
      im.onerror = tick;
      im.src = src.ink;
      (src.objs || []).forEach(function (o) {
        objPending++; pending++;
        var oi = new Image();
        oi.onload = function () {
          l.objects.push({ img: oi, x: o.x, y: o.y, w: o.w, rot: o.rot, layer: l });
          tick();
        };
        oi.onerror = tick;
        oi.src = o.img;
      });
    });
    function tick() {
      if (--pending > 0) return;
      active = Math.min(st.active || 0, layers.length - 1);
      drawPaper(); layoutView(); renderLayers(); structuralReset(); composite(true);
      requestAnimationFrame(function () { fitCanvas(); });
      if (done) done();
    }
    if (pending === 0) tick();
  }

  /* ---------------- META ---------------- */
  function setMeta(m) {
    if (!m || typeof m !== 'object') return;
    Object.keys(m).forEach(function (k) {
      var v = m[k];
      if (v !== undefined && v !== null && String(v) !== '') META[k] = String(v);
    });
    root.querySelector('#npTitleName').textContent = String(META.name || '').replace(/\s+/g, ' ').trim();
  }

  /* ---------------- UI ---------------- */
  var UI = '' +
    '<div class="np-panel">' +
    '<div class="np-head">' +
    '<h3>绘制通缉画像 · <span id="npTitleName">吕良</span></h3>' +
    '<span class="sp"></span>' +
    '<div class="np-row" id="npSizes"></div>' +
    '<div class="np-row" id="npPapers"></div>' +
    '<button class="np-slotbtn" id="npAnimOpen">动效</button>' +
    '<button class="np-slotbtn" id="npSaveOpen">存档</button>' +
    '<button class="np-close" id="npClose">关闭</button>' +
    '</div>' +
    '<div class="np-body">' +
    '<div class="np-stage"><div class="np-cwrap" id="npWrap">' +
    '<canvas id="npPaper"></canvas><canvas id="npArt" class="np-art"></canvas>' +
    '<canvas id="npGrain" class="np-grain"></canvas>' +
    '<div class="np-view" id="npView"><button class="np-vh" id="npViewHandle">拖动</button></div>' +
    '</div></div>' +
    '<div class="np-side">' +
    '<div class="np-row"><span class="np-lbl">笔</span><div class="np-brushes" id="npBrushes"></div></div>' +
    '<div class="np-row"><span class="np-lbl">粗细</span>' +
    '<input type="range" class="np-range" id="npSize" min="1" max="140" step="1" value="4">' +
    '<code class="np-num" id="npSizeNum">4</code>' +
    '<label class="np-toggle"><input type="checkbox" id="npPressure" checked>压感</label></div>' +
    '<div class="np-row"><span class="np-lbl">色</span><div class="np-row" id="npSwatches"></div>' +
    '<button class="np-pick" title="RGB 自选"><input type="color" id="npColor" value="#241C12"></button>' +
    '<code class="np-num" id="npHex" style="font-size:10.5px;color:#8A93A3;min-width:auto">#241C12</code></div>' +
    '<div class="np-row"><span class="np-lbl">印章</span><div class="np-row np-stamp" id="npStamps"></div>' +
    '<button class="np-imp" id="npImport">＋ 贴纸</button>' +
    '<button class="np-imp" id="npPhoto">＋ 传照片</button></div>' +
    '<div class="np-sel" id="npSel"><span class="np-tip">已选贴纸</span>' +
    '<input type="range" id="npStkSize" min="40" max="600" value="150">' +
    '<input type="range" id="npStkRot" min="-180" max="180" value="-8">' +
    '<button class="np-mini" id="npStkDel">删除</button><button class="np-mini" id="npStkDone">完成</button></div>' +
    '<div class="np-acts">' +
    '<button class="np-btn" id="npUndo" disabled>上一步</button>' +
    '<button class="np-btn" id="npRedo" disabled>下一步</button>' +
    '<button class="np-btn" id="npClear">清空本层</button></div>' +
    '<div class="np-acts">' +
    '<button class="np-btn primary" id="npStick">设为卡片画像</button>' +
    '<button class="np-btn" id="npSaveArt">保存通缉照</button>' +
    '<button class="np-btn" id="npShare">分享</button></div>' +
    '<div class="np-layers"><div class="np-lhead"><b>图层</b>' +
    '<span class="tip" style="font-size:10.5px;color:#A6ADBA">点行切换 · ◉ 隐藏 · 锁</span>' +
    '<div class="ops"><button id="npUp">↑</button><button id="npDown">↓</button>' +
    '<button id="npAdd">＋</button><button id="npMerge">合并</button><button id="npDel">删除</button></div></div>' +
    '<div id="npLayerList"></div></div>' +
    '<div class="np-tip">凑近看颗粒：包浆感来自笔刷本身。取景框内的部分才会进卡片。</div>' +
    '</div></div>' +
    /* 动效面板 */
    '<div class="np-save" id="npAnim"><div class="np-savebox"><h4>线条抖动 · GIF</h4>' +
    '<p>只动画像，纸和印章不动。三个参数都能调，改完点「预览」立刻看效果。</p>' +
    '<div class="np-opt"><span>大小</span><input type="range" id="npAmp" min="0.4" max="3" step="0.1" value="1.2">' +
    '<em id="npAmpV">1.2</em></div>' +
    '<div class="np-opt"><span>密度</span><input type="range" id="npDens" min="12" max="60" step="1" value="34">' +
    '<em id="npDensV">34</em></div>' +
    '<div class="np-opt"><span>速度</span><input type="range" id="npFps" min="4" max="12" step="1" value="8">' +
    '<em id="npFpsV">8 帧/秒</em></div>' +
    '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
    '<button class="np-btn" id="npAnimPlay">预览</button>' +
    '<button class="np-btn" id="npAnimGif">导出 GIF</button>' +
    '<button class="np-btn" id="npAnimJpg">导出静态图</button>' +
    '<button class="np-btn" id="npAnimShut">收起</button></div>' +
    '<p style="margin:10px 0 0;font-size:11px">大小＝线条抖开的幅度，密度＝抖动的碎块数量，速度＝每秒切几帧。GIF 固定 4 帧循环，宽 560。</p>' +
    '</div></div>' +
    '<div class="np-save" id="npSave"><div class="np-savebox"><h4>存档位</h4>' +
    '<p>四个位置，像 PS 一样存本机：可以保存、覆盖，也可以点开继续改。关闭时还会自动留一份草稿。</p>' +
    '<div id="npSlotList"></div>' +
    '<div style="display:flex;gap:8px;margin-top:10px"><button class="np-btn" id="npSaveShut">收起</button></div>' +
    '</div></div>' +
    '<div class="np-confirm" id="npConfirm"><div class="np-cbox">' +
    '<b id="npCfTitle">要关闭画板吗？</b><p id="npCfText"></p>' +
    '<div class="row"><button class="np-btn" id="npCfNo">继续画</button>' +
    '<button class="np-btn np-danger" id="npCfYes">关闭</button></div></div></div>' +
    '</div>';

  function buildUI() {
    root = el('div');
    root.id = 'ndtpad';
    root.innerHTML = UI;
    document.body.appendChild(root);

    wrap = root.querySelector('#npWrap');
    paperC = root.querySelector('#npPaper'); artC = root.querySelector('#npArt'); grainC = root.querySelector('#npGrain');
    pctx = paperC.getContext('2d'); actx = artC.getContext('2d'); gctx = grainC.getContext('2d');
    viewBox = root.querySelector('#npView');
    [paperC, artC, grainC].forEach(function (c) { c.width = W; c.height = H; });

    // 尺寸档位
    var sizesWrap = root.querySelector('#npSizes');
    PRESETS.forEach(function (p, i) {
      var b = el('button', 'np-mini' + (i === 0 ? ' on' : ''), p.label + ' ' + p.w + '×' + p.h);
      b.onclick = function () {
        [].forEach.call(sizesWrap.children, function (x) { x.classList.toggle('on', x === b); });
        applySize(p.w, p.h, true);
      };
      sizesWrap.appendChild(b);
    });

    // 纸
    var papersWrap = root.querySelector('#npPapers');
    [['pure', '纯白'], ['white', '素白'], ['note', '笔记本'], ['kraft', '牛皮纸']].forEach(function (pp, i) {
      var b = el('button', 'np-mini' + (i === 0 ? ' on' : ''), pp[1]);
      b.onclick = function () {
        [].forEach.call(papersWrap.children, function (x) { x.classList.toggle('on', x === b); });
        paperKind = pp[0]; drawPaper(); composite(true);
      };
      papersWrap.appendChild(b);
    });

    // 笔
    var bw = root.querySelector('#npBrushes');
    Object.keys(BRUSHES).forEach(function (k, i) {
      var b = el('button', 'np-chip' + (i === 0 ? ' on' : ''), BRUSHES[k].label);
      b.onclick = function () {
        brush = k;
        [].forEach.call(bw.children, function (x) { x.classList.toggle('on', x === b); });
        syncSize();
      };
      bw.appendChild(b);
    });

    // 颜色
    var sw = root.querySelector('#npSwatches');
    PRESET_COLORS.forEach(function (c, i) {
      var b = el('button', 'np-sw' + (i === 0 ? ' on' : ''));
      b.style.background = c;
      b.onclick = function () { setColor(c, b); };
      sw.appendChild(b);
    });
    root.querySelector('#npColor').oninput = function (e) { setColor(e.target.value, null); };
    root.querySelector('#npPressure').onchange = function (e) { usePressure = e.target.checked; };

    // 印章 + 贴纸 + 照片
    var stamps = root.querySelector('#npStamps');
    (function () {
      var b = el('button', 'np-chip');
      b.title = '盖到当前图层';
      var sm = nc(64, 64), sx = sm.getContext('2d');
      sx.drawImage(getSeal(), 0, 0, 64, 64);
      b.appendChild(sm);
      b.onclick = function () { addSticker(getSeal(), Math.round(W * .28), -6); };
      stamps.appendChild(b);
    })();
    var fileInput = el('input'); fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
    root.appendChild(fileInput);
    root.querySelector('#npImport').onclick = function () { fileInput.click(); };
    fileInput.onchange = function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () { addSticker(img, Math.round(W * .26), -4); };
        img.src = fr.result;
      };
      fr.readAsDataURL(f); fileInput.value = '';
    };
    var photoInput = el('input'); photoInput.type = 'file'; photoInput.accept = 'image/*'; photoInput.style.display = 'none';
    root.appendChild(photoInput);
    root.querySelector('#npPhoto').onclick = function () { photoInput.click(); };
    photoInput.onchange = function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () { photoImg = img; composite(true); toast('已换成上传的照片'); };
        img.src = fr.result;
      };
      fr.readAsDataURL(f); photoInput.value = '';
    };

    // 贴纸面板
    root.querySelector('#npStkSize').oninput = function (e) { if (selObj) { selObj.w = parseFloat(e.target.value); composite(true); } };
    root.querySelector('#npStkRot').oninput = function (e) { if (selObj) { selObj.rot = parseFloat(e.target.value); composite(true); } };
    root.querySelector('#npStkDel').onclick = function () {
      if (!selObj) return;
      var l = selObj.layer, before = l.objects.slice();
      var i = l.objects.indexOf(selObj); if (i >= 0) l.objects.splice(i, 1);
      selObj = null; syncSel(); composite(true);
      pushOp({ kind: 'objs', layer: l, before: before, after: l.objects.slice(), bytes: 4 });
    };
    root.querySelector('#npStkDone').onclick = function () { selObj = null; syncSel(); composite(true); };

    // 动作
    root.querySelector('#npUndo').onclick = undo;
    root.querySelector('#npRedo').onclick = redo;
    root.querySelector('#npClear').onclick = function () {
      var l = activeLayer(); if (!l) return;
      if (l.locked) return toast('当前图层已锁定');
      var snap = nc(W, H); snap.getContext('2d').drawImage(l.ink, 0, 0);
      l.ctx.clearRect(0, 0, W, H); composite(true);
      pushOp({ kind: 'full', layer: l, before: snap, after: null, bytes: bytesOf(snap) });
      toast('已清空本层笔迹，印章保留');
    };
    root.querySelector('#npStick').onclick = stickCard;
    root.querySelector('#npSaveArt').onclick = function () {
      download(viewCanvas(), '哪都通-通缉照-' + String(META.name || '').replace(/\s/g, '') + '.png', 'image/png');
      toast('已保存单张通缉照');
      if (OPTS.onSaved) OPTS.onSaved('art');
    };
    root.querySelector('#npShare').onclick = function () {
      viewCanvas().toBlob(function (blob) {
        var file = new File([blob], '哪都通-通缉照.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: '哪都通 · 在逃通缉', text: '异人内网 · 通缉画像' }).catch(function () { });
        } else {
          download(viewCanvas(), '哪都通-通缉照.png', 'image/png');
          toast('当前环境不支持直接分享，已保存图片');
        }
      }, 'image/png');
    };
    root.querySelector('#npClose').onclick = function () {
      askConfirm('要关闭画板吗？', '关闭前会把当前进度自动存一份草稿，下次点开「画通缉像」能接着画。四个存档位里的内容不受影响。',
        '关闭', '继续画', function () { doClose(); });
    };

    /* ---- 存档位 ---- */
    root.querySelector('#npAnimOpen').onclick = function () {
      root.querySelector('#npAnim').classList.add('on');
    };
    root.querySelector('#npSaveOpen').onclick = function () { openSavePanel(); };
    root.querySelector('#npAnimShut').onclick = function () {
      root.querySelector('#npAnim').classList.remove('on');
    };
    root.querySelector('#npAnim').addEventListener('click', function (e) {
      if (e.target && e.target.id === 'npAnim') {
        root.querySelector('#npAnim').classList.remove('on');
      }
    });
    root.querySelector('#npAmp').oninput = function (e) {
      ANIM.amp = parseFloat(e.target.value);
      root.querySelector('#npAmpV').textContent = ANIM.amp.toFixed(1);
      ANIM.sig = '';
      if (ANIM.on) animShow(ANIM.idx);
    };
    root.querySelector('#npDens').oninput = function (e) {
      ANIM.dens = parseInt(e.target.value, 10);
      root.querySelector('#npDensV').textContent = ANIM.dens;
      ANIM.sig = '';
      if (ANIM.on) animShow(ANIM.idx);
    };
    root.querySelector('#npFps').oninput = function (e) {
      ANIM.fps = parseInt(e.target.value, 10);
      root.querySelector('#npFpsV').textContent = ANIM.fps + ' 帧/秒';
    };
    root.querySelector('#npAnimPlay').onclick = function () { animPlay(); };
    root.querySelector('#npAnimGif').onclick = function () { exportGif(); };
    root.querySelector('#npAnimJpg').onclick = function () { exportStatic(); };
    root.querySelector('#npCfYes').onclick = function () {
      var cb = cfCb; closeConfirm();
      if (cb && cb.yes) cb.yes();
    };
    root.querySelector('#npCfNo').onclick = function () {
      var cb = cfCb; closeConfirm();
      if (cb && cb.no) cb.no();
    };
    root.querySelector('#npSaveShut').onclick = function () { root.querySelector('#npSave').classList.remove('on'); };
    root.querySelector('#npSave').addEventListener('click', function (e) {
      if (e.target && e.target.id === 'npSave') root.querySelector('#npSave').classList.remove('on');
    });

    // 图层
    root.querySelector('#npAdd').onclick = function () {
      layers.push(newLayer('图层 ' + (layers.length + 1))); active = layers.length - 1;
      renderLayers(); composite(true); structuralReset('已新建图层，撤销记录重置');
    };
    root.querySelector('#npUp').onclick = function () {
      if (active >= layers.length - 1) return toast('已经在最上层了');
      var a = layers[active], b = layers[active + 1];
      layers[active] = b; layers[active + 1] = a; active++;
      renderLayers(); composite(true); structuralReset('图层顺序已调整');
    };
    root.querySelector('#npDown').onclick = function () {
      if (active <= 0) return toast('已经在最下层了');
      var a = layers[active], b = layers[active - 1];
      layers[active] = b; layers[active - 1] = a; active--;
      renderLayers(); composite(true); structuralReset('图层顺序已调整');
    };
    root.querySelector('#npDel').onclick = function () {
      if (layers.length <= 1) return toast('至少留一个图层');
      layers.splice(active, 1); active = Math.min(active, layers.length - 1);
      renderLayers(); composite(true); structuralReset('已删除图层，撤销记录重置');
    };
    root.querySelector('#npMerge').onclick = function () {
      if (active < 1) return toast('最底层没有可合并的对象');
      var up = layers[active], dn = layers[active - 1];
      var t = nc(W, H), tc = t.getContext('2d');
      tc.drawImage(up.ink, 0, 0); drawObjects(tc, up.objects);
      dn.ctx.save();
      dn.ctx.globalCompositeOperation = up.mode === 'multiply' ? 'multiply' : 'source-over';
      dn.ctx.drawImage(t, 0, 0);
      dn.ctx.restore();
      dn.objects.length = 0;
      layers.splice(active, 1); active = active - 1;
      renderLayers(); composite(true); structuralReset('已合并到「' + dn.name + '」');
    };

    bindPointer(); bindView();
    window.addEventListener('resize', function () { fitCanvas(); paintView(); });
  }

  function setColor(c, btn) {
    color = c;
    root.querySelector('#npHex').textContent = c.toUpperCase();
    root.querySelector('#npColor').value = c;
    [].forEach.call(root.querySelector('#npSwatches').children, function (x) { x.classList.toggle('on', x === btn); });
  }
  function syncSize() {
    var s = curSize();
    root.querySelector('#npSize').value = s;
    root.querySelector('#npSizeNum').textContent = s;
    // 每支笔的尺寸范围不同
    var r = root.querySelector('#npSize');
    r.max = (brush === 'eraser' || brush === 'air' || brush === 'airErase') ? 140 : 60;
  }

  /* ---------------- 确认弹窗 / 存档 UI ---------------- */
  var cfCb = null;
  function askConfirm(title, text, yesLabel, noLabel, onYes, onNo) {
    var c = root.querySelector('#npConfirm');
    root.querySelector('#npCfTitle').textContent = title;
    root.querySelector('#npCfText').textContent = text;
    var y = root.querySelector('#npCfYes'), n = root.querySelector('#npCfNo');
    y.textContent = yesLabel || '确定';
    n.textContent = noLabel || '取消';
    cfCb = { yes: onYes, no: onNo };
    c.classList.add('on');
  }
  function closeConfirm() {
    var c = root.querySelector('#npConfirm');
    c.classList.remove('on');
    cfCb = null;
  }
  function doClose() {
    // 关掉前静默存草稿
    try { saveTo(0); } catch (e) { }
    root.classList.remove('on');
    document.documentElement.style.overflow = '';
    if (OPTS.onClose) OPTS.onClose();
  }
  function fmtTs(ts) {
    var d = new Date(ts);
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return (d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function openSavePanel() {
    root.querySelector('#npSave').classList.add('on');
    var list = root.querySelector('#npSlotList');
    list.innerHTML = '<div style="font-size:11.5px;color:#8A93A3;padding:6px 0">读取中…</div>';
    var got = 0, metas = {};
    for (var i = 1; i <= 4; i++) {
      (function (i) {
        idbGet(i, function (data) {
          metas[i] = data;
          if (++got === 4) renderSlots(metas);
        });
      })(i);
    }
  }
  function renderSlots(metas) {
    var list = root.querySelector('#npSlotList');
    list.innerHTML = '';
    for (var i = 1; i <= 4; i++) {
      (function (i) {
        var d = metas[i];
        var card = el('div', 'np-slot');
        var th = el('div', 'th');
        if (d && d.thumb) {
          var im = el('img'); im.src = d.thumb; th.appendChild(im);
        } else th.textContent = '空';
        var meta = el('div', 'meta');
        var name = el('b', null, '存档 ' + i);
        var info = el('span', null, d ? (d.w + '×' + d.h + ' · ' + fmtTs(d.ts)) : '还没有内容');
        meta.appendChild(name); meta.appendChild(info);
        var ops = el('div', 'ops');
        var bSave = el('button', 'np-mini', d ? '覆盖' : '存到这里');
        bSave.onclick = function () {
          bSave.disabled = true; bSave.textContent = '保存中…';
          saveTo(i, function (ok) {
            if (!ok) { toast('存不下，可能是空间满了'); openSavePanel(); return; }
            toast(d ? ('已覆盖存档 ' + i) : ('已存到存档 ' + i));
            openSavePanel();
          });
        };
        ops.appendChild(bSave);
        if (d) {
          var bOpen = el('button', 'np-mini', '打开修改');
          bOpen.onclick = function () {
            idbGet(i, function (data) {
              if (!data) return toast('这个存档读不出来');
              restoreState(data, function () {
                root.querySelector('#npSave').classList.remove('on');
                toast('已打开存档 ' + i + '，可以继续改');
              });
            });
          };
          ops.appendChild(bOpen);
          var bDel = el('button', 'np-mini', '删除');
          bDel.onclick = function () {
            askConfirm('删除存档 ' + i + '？', '删掉就找不回来了，当前画布不受影响。', '删除', '留着', function () {
              idbDel(i, function () { toast('已删除存档 ' + i); openSavePanel(); });
            });
          };
          ops.appendChild(bDel);
        }
        card.appendChild(th); card.appendChild(meta); card.appendChild(ops);
        list.appendChild(card);
      })(i);
    }
  }

  /* ---------------- 对外 API ---------------- */
  var NDTPad = {
    open: function (opts) {
      OPTS = opts || {};
      CUR_ID = OPTS.id || '';
      injectCSS();
      if (!root) {
        buildUI();
        resizeSystem();
        root.querySelector('#npSize').oninput = function (e) {
          SIZES[brush] = parseFloat(e.target.value);
          root.querySelector('#npSizeNum').textContent = SIZES[brush];
        };
        drawPaper();
        layers = [newLayer('画像线稿'), newLayer('印章')];
        active = 0;
        renderLayers(); composite(true);
        layoutView();
      }
      setMeta(OPTS.meta || {});
      root.classList.add('on');
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(function () {
        fitCanvas(); paintView(); syncSize(); syncUndo();
      });
      // 第一次打开：如果上次留了草稿，问一句要不要接着画
      if (!draftAsked) {
        draftAsked = true;
        idbGet(0, function (d) {
          if (!d || !d.layers || !d.layers.length) return;
          askConfirm('接着上次的画？', '上次关闭时自动存了一份草稿（' + fmtTs(d.ts) + '），可以直接恢复继续改。',
            '接着画', '新建空白', function () {
              restoreState(d, function () { toast('已恢复上次的画'); });
            });
        });
      }
    },
    close: function () {
      if (!root) return;
      root.classList.remove('on');
      document.documentElement.style.overflow = '';
      if (OPTS.onClose) OPTS.onClose();
    },
    isOpen: function () { return !!root && root.classList.contains('on'); },
    setMeta: function (m) { if (root) setMeta(m); },
    _animState: function () { return { on: ANIM.on, idx: ANIM.idx, amp: ANIM.amp, dens: ANIM.dens, fps: ANIM.fps }; },
    _debug: function (w) {
      var c = composeAnim(0, w || 480);
      var d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      var dark = 0;
      for (var k = 0; k < d.length; k += 4) if (d[k] < 128) dark++;
      return {
        size: c.width + 'x' + c.height, dark: dark, total: d.length / 4,
        layers: layers.map(function (l) { return l.name + ':' + (l.visible ? 'v' : 'h') + ':' + l.ink.width; }),
        anim: { amp: ANIM.amp, dens: ANIM.dens, fps: ANIM.fps }
      };
    }
  };
  window.NDTPad = NDTPad;
})();
