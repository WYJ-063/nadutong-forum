/* 哪都通 · 四柱八字（签卜命理新板块）
 *
 * 接入方式（不改 app.js）：
 *   · 侧栏注入一个常驻的「四柱八字」项，排在「抽签问吉」后面；
 *   · 监听 hashchange，命中 #/bazi 时只替换 #app 里的 .p-main 内容，保留原有侧栏；
 *   · 所有排盘都由 bazi-core.js 负责，这里只管表单、渲染和交互。
 *
 * 为什么侧栏项必须"常驻、不随登录增减"：手机端 .sidebar 是一条横滑条，
 * 容器内容一变浏览器就把 scrollLeft 拉回 0，手指往右划会立刻弹回最左，
 * 看着就是「划不动 / 左右抖」。项数固定 = 这个来源不存在。
 */
(function () {
  'use strict';

  if (window.__ndtBaziLoaded) { return; }
  window.__ndtBaziLoaded = true;

  var HASH = '#/bazi';
  var ITEM_KEY = 'data-ndt-bazi';
  var STYLE_ID = 'ndt-bazi-style';

  /* ---------- 工具 ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function isBaziPage() {
    return location.hash.indexOf(HASH) === 0;
  }

  /* ---------- 样式 ---------- */

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) { return; }
    var css = ''
      + '#ndt-bazi{--bazi-gold:#B98B3E;--bazi-ink:#2A2E45;--bazi-paper:#FBF7EF;}'
      + '#ndt-bazi .bz-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}'
      + '#ndt-bazi .bz-head h2{margin:0;font-size:22px;letter-spacing:2px}'
      + '#ndt-bazi .bz-sub{color:#8A90A8;font-size:13px}'
      + '#ndt-bazi .bz-form{margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}'
      + '#ndt-bazi .bz-field{display:flex;flex-direction:column;gap:5px}'
      + '#ndt-bazi .bz-field label{font-size:12px;color:#7A8098;letter-spacing:1px}'
      + '#ndt-bazi .bz-field input,#ndt-bazi .bz-field select{padding:9px 10px;border:1px solid #E3E7F0;border-radius:8px;'
      + 'background:#fff;font-size:14px;color:#2A2E45;outline:none}'
      + '#ndt-bazi .bz-field input:focus,#ndt-bazi .bz-field select:focus{border-color:#B98B3E}'
      + '#ndt-bazi .bz-actions{margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}'
      + '#ndt-bazi .bz-btn{padding:10px 22px;border:none;border-radius:9px;background:#B98B3E;color:#fff;font-size:15px;'
      + 'letter-spacing:2px;cursor:pointer}'
      + '#ndt-bazi .bz-btn:active{transform:translateY(1px)}'
      + '#ndt-bazi .bz-btn.ghost{background:transparent;color:#B98B3E;border:1px solid #D9C49A}'
      + '#ndt-bazi .bz-tip{font-size:12px;color:#9096AB;line-height:1.7}'
      + '#ndt-bazi .bz-out{margin-top:20px}'
      + '#ndt-bazi .bz-card{background:#fff;border:1px solid #EAE6DC;border-radius:14px;padding:16px;margin-bottom:14px}'
      + '#ndt-bazi .bz-card h3{margin:0 0 12px;font-size:15px;letter-spacing:2px;color:#2A2E45;'
      + 'display:flex;align-items:center;gap:8px}'
      + '#ndt-bazi .bz-card h3::before{content:"";width:3px;height:14px;background:#B98B3E;border-radius:2px}'
      + '#ndt-bazi .bz-col{min-width:0;overflow:hidden}'
      + '#ndt-bazi .bz-col .cang{word-break:break-word}'
      + '#ndt-bazi .bz-pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center}'
      + '#ndt-bazi .bz-col{background:var(--bazi-paper);border-radius:10px;padding:10px 4px}'
      + '#ndt-bazi .bz-col .lab{font-size:11px;color:#8A90A8;letter-spacing:2px}'
      + '#ndt-bazi .bz-col .gz{font-size:26px;font-weight:600;color:#2A2E45;line-height:1.5;letter-spacing:4px}'
      + '#ndt-bazi .bz-col .god{font-size:11px;color:#B98B3E;margin-top:2px}'
      + '#ndt-bazi .bz-col .cang{font-size:11px;color:#6E7590;margin-top:4px;line-height:1.5}'
      + '#ndt-bazi .bz-col .ny{font-size:10px;color:#A8AEC0;margin-top:3px;letter-spacing:1px}'
      + '#ndt-bazi .bz-meta{margin-top:12px;font-size:12px;color:#7A8098;line-height:1.9}'
      + '#ndt-bazi .bz-meta b{color:#2A2E45}'
      + '#ndt-bazi .bz-ss{display:flex;flex-wrap:wrap;gap:8px}'
      + '#ndt-bazi .bz-ss-tag{border:1px solid #E7DCC4;background:#FBF7EF;color:#8A6A2E;border-radius:8px;'
      + 'padding:6px 10px;font-size:13px;cursor:pointer;transition:background .15s}'
      + '#ndt-bazi .bz-ss-tag:hover{background:#F5EDDD}'
      + '#ndt-bazi .bz-ss-tag .p{font-size:11px;opacity:.7;margin-left:4px}'
      + '#ndt-bazi .bz-ss-why{margin-top:10px;display:none;font-size:13px;line-height:1.8;color:#5A6178;'
      + 'background:#FBF7EF;border-left:3px solid #B98B3E;border-radius:0 8px 8px 0;padding:10px 12px}'
      + '#ndt-bazi .bz-ss-why.on{display:block}'
      + '#ndt-bazi .bz-ss-why .how{font-size:12px;color:#8A7A5E;background:#F3EADA;border-radius:6px;'
      + 'padding:6px 8px;margin:6px 0 8px;line-height:1.7;word-break:break-word}'
      + '#ndt-bazi .bz-ss-why .how em{font-style:normal;color:#B98B3E;font-weight:600;margin-right:6px}'
      + '#ndt-bazi .bz-ss-why .mean{word-break:break-word}'
      + '#ndt-bazi .bz-ss-why .hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px}'
      + '#ndt-bazi .bz-ss-why .hd b{font-size:14px;color:#8A6A2E}'
      + '#ndt-bazi .bz-ss-why .hd .pos{font-size:11px;color:#9AA0B4}'
      + '#ndt-bazi .bz-ss-why .src{font-size:11px;color:#9AA0B4;margin-top:8px;padding-top:6px;border-top:1px dashed #EDE8DC}'
      + '#ndt-bazi .bz-ss-count{font-size:11px;color:#9AA0B4;margin-left:8px}'
      + '#ndt-bazi .bz-dt-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;'
      + 'padding:9px 0;border-bottom:1px dashed #EDE8DC}'
      + '#ndt-bazi .bz-dt-row:last-child{border-bottom:0}'
      + '#ndt-bazi .bz-dt-row .k{flex:0 0 68px;font-size:12px;color:#8A90A8;letter-spacing:1px}'
      + '#ndt-bazi .bz-dt-row .v{font-size:14px;color:#2A2E45;min-width:0;word-break:break-word}'
      + '#ndt-bazi .bz-dt-row .n{font-size:11px;color:#9AA0B4;min-width:0;word-break:break-word}'
      + '#ndt-bazi .bz-dt-sec{margin:14px 0 8px;font-size:12px;color:#8A90A8;letter-spacing:1px}'
      + '#ndt-bazi .bz-wx-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}'
      + '#ndt-bazi .bz-wx-row .w{flex:0 0 20px;font-size:13px;color:#2A2E45;font-weight:600}'
      + '#ndt-bazi .bz-wx-row .bar{flex:1 1 auto;min-width:0;height:8px;background:#F0EBE1;border-radius:4px;overflow:hidden}'
      + '#ndt-bazi .bz-wx-row .bar i{display:block;height:100%;background:linear-gradient(90deg,#C9A268,#B98B3E);border-radius:4px}'
      + '#ndt-bazi .bz-wx-row .num{flex:0 0 auto;font-size:11px;color:#8A90A8}'
      + '#ndt-bazi .bz-dy{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}'
      + '#ndt-bazi .bz-dy-cell{flex:0 0 auto;min-width:76px;text-align:center;background:var(--bazi-paper);'
      + 'border-radius:10px;padding:8px 6px;border:1px solid transparent}'
      + '#ndt-bazi .bz-dy-cell.now{border-color:#B98B3E;background:#F8F0DE}'
      + '#ndt-bazi .bz-dy-cell .a{font-size:11px;color:#8A90A8}'
      + '#ndt-bazi .bz-dy-cell .g{font-size:20px;font-weight:600;letter-spacing:3px;color:#2A2E45;line-height:1.6}'
      + '#ndt-bazi .bz-dy-cell .t{font-size:11px;color:#B98B3E}'
      + '#ndt-bazi .bz-ln{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:8px}'
      + '#ndt-bazi .bz-ln-cell{text-align:center;background:#fff;border:1px solid #ECE8DE;border-radius:8px;padding:7px 4px}'
      + '#ndt-bazi .bz-ln-cell.now{border-color:#B98B3E;background:#F8F0DE}'
      + '#ndt-bazi .bz-ln-cell .y{font-size:11px;color:#8A90A8}'
      + '#ndt-bazi .bz-ln-cell .g{font-size:16px;font-weight:600;letter-spacing:2px;color:#2A2E45}'
      + '#ndt-bazi .bz-ln-cell .t{font-size:10px;color:#B98B3E}'
      + '#ndt-bazi .bz-empty{color:#8A90A8;font-size:14px;text-align:center;padding:30px 0}'
      + '#ndt-bazi .bz-hh-score{font-size:34px;font-weight:600;line-height:1.2}'
      + '#ndt-bazi .bz-hh-score small{font-size:13px;color:#8A90A8;margin-left:6px;font-weight:400}'
      + '#ndt-bazi .bz-hh-row{display:grid;grid-template-columns:92px 48px 1fr;gap:8px;align-items:start;'
      + 'padding:9px 0;border-top:1px dashed #EFEBE1}'
      + '#ndt-bazi .bz-hh-k{font-size:13px;color:#2A2E45;font-weight:600}'
      + '#ndt-bazi .bz-hh-v{font-size:14px;font-weight:600;text-align:right}'
      + '#ndt-bazi .bz-hh-w{font-size:12px;color:#6E7590;line-height:1.75}'
      + '#ndt-bazi .bz-ly{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}'
      + '#ndt-bazi .bz-ly-cell{background:var(--bazi-paper);border-radius:8px;text-align:center;padding:7px 2px}'
      + '#ndt-bazi .bz-ly-cell .m{font-size:10px;color:#8A90A8}'
      + '#ndt-bazi .bz-ly-cell .g{font-size:16px;font-weight:600;letter-spacing:2px;color:#2A2E45;line-height:1.5}'
      + '#ndt-bazi .bz-ly-cell .t{font-size:10px;color:#B98B3E}'
      + '#ndt-bazi .bz-zr{max-height:340px;overflow-y:auto;-webkit-overflow-scrolling:touch}'
      + '#ndt-bazi .bz-zr-row{display:grid;grid-template-columns:30px 52px 44px 1fr;gap:8px;'
      + 'align-items:center;padding:7px 0;border-bottom:1px dashed #EFEBE1}'
      + '#ndt-bazi .bz-zr-row .d{font-size:13px;color:#2A2E45;font-weight:600}'
      + '#ndt-bazi .bz-zr-row .gz{font-size:13px;color:#5A6178;letter-spacing:1px}'
      + '#ndt-bazi .bz-zr-row .jc{font-size:13px;font-weight:600;text-align:center}'
      + '#ndt-bazi .bz-zr-row .jc.good{color:#3E8E5A}'
      + '#ndt-bazi .bz-zr-row .jc.bad{color:#C0504D}'
      + '#ndt-bazi .bz-zr-row .jc.flat{color:#8A90A8}'
      + '#ndt-bazi .bz-zr-row .w{font-size:12px;color:#6E7590;line-height:1.6;min-width:0;word-break:break-word}'
      + '#ndt-bazi .bz-zr-row{min-width:0}'
      + '#ndt-bazi .bz-hh-row{min-width:0}'
      + '#ndt-bazi .bz-hh-w{min-width:0;word-break:break-word}'
      + '#ndt-bazi{overflow-x:hidden}'
      + '#ndt-bazi .bz-savebar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}'
      + '#ndt-bazi .bz-case-list{display:flex;flex-direction:column;gap:6px}'
      + '#ndt-bazi .bz-case-row{display:grid;grid-template-columns:1fr 1.4fr 1fr 44px 30px;gap:6px;'
      + 'align-items:center;padding:8px 10px;background:#FBF7EF;border-radius:9px;min-width:0}'
      + '#ndt-bazi .bz-case-row .n{font-size:13px;color:#2A2E45;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      + '#ndt-bazi .bz-case-row .n .g{font-size:10px;color:#B98B3E;margin-left:4px}'
      + '#ndt-bazi .bz-case-row .f{font-size:12px;color:#5A6178;letter-spacing:1px;min-width:0}'
      + '#ndt-bazi .bz-case-row .d{font-size:11px;color:#8A90A8;min-width:0}'
      + '#ndt-bazi .bz-case-row .d .t{margin-left:4px;color:#B0B6C8}'
      + '#ndt-bazi .bz-case-open,#ndt-bazi .bz-case-del{padding:5px 8px;border:1px solid #D9C49A;'
      + 'background:#fff;border-radius:7px;font-size:12px;color:#B98B3E;cursor:pointer}'
      + '#ndt-bazi .bz-case-del{border-color:#E8CCCC;color:#B06A6A}'
      + '@media(max-width:900px){'
      + '  #ndt-bazi .bz-case-row{grid-template-columns:1fr 1fr 44px 30px}'
      + '  #ndt-bazi .bz-case-row .f{grid-column:1/-1;font-size:11px}'
      + '  #ndt-bazi .bz-case-row .d{display:none}'
      + '}'
      + '@media(max-width:900px){'
      + '  #ndt-bazi .bz-col .gz{font-size:22px;letter-spacing:2px}'
      + '  #ndt-bazi .bz-pillars{gap:5px}'
      + '}';
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- 侧栏入口 ---------- */

  function ensureSideItem() {
    var bar = $('.sidebar');
    if (!bar) { return; }
    var item = $('[' + ITEM_KEY + ']', bar);
    if (!item) {
      item = document.createElement('a');
      item.className = 'side-item';
      item.href = HASH;
      item.setAttribute('data-section', 'bazi');
      item.setAttribute('data-hash', HASH);
      item.setAttribute(ITEM_KEY, '1');
      var ico = '<svg class="side-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6">'
        + '<circle cx="12" cy="12" r="8"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>'
        + '<circle cx="12" cy="12" r="2.2"/></svg>';
      item.innerHTML = ico + '<span class="side-item-label">四柱八字</span>';
    }
    /* 位置：签卜命理组内、「抽签问吉」之后（sidebar-order.js 给的就是这个位）。
       已存在但被挪到别处（比如落到「其他」）时，这里把它搬回来。
       只在位置不对时才动 DOM —— 否则会和 sidebar-order 的分组重排互相触发，
       侧栏反复重建，手机上就是抖动 / 划不动。 */
    var ref = $('.side-item[data-section="divination"]', bar);
    if (ref && ref.parentNode === bar) {
      if (item.parentNode !== bar || item.previousElementSibling !== ref) {
        bar.insertBefore(item, ref.nextSibling);
      }
      return;
    }
    if (item.parentNode === bar) { return; }
    bar.appendChild(item);
  }

  /* ---------- 表单 ---------- */

  var MEM_KEY = 'ndt-bazi-last';

  function loadLast() {
    try {
      var raw = localStorage.getItem(MEM_KEY);
      if (!raw) { return null; }
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function formHtml() {
    var last = loadLast() || {};
    var now = new Date();
    var y = last.year || (now.getFullYear() - 25);
    var cities = Object.keys(BaziCore.CITY_LON);
    var opts = cities.map(function (c) {
      return '<option value="' + esc(c) + '"' + (last.city === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');
    return ''
      + '<div class="bz-card">'
      + '  <div class="bz-head"><h2>四柱八字</h2><span class="bz-sub">子平法排盘 · 节令定月 · 真太阳时校正</span></div>'
      + '  <div class="bz-form">'
      + '    <div class="bz-field"><label>姓名（可不填）</label><input id="bz-name" type="text" maxlength="12" placeholder="用于存档区分" value="' + esc(last.name || '') + '"></div>'
      + '    <div class="bz-field"><label>历法</label><select id="bz-cal">'
      + '      <option value="solar"' + (last.cal === 'lunar' ? '' : ' selected') + '>公历（阳历）</option>'
      + '      <option value="lunar"' + (last.cal === 'lunar' ? ' selected' : '') + '>农历（阴历）</option>'
      + '    </select></div>'
      + '    <div class="bz-field"><label>性别</label><select id="bz-gender">'
      + '      <option value="男"' + (last.gender === '女' ? '' : ' selected') + '>男</option>'
      + '      <option value="女"' + (last.gender === '女' ? ' selected' : '') + '>女</option>'
      + '    </select></div>'
      + '    <div class="bz-field"><label>出生年</label><input id="bz-y" type="number" min="1900" max="2100" value="' + y + '"></div>'
      + '    <div class="bz-field"><label>月</label><input id="bz-m" type="number" min="1" max="12" value="' + (last.month || 6) + '"></div>'
      + '    <div class="bz-field"><label>日</label><input id="bz-d" type="number" min="1" max="31" value="' + (last.day || 15) + '"></div>'
      + '    <div class="bz-field"><label>闰月</label><select id="bz-leap">'
      + '      <option value="0">非闰月</option><option value="1">闰月</option></select></div>'
      + '    <div class="bz-field"><label>出生时间（北京时间）</label><input id="bz-h" type="time" value="' + esc((last.time) || '12:00') + '"></div>'
      + '    <div class="bz-field"><label>出生地</label><select id="bz-city">' + opts + '</select></div>'
      + '    <div class="bz-field"><label>分组（可不填）</label><input id="bz-group" type="text" maxlength="12" placeholder="如：家人、朋友" value="' + esc(last.group || '') + '"></div>'
      + '  </div>'
      + '  <div class="bz-actions">'
      + '    <button class="bz-btn" id="bz-go">排 盘</button>'
      + '    <label class="bz-tip"><input id="bz-tst" type="checkbox"' + (last.useTST === false ? '' : ' checked') + '> 按出生地真太阳时校正（更准）</label>'
      + '  </div>'
      + '  <div class="bz-tip" style="margin-top:10px">'
      + '    年柱以立春为界、月柱以节气为界；真太阳时按出生地经度与均时差折算。'
      + '    时辰不确定时，可先不勾选真太阳时，按整点估算。'
      + '  </div>'
      + '</div>'
      + '<div class="bz-card"><h3>案例存档</h3><div id="bz-cases"></div></div>'
      + '<div class="bz-out" id="bz-out"><div class="bz-empty">填好出生信息后点「排盘」</div></div>';
  }

  /* ---------- 渲染 ---------- */

  var PILLAR_LABEL = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };

  function pillarCells(r) {
    var keys = ['year', 'month', 'day', 'hour'];
    var ny = (r.extra && r.extra.nayin) || {};
    return keys.map(function (k) {
      var p = r.pillars[k];
      var cg = r.cangGan[k] || [];
      var cgText = cg.map(function (x) { return x.gan + '(' + x.god + ')'; }).join(' ');
      return ''
        + '<div class="bz-col">'
        + '  <div class="lab">' + PILLAR_LABEL[k] + '</div>'
        + '  <div class="gz">' + esc(p.gan + p.zhi) + '</div>'
        + '  <div class="god">' + esc(p.god || '') + '</div>'
        + '  <div class="cang">' + esc(cgText) + '</div>'
        + '  <div class="ny">' + esc(ny[k] ? ny[k].name : '') + '</div>'
        + '</div>';
    }).join('');
  }

  /* 原文排版清洗：去掉官网文本的缩进空白与多余空行，再转 <br> */
  function srcText(s) {
    var raw = String(s == null ? '' : s).replace(/\r/g, '');
    var lines = raw.split('\n').map(function (x) {
      return x.replace(/^[\s\u3000]+/, '').replace(/[\s\u3000]+$/, '');
    });
    var kept = [];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] === '' && kept.length && kept[kept.length - 1] === '') { continue; }
      kept.push(lines[i]);
    }
    while (kept.length && kept[kept.length - 1] === '') { kept.pop(); }
    return esc(kept.join('\n')).replace(/\n/g, '<br>');
  }

  function shenshaHtml(r) {
    if (!r.shensha.length) { return '<div class="bz-tip">此盘未见常用神煞。</div>'; }
    var tags = r.shensha.map(function (s, i) {
      return '<span class="bz-ss-tag" data-i="' + i + '">' + esc(s.name) + '<span class="p">' + esc(s.pillar + '柱 ' + s.zhi) + '</span></span>';
    }).join('');
    var whys = r.shensha.map(function (s, i) {
      return '<div class="bz-ss-why" data-i="' + i + '">'
        + '<div class="hd"><b>' + esc(s.name) + '</b><span class="pos">' + esc(s.pillar + '柱 · ' + s.zhi) + '</span></div>'
        + (s.how ? '<div class="how"><em>古诀查法</em>' + srcText(s.how) + '</div>' : '')
        + '<div class="mean">' + srcText(s.desc || '') + '</div>'
        + '<div class="src">出处：问真八字官网（pcbz.iwzwh.com）神煞条目原文</div>'
        + '</div>';
    }).join('');
    return '<div class="bz-ss">' + tags + '</div><div id="bz-ss-why">' + whys + '</div>'
      + '<div class="bz-tip" style="margin-top:10px">共命中 ' + r.shensha.length + ' 条，点任意一条看古诀查法与原文详解。'
      + '释义照抄问真八字，其依据多出《三命通会》《渊海子平》等原典；神煞只作参考，断命仍以四柱生克为主。</div>';
  }

  /* 详尽盘：纳音 / 胎元 / 命宫 / 身宫 / 旬空 / 旺衰 / 格局 / 五行力量 */
  function detailHtml(r) {
    var e = r.extra;
    if (!e) { return ''; }
    function row(label, val, note) {
      return '<div class="bz-dt-row"><span class="k">' + esc(label) + '</span>'
        + '<span class="v">' + val + '</span>'
        + (note ? '<span class="n">' + esc(note) + '</span>' : '') + '</div>';
    }
    var ny = e.nayin;
    var nyText = [ny.year, ny.month, ny.day, ny.hour].map(function (x) {
      return x ? (esc(x.name)) : '—';
    }).join(' · ');

    var bars = e.wxPower.list.map(function (x) {
      return '<div class="bz-wx-row"><span class="w">' + esc(x.wx) + '</span>'
        + '<span class="bar"><i style="width:' + Math.max(4, x.pct) + '%"></i></span>'
        + '<span class="num">' + x.score + '／' + x.pct + '%</span></div>';
    }).join('');

    var s = e.strength;
    var ssTone = s.level === '偏强' ? '#9A6B2F' : (s.level === '偏弱' ? '#5A6B8C' : '#4C7A5B');

    return ''
      + '<h3>详尽盘</h3>'
      + row('四柱纳音', nyText, '')
      + row('胎元', '<b>' + esc(e.taiYuan.gz) + '</b>' + (e.taiYuan.nayin ? '（' + esc(e.taiYuan.nayin.name) + '）' : ''), '月干进一位、月支进三位')
      + row('命宫', '<b>' + esc(e.mingGong.gz) + '</b>' + (e.mingGong.nayin ? '（' + esc(e.mingGong.nayin.name) + '）' : ''), '依月支与时支推')
      + row('身宫', '<b>' + esc(e.shenGong.gz) + '</b>' + (e.shenGong.nayin ? '（' + esc(e.shenGong.nayin.name) + '）' : ''), '依月支与时支推')
      + row('旬空', '<b>' + esc(e.xunKong.text) + '</b>', '日柱所在旬所缺二支')
      + row('月令旺衰', '<b>' + esc(e.wangShuai.state) + '</b>', e.wangShuai.note)
      + row('格局', '<b>' + esc(e.geju.name) + '</b>', e.geju.note)
      + '<div class="bz-dt-sec">五行力量</div>'
      + '<div class="bz-wx">' + bars + '</div>'
      + '<div class="bz-dt-row"><span class="k">日主强弱</span>'
      + '<span class="v" style="color:' + ssTone + '"><b>' + esc(s.level) + '</b></span>'
      + '<span class="n">同党占 ' + s.ratio + '%（比劫＋印为同党）</span></div>'
      + '<div class="bz-tip" style="margin-top:10px">旺衰、格局、五行力量按主流取法简判，'
      + '用神喜忌因流派不同结论不一，这里不给定论，留给你自己权衡。</div>';
  }

  function dayunHtml(r) {
    var nowAge = new Date().getFullYear() - r.input.year;
    var cells = r.dayun.list.map(function (d) {
      var isNow = nowAge >= d.startAge && nowAge < d.startAge + 10;
      return '<div class="bz-dy-cell' + (isNow ? ' now' : '') + '">'
        + '<div class="a">' + d.startAge + '岁起</div>'
        + '<div class="g">' + esc(d.name) + '</div>'
        + '<div class="t">' + esc(d.tenGod) + '</div>'
        + '</div>';
    }).join('');
    var dir = r.dayun.forward ? '顺排' : '逆排';
    return '<div class="bz-tip" style="margin-bottom:10px">'
      + dir + ' · 起运约 ' + r.dayun.startAge.toFixed(1) + ' 岁（' + Math.round(r.dayun.startAge) + ' 岁前后交运）'
      + '</div><div class="bz-dy">' + cells + '</div>';
  }

  function liunianHtml(r) {
    var nowY = new Date().getFullYear();
    var cells = r.liunian.slice(0, 10).map(function (l) {
      return '<div class="bz-ln-cell' + (l.year === nowY ? ' now' : '') + '">'
        + '<div class="y">' + l.year + '</div>'
        + '<div class="g">' + esc(l.name) + '</div>'
        + '<div class="t">' + esc(l.tenGod) + '</div>'
        + '</div>';
    }).join('');
    return '<div class="bz-ln">' + cells + '</div>';
  }

  function resultHtml(r) {
    var tst = r.trueSolar;
    var tstLine = '';
    if (tst) {
      tstLine = '真太阳时 <b>' + pad(tst.hh) + ':' + pad(tst.mi) + '</b>'
        + '（较北京时间 ' + (tst.deltaMin >= 0 ? '+' : '') + tst.deltaMin + ' 分钟'
        + (tst.dayShift ? '，跨至' + (tst.dayShift > 0 ? '次日' : '前一日') : '') + '）';
    }
    var birth = r.input.year + '年' + r.input.month + '月' + r.input.day + '日 '
      + pad(r.input.hour) + ':' + pad(r.input.minute);
    var lunarLine = '';
    if (window.BaziLunar) {
      var lu = BaziLunar.solarToLunar(r.input.year, r.input.month, r.input.day);
      if (lu) { lunarLine = '农历 <b>' + esc(lu.text) + '</b>　'; }
    }
    return ''
      + '<div class="bz-card">'
      + '  <div class="bz-savebar">'
      + '    <button class="bz-btn" id="bz-save">存入案例</button>'
      + '    <span class="bz-tip">存档后可随时从上面的「案例存档」重新打开</span>'
      + '  </div>'
      + '  <h3>本命盘</h3>'
      + '  <div class="bz-pillars">' + pillarCells(r) + '</div>'
      + '  <div class="bz-meta">'
      + '    公历 <b>' + esc(birth) + '</b>　' + lunarLine + '生肖 <b>' + esc(r.shengxiao) + '</b>　日主 <b>' + esc(r.dayMaster.gan + '（' + r.dayMaster.wx + '·' + r.dayMaster.yinyang + '）') + '</b>'
      + (tstLine ? '<br>' + tstLine : '')
      + (r.jieqi.jie ? '<br>生于 <b>' + esc(r.jieqi.jie) + '</b> 之后，月令为 <b>' + esc(r.pillars.month.zhi) + '</b>' : '')
      + '  </div>'
      + '</div>'
      + '<div class="bz-card">' + detailHtml(r) + '</div>'
      + '<div class="bz-card"><h3>神煞（点开看解释）</h3>' + shenshaHtml(r) + '</div>'
      + '<div class="bz-card"><h3>大运</h3>' + dayunHtml(r) + '</div>'
      + '<div class="bz-card"><h3>近年流年</h3>' + liunianHtml(r) + '</div>'
      + '<div class="bz-card"><h3>合婚测算</h3>'
      + '  <div class="bz-tip" style="margin-bottom:10px">填对方的出生信息，比对两人盘面。</div>'
      + '  <div class="bz-form">'
      + '    <div class="bz-field"><label>对方性别</label><select id="bz-hh-gender">'
      + '      <option value="女">女</option><option value="男">男</option></select></div>'
      + '    <div class="bz-field"><label>出生年</label><input id="bz-hh-y" type="number" min="1900" max="2100" value="' + (new Date().getFullYear() - 25) + '"></div>'
      + '    <div class="bz-field"><label>月</label><input id="bz-hh-m" type="number" min="1" max="12" value="6"></div>'
      + '    <div class="bz-field"><label>日</label><input id="bz-hh-d" type="number" min="1" max="31" value="15"></div>'
      + '    <div class="bz-field"><label>时辰（北京时间）</label><input id="bz-hh-h" type="time" value="12:00"></div>'
      + '    <div class="bz-field"><label>出生地</label><select id="bz-hh-city">'
      + Object.keys(BaziCore.CITY_LON).map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('')
      + '    </select></div>'
      + '  </div>'
      + '  <div class="bz-actions"><button class="bz-btn ghost" id="bz-hh-go">测 合 婚</button></div>'
      + '  <div id="bz-hh-out"></div>'
      + '</div>'
      + '<div class="bz-card"><h3>流月 · ' + new Date().getFullYear() + ' 年</h3>' + liuyueHtml(r) + '</div>'
      + '<div class="bz-card"><h3>择日 · 建除十二神</h3>' + zeriHtml(r) + '</div>';
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- 案例存档 ---------- */

  var CASE_KEY = 'ndt-bazi-cases';

  function listCases() {
    try {
      var raw = localStorage.getItem(CASE_KEY);
      if (!raw) { return []; }
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function writeCases(arr) {
    try { localStorage.setItem(CASE_KEY, JSON.stringify(arr.slice(0, 60))); } catch (e) {}
  }

  function saveCase(r) {
    var name = (($('#bz-name') || {}).value || '').trim();
    var group = (($('#bz-group') || {}).value || '').trim();
    var id = String(Date.now());
    var arr = listCases();
    /* 同名同生日视作同一个人，覆盖旧记录 */
    arr = arr.filter(function (c) {
      return !(c.name === name && c.input && c.input.year === r.input.year
        && c.input.month === r.input.month && c.input.day === r.input.day
        && c.input.hour === r.input.hour && c.input.minute === r.input.minute);
    });
    arr.unshift({
      id: id, name: name || '未命名', group: group, savedAt: Date.now(),
      input: r.input,
      four: [r.pillars.year, r.pillars.month, r.pillars.day, r.pillars.hour].map(function (p) { return p.gan + p.zhi; }).join(' '),
      dayMaster: r.dayMaster.gan + '（' + r.dayMaster.wx + '）'
    });
    writeCases(arr);
    renderCases();
    var btn = $('#bz-save');
    if (btn) { btn.textContent = '已存入案例'; btn.disabled = true; }
  }

  function renderCases() {
    var box = $('#bz-cases');
    if (!box) { return; }
    var arr = listCases();
    if (!arr.length) {
      box.innerHTML = '<div class="bz-tip">还没有存档的案例。排完盘后点「存入案例」就会记在这里，下次点一下就能重新打开。</div>';
      return;
    }
    var rows = arr.map(function (c) {
      var t = new Date(c.savedAt || Date.now());
      var when = (t.getMonth() + 1) + '/' + t.getDate();
      return '<div class="bz-case-row" data-id="' + esc(c.id) + '">'
        + '<div class="n">' + esc(c.name) + (c.group ? '<span class="g">' + esc(c.group) + '</span>' : '') + '</div>'
        + '<div class="f">' + esc(c.four) + '</div>'
        + '<div class="d">' + esc(c.dayMaster) + '<span class="t">' + when + '</span></div>'
        + '<button class="bz-case-open" data-id="' + esc(c.id) + '">打开</button>'
        + '<button class="bz-case-del" data-id="' + esc(c.id) + '">删</button>'
        + '</div>';
    }).join('');
    box.innerHTML = '<div class="bz-tip" style="margin-bottom:8px">共 ' + arr.length + ' 个案例</div><div class="bz-case-list">' + rows + '</div>';
    $$('.bz-case-open', box).forEach(function (b) {
      b.addEventListener('click', function () { openCase(b.getAttribute('data-id')); });
    });
    $$('.bz-case-del', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id');
        writeCases(listCases().filter(function (c) { return c.id !== id; }));
        renderCases();
      });
    });
  }

  function openCase(id) {
    var c = listCases().filter(function (x) { return x.id === id; })[0];
    if (!c || !c.input) { return; }
    if ($('#bz-name')) { $('#bz-name').value = c.name === '未命名' ? '' : c.name; }
    if ($('#bz-group')) { $('#bz-group').value = c.group || ''; }
    $('#bz-y').value = c.input.year;
    $('#bz-m').value = c.input.month;
    $('#bz-d').value = c.input.day;
    $('#bz-h').value = pad(c.input.hour) + ':' + pad(c.input.minute);
    $('#bz-gender').value = c.input.gender || '男';
    if (c.input.city && $('#bz-city')) { $('#bz-city').value = c.input.city; }
    if ($('#bz-tst')) { $('#bz-tst').checked = c.input.useTrueSolar !== false; }
    doPaipan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 流月 ---------- */

  function liuyueHtml(r) {
    var nowY = new Date().getFullYear();
    var ganIdx = BaziCore.GAN.indexOf(r.pillars.day.gan);
    var list = BaziCore.liuYue(nowY, ganIdx);
    var cells = list.map(function (x) {
      return '<div class="bz-ly-cell">'
        + '<div class="m">' + x.month + '月</div>'
        + '<div class="g">' + esc(x.name) + '</div>'
        + '<div class="t">' + esc(x.tenGod) + '</div>'
        + '</div>';
    }).join('');
    return '<div class="bz-ly">' + cells + '</div>'
      + '<div class="bz-tip" style="margin-top:8px">' + nowY
      + ' 年十二月建（寅月为正月），干支对日主取十神。</div>';
  }

  /* ---------- 择日 ---------- */

  function zeriHtml(r) {
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth() + 1;
    var ganIdx = BaziCore.GAN.indexOf(r.pillars.day.gan);
    var days = BaziCore.zeRiList(y, m, ganIdx);
    var good = days.filter(function (d) { return d.tone === '吉'; }).length;
    var rows = days.map(function (d) {
      var cls = d.tone === '吉' ? 'good' : d.tone === '凶' ? 'bad' : 'flat';
      return '<div class="bz-zr-row">'
        + '<div class="d">' + d.day + '</div>'
        + '<div class="gz">' + esc(d.dayGZ) + '</div>'
        + '<div class="jc ' + cls + '">' + esc(d.name) + '</div>'
        + '<div class="w">' + esc(d.desc) + '</div>'
        + '</div>';
    }).join('');
    return '<div class="bz-tip" style="margin-bottom:8px">' + y + ' 年 ' + m + ' 月　本月吉日 '
      + good + ' / ' + days.length + ' 天（依建除十二神）</div>'
      + '<div class="bz-zr">' + rows + '</div>';
  }


  /* ---------- 合婚 ---------- */

  /* 八字五行个数（天干本气 + 地支本气各算一个） */
  function wxCount(r) {
    var c = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    ['year', 'month', 'day', 'hour'].forEach(function (k) {
      var g = BaziCore.GAN.indexOf(r.pillars[k].gan);
      var z = BaziCore.ZHI.indexOf(r.pillars[k].zhi);
      if (g >= 0 && c[BaziCore.GAN_WX[g]] !== undefined) { c[BaziCore.GAN_WX[g]]++; }
      if (z >= 0 && c[BaziCore.ZHI_WX[z]] !== undefined) { c[BaziCore.ZHI_WX[z]]++; }
    });
    return c;
  }

  function hehun(a, b) {
    var items = [];
    var base = 55;
    function add(name, delta, why, tone) {
      items.push({ name: name, delta: delta, why: why, tone: tone || (delta >= 0 ? 'good' : 'bad') });
      base += delta;
    }

    var ag = BaziCore.GAN.indexOf(a.pillars.day.gan);
    var bg = BaziCore.GAN.indexOf(b.pillars.day.gan);
    var az = BaziCore.ZHI.indexOf(a.pillars.day.zhi);
    var bz = BaziCore.ZHI.indexOf(b.pillars.day.zhi);

    /* 1. 日干五合（甲己乙庚丙辛丁壬戊癸） */
    if (Math.abs(ag - bg) === 5) {
      add('日干相合', 14, '两人日主天干正好五合（' + a.pillars.day.gan + '·' + b.pillars.day.gan
        + '），传统上这是最正的夫妻之象，相处容易心意相通。');
    } else if (ag === bg) {
      add('日干同气', 4, '两人日主同为' + a.pillars.day.gan + '，性情相类，容易处成哥们儿式的关系，'
        + '好处是省力气，短板是少了点互补。');
    } else {
      add('日干无合', 0, '日主天干不在五合之内（' + a.pillars.day.gan + '·' + b.pillars.day.gan
        + '），不构成天然的一对，更多靠后天磨合。');
    }

    /* 2. 日支六合 / 三合 / 相冲 */
    if ((az + bz) % 12 === 1) {
      add('日支六合', 16, '两人日支成六合（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi
        + '），日支是配偶宫，这一条最直接管「日子过得和不和」。六合主亲近、依赖、愿意让步。');
    } else if (az % 4 === bz % 4) {
      add('日支三合', 11, '两人日支同属三合局（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi
        + '），合得起劲、聊得来，属于越相处越顺的类型。');
    } else if ((az - bz) % 12 === 6 || (bz - az) % 12 === 6) {
      add('日支相冲', -15, '两人日支相冲（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi
        + '），配偶宫正对冲。这是最需要留意的一条：容易一冷一热、越想靠近越别扭，'
        + '多数要靠明确分工和各自空间来化。');
    } else if ((az + bz) % 12 === 7) {
      add('日支相害', -7, '两人日支相害（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi
        + '），不至于过不下去，但小事上容易互相别扭、话说岔。');
    } else {
      add('日支平淡', 0, '两人日支既不合也不冲（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi
        + '），配偶宫无牵动，日子过成什么样，全看两人怎么经营。');
    }

    /* 3. 年支（生肖）关系 */
    var ay = BaziCore.ZHI.indexOf(a.pillars.year.zhi);
    var by = BaziCore.ZHI.indexOf(b.pillars.year.zhi);
    if ((ay + by) % 12 === 1) { add('生肖六合', 8, '两人年支六合（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '），长辈缘与家庭氛围通常不错。'); }
    else if (ay % 4 === by % 4) { add('生肖三合', 6, '两人年支同属三合（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '），起点合拍。'); }
    else if ((ay - by) % 12 === 6 || (by - ay) % 12 === 6) { add('生肖相冲', -8, '两人年支相冲（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '），传统上属「六冲」，多指观念上一硬一软，需各退半步。'); }
    else { add('生肖无涉', 0, '两人年支（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '）无合无冲，这一条不构成影响。'); }

    /* 4. 五行互补 */
    var ca = wxCount(a), cb = wxCount(b);
    var missA = [], missB = [], strongA = [], strongB = [];
    ['木','火','土','金','水'].forEach(function (w) {
      if (ca[w] === 0) { missA.push(w); }
      if (cb[w] === 0) { missB.push(w); }
      if (ca[w] >= 3) { strongA.push(w); }
      if (cb[w] >= 3) { strongB.push(w); }
    });
    var fill = 0;
    missA.forEach(function (w) { if (cb[w] >= 2) { fill++; } });
    missB.forEach(function (w) { if (ca[w] >= 2) { fill++; } });
    if (fill >= 2) {
      add('五行互补', 15, '你缺的、对方那边正好多（' + (missA.concat(missB).join('、') || '—')
        + '），这种互补最实在，日子过起来各补各的短板。');
    } else if (fill === 1) {
      add('五行稍补', 7, '有一边刚好补上对方一样所缺，算不上大补，但不添乱。');
    } else {
      var overlap = [];
      ['木','火','土','金','水'].forEach(function (w) {
        if ((ca[w] === 0) && (cb[w] === 0)) { overlap.push(w); }
      });
      if (overlap.length) {
        add('同缺五行', -6, '两人都缺' + overlap.join('、') + '，同一处短板容易在同一件事上一起卡住，'
          + '需要外部帮衬（环境、朋友、习惯）。');
      } else {
        add('五行无明显互补', 0, '两人五行分布没有特别强的互补或冲突，属于常规搭配。');
      }
    }

    /* 5. 十神：男看财、女看官 */
    var male = a.input.gender === '男' ? a : b;
    var female = a.input.gender === '男' ? b : a;
    var mIdx = BaziCore.GAN.indexOf(male.pillars.day.gan);
    var fIdx = BaziCore.GAN.indexOf(female.pillars.day.gan);
    var fZhiMain = BaziCore.ZHI_CANG[BaziCore.ZHI.indexOf(female.pillars.day.zhi)][0];
    var mZhiMain = BaziCore.ZHI_CANG[BaziCore.ZHI.indexOf(male.pillars.day.zhi)][0];
    var mSeesF = BaziCore.tenGod(mIdx, BaziCore.GAN.indexOf(fZhiMain));
    var fSeesM = BaziCore.tenGod(fIdx, BaziCore.GAN.indexOf(mZhiMain));
    var caiOk = /财/.test(mSeesF), guanOk = /官|杀/.test(fSeesM);
    if (caiOk && guanOk) {
      add('十神相配', 12, '男方命里看女方为「' + mSeesF + '」，女方看男方为「' + fSeesM
        + '」，正财配正官，是传统合婚里最正的一组。');
    } else if (caiOk || guanOk) {
      add('十神半配', 6, '一边合、一边平（男看女 ' + mSeesF + '，女看男 ' + fSeesM + '），不算出彩但也不犯忌。');
    } else {
      add('十神无配', 0, '男看女为「' + mSeesF + '」、女看男为「' + fSeesM
        + '」，没有明显的财官之应，感情更靠相处本身。');
    }

    var score = Math.max(0, Math.min(100, Math.round(base)));
    return { score: score, items: items };
  }

  function hehunHtml(a, b, res) {
    var tone = res.score >= 75 ? '很好' : res.score >= 60 ? '不错' : res.score >= 45 ? '一般' : '需谨慎';
    var color = res.score >= 75 ? '#3E8E5A' : res.score >= 60 ? '#5A7DB8' : res.score >= 45 ? '#B98B3E' : '#C0504D';
    var rows = res.items.map(function (it) {
      return '<div class="bz-hh-row">'
        + '<div class="bz-hh-k">' + esc(it.name) + '</div>'
        + '<div class="bz-hh-v" style="color:' + (it.delta >= 0 ? '#3E8E5A' : '#C0504D') + '">'
        + (it.delta > 0 ? '+' : '') + it.delta + '</div>'
        + '<div class="bz-hh-w">' + esc(it.why) + '</div>'
        + '</div>';
    }).join('');
    return ''
      + '<div class="bz-card">'
      + '  <h3>合婚结果</h3>'
      + '  <div class="bz-hh-score"><span style="color:' + color + '">' + res.score + '</span>'
      + '    <small>分 · ' + tone + '</small></div>'
      + '  <div class="bz-tip" style="margin:6px 0 12px">'
      + esc(a.input.gender + ' ' + a.pillars.day.gan + a.pillars.day.zhi + '日') + ' × '
      + esc(b.input.gender + ' ' + b.pillars.day.gan + b.pillars.day.zhi + '日')
      + '　（基准 55 分，逐条加减）</div>'
      + rows
      + '  <div class="bz-tip" style="margin-top:10px">合婚看的是两人盘面相处起来顺不顺，不是判吉凶。'
      + '分数偏低不必慌，它指的是「哪些地方需要多花力气」，而不是「不该在一起」。</div>'
      + '</div>';
  }


  /* ---------- 交互 ---------- */

  function doPaipan() {
    var y = parseInt(($('#bz-y') || {}).value, 10);
    var m = parseInt(($('#bz-m') || {}).value, 10);
    var d = parseInt(($('#bz-d') || {}).value, 10);
    var timeStr = (($('#bz-h') || {}).value || '12:00');
    var parts = timeStr.split(':');
    var hh = parseInt(parts[0], 10) || 0;
    var mi = parseInt(parts[1], 10) || 0;
    var gender = (($('#bz-gender') || {}).value) || '男';
    var city = (($('#bz-city') || {}).value) || '北京';
    var useTST = !!($('#bz-tst') && $('#bz-tst').checked);
    var lon = BaziCore.CITY_LON[city] || 120;

    if (!y || y < 1900 || y > 2100 || !m || m < 1 || m > 12 || !d || d < 1 || d > 31) {
      $('#bz-out').innerHTML = '<div class="bz-card"><div class="bz-tip" style="color:#C0504D">年月日填写有误，请检查。</div></div>';
      return;
    }
    var probe = new Date(y, m - 1, d);
    if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) {
      $('#bz-out').innerHTML = '<div class="bz-card"><div class="bz-tip" style="color:#C0504D">' + y + ' 年 ' + m + ' 月没有 ' + d + ' 日，请检查。</div></div>';
      return;
    }

    var input = { year: y, month: m, day: d, hour: hh, minute: mi, gender: gender, useTrueSolar: useTST, lon: lon, city: city };

    /* 农历输入：先折算成公历再排盘 */
    var cal = (($('#bz-cal') || {}).value) || 'solar';
    var leap = (($('#bz-leap') || {}).value) === '1';
    var solarDate = null;
    if (cal === 'lunar') {
      if (leap && !(window.BaziLunar && BaziLunar.leapMonthOf(y) === m)) {
        $('#bz-out').innerHTML = '<div class="bz-card"><div class="bz-tip" style="color:#C0504D">'
          + y + ' 年没有闰 ' + m + ' 月，请改选「非闰月」。</div></div>';
        return;
      }
      solarDate = window.BaziLunar ? BaziLunar.lunarToSolar(y, m, d, leap) : null;
      if (!solarDate) {
        $('#bz-out').innerHTML = '<div class="bz-card"><div class="bz-tip" style="color:#C0504D">'
          + '这个农历日期在 1900-2100 之外或不存在，请检查。</div></div>';
        return;
      }
      input.year = solarDate.y; input.month = solarDate.m; input.day = solarDate.d;
      input.calendarInput = { cal: 'lunar', y: y, m: m, d: d, leap: leap };
    }

    var r;
    try { r = BaziCore.paipan(input); }
    catch (e) {
      $('#bz-out').innerHTML = '<div class="bz-card"><div class="bz-tip" style="color:#C0504D">排盘出错：' + esc(e.message) + '</div></div>';
      return;
    }
    $('#bz-out').innerHTML = resultHtml(r);

    /* 神煞点开解释 */
    var whyBox = $('#bz-ss-why');
    $$('.bz-ss-tag').forEach(function (tag) {
      tag.addEventListener('click', function () {
        var i = tag.getAttribute('data-i');
        $$('.bz-ss-why').forEach(function (b) { b.classList.remove('on'); });
        $$('.bz-ss-tag').forEach(function (t) { t.classList.remove('on'); });
        var target = $('.bz-ss-why[data-i="' + i + '"]');
        if (target) { target.classList.add('on'); tag.classList.add('on'); }
      });
    });

    var hhGo = $('#bz-hh-go');
    if (hhGo) { hhGo.addEventListener('click', function () { doHehun(r); }); }

    var saveBtn = $('#bz-save');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '存入案例';
      saveBtn.addEventListener('click', function () { saveCase(r); });
    }

    try {
      localStorage.setItem(MEM_KEY, JSON.stringify({
        year: y, month: m, day: d, gender: gender, time: timeStr, city: city, useTST: useTST
      }));
    } catch (e) {}
  }

  /* 合婚：a 是刚排好的主盘，b 由用户在合婚卡片里填 */
  function doHehun(a) {
    var out = $('#bz-hh-out');
    if (!out) { return; }
    var y = parseInt(($('#bz-hh-y') || {}).value, 10);
    var m = parseInt(($('#bz-hh-m') || {}).value, 10);
    var d = parseInt(($('#bz-hh-d') || {}).value, 10);
    var timeStr = (($('#bz-hh-h') || {}).value || '12:00');
    var parts = timeStr.split(':');
    var hh = parseInt(parts[0], 10) || 0;
    var mi = parseInt(parts[1], 10) || 0;
    var gender = (($('#bz-hh-gender') || {}).value) || '女';
    var city = (($('#bz-hh-city') || {}).value) || '北京';

    if (!y || y < 1900 || y > 2100 || !m || m < 1 || m > 12 || !d || d < 1 || d > 31) {
      out.innerHTML = '<div class="bz-tip" style="color:#C0504D;margin-top:10px">对方年月日填写有误。</div>';
      return;
    }
    var probe = new Date(y, m - 1, d);
    if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) {
      out.innerHTML = '<div class="bz-tip" style="color:#C0504D;margin-top:10px">' + y + ' 年 ' + m + ' 月没有 ' + d + ' 日。</div>';
      return;
    }

    var b;
    try {
      b = BaziCore.paipan({ year: y, month: m, day: d, hour: hh, minute: mi, gender: gender,
        useTrueSolar: true, lon: BaziCore.CITY_LON[city] || 120, city: city });
    } catch (e) {
      out.innerHTML = '<div class="bz-tip" style="color:#C0504D;margin-top:10px">排盘出错：' + esc(e.message) + '</div>';
      return;
    }
    var res = hehun(a, b);
    out.innerHTML = '<div style="margin-top:14px">' + hehunHtml(a, b, res) + '</div>';
  }

  /* ---------- 页面接管 ---------- */

  function paint() {
    var main = $('#app .p-main');
    if (!main) { return; }
    if (main.getAttribute('data-ndt-bazi-rendered') === '1') {
      /* 同一页面重复触发（afterRenderInit 之类）不用重画，避免把已排的结果冲掉 */
      if (isBaziPage()) { return; }
    }
    if (!isBaziPage()) { return; }
    ensureStyle();
    main.innerHTML = '<div id="ndt-bazi">' + formHtml() + '</div>';
    main.setAttribute('data-ndt-bazi-rendered', '1');
    var btn = $('#bz-go');
    if (btn) { btn.addEventListener('click', doPaipan); }
    renderCases();
    /* 侧栏高亮切到八字 */
    $$('#app .side-item.is-active, #app .side-item.active').forEach(function (x) { x.classList.remove('is-active'); x.classList.remove('active'); });
    $$('#app .side-item[data-section="bazi"]').forEach(function (x) { x.classList.add('is-active'); });
  }

  function tick() {
    ensureStyle();
    ensureSideItem();
    paint();
  }

  function watch() {
    var app = document.getElementById('app');
    if (!app) { setTimeout(watch, 300); return; }
    var pending = false;
    var obs = new MutationObserver(function () {
      if (pending) { return; }
      pending = true;
      setTimeout(function () { pending = false; tick(); }, 40);
    });
    obs.observe(app, { childList: true, subtree: true });
    tick();
  }

  window.addEventListener('hashchange', function () {
    /* app.js 的 router 在同一 tick 里同步写完 #app，这里退一格再接管 */
    setTimeout(tick, 0);
  });
  window.addEventListener('load', function () { tick(); });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(watch, 0);
  } else {
    document.addEventListener('DOMContentLoaded', watch);
  }
})();
