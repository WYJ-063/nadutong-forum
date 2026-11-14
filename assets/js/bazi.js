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
  /* 胎命身开关：与问真结果页右上角那颗开关一致。
     关＝左列显示「流年 / 大运」，开＝左列显示「身宫 / 命宫 / 胎元」。 */
  var TMS_KEY = 'ndt-bazi-tms';
  /* 站点八个主题的类名（与 app.js 里 themeClasses 一一对应；default 不挂类） */
  var TH_CLS = {
    day: 'theme-day', classic: 'theme-classic', cyber: 'theme-cyber', rose: 'theme-rose',
    aurora: 'theme-aurora', wechat: 'theme-wechat', orange: 'theme-orange'
  };

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
      /* ---- 行式表单 ---- */
      + '#ndt-bazi .bz-rows{margin-top:8px}'
      + '#ndt-bazi .bz-row{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px dashed #EDE9E0;flex-wrap:wrap}'
      + '#ndt-bazi .bz-row:last-child{border-bottom:none}'
      + '#ndt-bazi .bz-rk{flex:0 0 72px;font-size:13px;color:#7A8098;letter-spacing:1px}'
      + '#ndt-bazi .bz-row input[type=text],#ndt-bazi .bz-row input[type=number],'
      + '#ndt-bazi .bz-row select{padding:8px 10px;border:1px solid #E3E7F0;border-radius:8px;background:#fff;'
      + 'font-size:14px;color:#2A2E45;outline:none;font-family:inherit}'
      + '#ndt-bazi .bz-row input:focus,#ndt-bazi .bz-row select:focus{border-color:#B98B3E}'
      + '#ndt-bazi .bz-row .w-y{width:70px}'
      + '#ndt-bazi .bz-radios,#ndt-bazi .bz-checks{display:flex;align-items:center;gap:18px;flex-wrap:wrap}'
      + '#ndt-bazi .bz-radios label,#ndt-bazi .bz-checks label{display:inline-flex;align-items:center;gap:6px;'
      + 'font-size:14px;color:#3A3F58;cursor:pointer}'
      + '#ndt-bazi .bz-tabs{margin-left:auto;display:inline-flex;border:1px solid #E3E7F0;border-radius:999px;padding:3px;background:#fff}'
      + '#ndt-bazi .bz-tabs span{padding:6px 20px;border-radius:999px;font-size:13px;color:#7A8098;cursor:pointer;'
      + 'transition:background .18s,color .18s;letter-spacing:1px}'
      + '#ndt-bazi .bz-tabs span.on{background:#B98B3E;color:#fff}'
      + '#ndt-bazi .bz-date{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;'
      + 'color:#7A8098;flex:1 1 auto;min-width:0}'
      + '#ndt-bazi .bz-select{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;flex-wrap:wrap}'
      + '#ndt-bazi .bz-select select{flex:1 1 0;min-width:104px}'
      + '#ndt-bazi .bz-select .is-off{opacity:.5;cursor:not-allowed}'
      + '#ndt-bazi .bz-unkcity{display:inline-flex;align-items:center;gap:6px;font-size:13px;'
      + 'color:#7A8098;white-space:nowrap;flex:0 0 auto;cursor:pointer}'
      + '#ndt-bazi .bz-go2{display:block;width:100%;margin-top:18px;padding:15px;border:none;border-radius:12px;'
      + 'background:#1E2030 !important;color:#F3E7CB !important;font-size:17px;letter-spacing:6px;cursor:pointer;font-family:inherit}'
      + '#ndt-bazi .bz-go2:active{transform:translateY(1px)}'
      /* ---- 四柱表格 ---- */
      + '#ndt-bazi .bz-tbl{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2px}'
      + '#ndt-bazi .bz-tbl th,#ndt-bazi .bz-tbl td{padding:10px 6px;border-bottom:1px solid #EEF1F6;'
      + 'text-align:center;vertical-align:middle;word-break:break-word}'
      + '#ndt-bazi .bz-tbl thead th{font-size:12px;color:#8A90A8;font-weight:400;letter-spacing:3px;background:#F8F6F1}'
      + '#ndt-bazi .bz-tbl thead th.first{width:60px;letter-spacing:1px}'
      + '#ndt-bazi .bz-tbl tbody th{width:60px;font-size:12px;color:#8A90A8;font-weight:400;letter-spacing:1px;'
      + 'text-align:right;padding-right:10px;background:#FCFBF7}'
      + '#ndt-bazi .bz-tbl .gr{font-size:26px;font-weight:600;letter-spacing:2px;line-height:1.3}'
      + '#ndt-bazi .bz-tbl .cg{font-size:12px;color:#6E7590;line-height:1.7}'
      + '#ndt-bazi .bz-tbl .ln{display:block;line-height:1.78;white-space:nowrap}'
      + '#ndt-bazi .bz-tbl .ssc{font-size:12.5px;color:#8A6A2F;line-height:2.1;letter-spacing:.2px}'
      + '#ndt-bazi .bz-tbl tr[data-r="ss"] td{padding-top:15px;padding-bottom:15px}'
      + '#ndt-bazi .bz-tbl-hint{display:none}'
      + '#ndt-bazi .bz-tbl .unk{color:#C4C9D6;letter-spacing:4px;font-size:20px}'
      + '#ndt-bazi .w-mu{color:#2E7D53}'
      + '#ndt-bazi .w-huo{color:#B34430}'
      + '#ndt-bazi .w-tu{color:#8A5A2B}'
      + '#ndt-bazi .w-jin{color:#967A1F}'
      + '#ndt-bazi .w-shui{color:#2F6699}'
      + '#ndt-bazi .bz-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;min-width:0;max-width:100%}'
      + '#ndt-bazi{min-width:0;max-width:100%}'
      + '#ndt-bazi .bz-card{min-width:0;max-width:100%}'
      + '#ndt-bazi .bz-rows,#ndt-bazi .bz-row,#ndt-bazi .bz-tbl{min-width:0}'
      + '#ndt-bazi .bz-row input,#ndt-bazi .bz-row select{min-width:0;max-width:100%;box-sizing:border-box}'
      + '#ndt-bazi .bz-date select{max-width:46%}'
      + '#ndt-bazi .bz-banner{background:#232019;color:#F0E4C8;border-radius:12px;padding:13px 16px;'
      + 'margin-bottom:14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}'
      + '#ndt-bazi .bz-banner .bn b{font-size:17px;letter-spacing:2px}'
      + '#ndt-bazi .bz-banner .bd{font-size:12px;line-height:1.9;color:#CFC3A7}'
      + '#ndt-bazi .bz-banner .bd b{color:#F0E4C8;font-weight:600}'
      + '#ndt-bazi .bz-banner .zt{font-size:11px;color:#A99C7E;letter-spacing:2px}'
      + '#ndt-bazi .bz-savebar{display:flex;justify-content:flex-end;margin-bottom:10px}'
      + '#ndt-bazi .bz-meta{margin-top:12px;font-size:12px;color:#7A8098;line-height:1.9}'
      + '#ndt-bazi .bz-meta b{color:#2A2E45}'
      + '#ndt-bazi .bz-ss{display:flex;flex-wrap:wrap;gap:8px}'
      + '#ndt-bazi .bz-ss-tag{border:1px solid #E7DCC4;background:#FBF7EF;color:#8A6A2E;border-radius:8px;'
      + 'padding:6px 10px;font-size:13px;cursor:pointer;transition:background .15s}'
      + '#ndt-bazi .bz-ss-tag:hover{background:#F5EDDD}'
      + '#ndt-bazi .bz-ss-tag .p{font-size:11px;opacity:.7;margin-left:4px}'
      + '#ndt-bazi .ss-hit{cursor:pointer}'
      + '#ndt-bazi .ss-hit:hover{color:#B98B3E;text-decoration:underline}'
      + '#ndt-bazi .bz-modal{position:fixed;inset:0;z-index:12000;display:none}'
      + '#ndt-bazi .bz-modal.on{display:block}'
      + '#ndt-bazi .bz-modal-mask{position:absolute;inset:0;background:rgba(12,16,28,.5)}'
      + '#ndt-bazi .bz-modal-card{position:relative;margin:14vh auto 0;max-width:600px;max-height:70vh;'
      + 'overflow:auto;background:#FBF7EF;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.3);'
      + 'padding:16px 20px 18px}'
      + '#ndt-bazi .bz-modal-hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;'
      + 'border-bottom:1px solid #EAE6DC;padding-bottom:8px;margin-bottom:10px}'
      + '#ndt-bazi .bz-modal-hd b{font-size:16px;color:#8A6A2E}'
      + '#ndt-bazi .bz-modal-hd .pos{font-size:12px;color:#9AA0B4}'
      + '#ndt-bazi .bz-modal-x{margin-left:auto;border:0;background:none;font-size:20px;line-height:1;'
      + 'cursor:pointer;color:#9AA0B4;padding:0 2px}'
      + '#ndt-bazi .bz-modal-body{font-size:13px;line-height:1.85;color:#5A6178}'
      + '#ndt-bazi .bz-modal-body .how{font-size:12px;color:#8A7A5E;background:#F3EADA;border-radius:6px;'
      + 'padding:6px 8px;margin:0 0 8px;line-height:1.7;word-break:break-word}'
      + '#ndt-bazi .bz-modal-body .how em{font-style:normal;color:#B98B3E;font-weight:600;margin-right:6px}'
      + '#ndt-bazi .bz-modal-body .mean{word-break:break-word}'
      + '#ndt-bazi .bz-modal-body .src{font-size:11px;color:#9AA0B4;margin-top:10px;padding-top:6px;'
      + 'border-top:1px dashed #EDE8DC}'
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
      + '}'
      + '@media(max-width:560px){'
      + '  #ndt-bazi{padding:0}'
      + '  #ndt-bazi .bz-card{padding:12px;border-radius:12px}'
      + '  #ndt-bazi .bz-row{gap:8px;padding:10px 0}'
      + '  #ndt-bazi .bz-rk{flex:0 0 56px;font-size:12px}'
      + '  #ndt-bazi .bz-row input[type=text],#ndt-bazi .bz-row input[type=number],'
      + '  #ndt-bazi .bz-row select{padding:7px 7px;font-size:13px}'
      + '  #ndt-bazi .bz-row .w-y{width:62px}'
      + '  #ndt-bazi .bz-select select{flex:1 1 0;min-width:0}'
      + '  #ndt-bazi .bz-tabs{margin-left:0}'
      + '  #ndt-bazi .bz-tbl{min-width:calc(46px + var(--bz-cols,6) * 90px)}'
      + '  #ndt-bazi .bz-tbl tbody th{width:46px;font-size:11.5px;padding-right:6px;letter-spacing:0}'
      + '  #ndt-bazi .bz-tbl thead th.first{width:46px;letter-spacing:0}'
      + '  #ndt-bazi .bz-tbl th,#ndt-bazi .bz-tbl td{padding:9px 5px}'
      + '  #ndt-bazi .bz-tbl .gr{font-size:23px;letter-spacing:1px}'
      + '  #ndt-bazi .bz-tbl .cg,#ndt-bazi .bz-tbl .ssc{font-size:12px}'
      + '  #ndt-bazi .bz-tbl .ln{line-height:1.85}'
      + '  #ndt-bazi .bz-tbl .ssc{line-height:2.05}'
      + '  #ndt-bazi .bz-tbl tr[data-r="ss"] td{padding-top:14px;padding-bottom:14px}'
      + '  #ndt-bazi .bz-tbl-hint{display:block;font-size:11px;color:var(--bz-mut);'
      + 'text-align:center;letter-spacing:1px;padding:8px 0 2px}'
      + '  #ndt-bazi .bz-banner{padding:11px 12px;gap:9px}'
      + '  #ndt-bazi .bz-banner .bn b{font-size:15px;letter-spacing:1px}'
      + '  #ndt-bazi .bz-banner .bd{font-size:11.5px;line-height:1.8}'
      + '  #ndt-bazi .bz-banner .zt{font-size:10px}'
      + '  #ndt-bazi .bz-tms{margin-left:auto}'
      + '  #ndt-bazi .bz-go2{padding:13px;font-size:15px;letter-spacing:3px}'
      + '  #ndt-bazi .bz-meta{font-size:11px}'
      + '}'
      /* ---- 主题适配层：颜色全部取自站点 .portal 的 --pt-* 变量，
             默认 / 日间 / 古风卷宗 / 赛博霓虹 / 玫瑰金 / 极光星河 / 微信绿 / 暖橙 八个主题都跟着走 ---- */
      + '#ndt-bazi{--bz-ink:var(--pt-text,#2A2E45);--bz-ink2:var(--pt-text-soft,#4E5674);'
      + '--bz-mut:var(--pt-muted,#8A90A8);--bz-line:var(--pt-border,#E3E7F0);'
      + '--bz-line2:var(--pt-border-soft,#EEF1F6);--bz-bg:var(--pt-panel,#fff);'
      + '--bz-bg2:var(--pt-panel-2,#F8F9FD);--bz-input:var(--pt-input,#fff);'
      + '--bz-acc:var(--pt-accent,#B98B3E);--bz-hi:var(--pt-highlight,#B98B3E);color:var(--bz-ink)}'
      + '#ndt-bazi .bz-head h2,#ndt-bazi .bz-card h3{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-sub,#ndt-bazi .bz-tip,#ndt-bazi .bz-meta,#ndt-bazi .bz-empty,#ndt-bazi .bz-ss-count{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-meta b{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-card{background:var(--bz-bg);border-color:var(--bz-line)}'
      + '#ndt-bazi .bz-card h3::before{background:var(--bz-acc)}'
      + '#ndt-bazi .bz-field label,#ndt-bazi .bz-rk{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-field input,#ndt-bazi .bz-field select,'
      + '#ndt-bazi .bz-row input[type=text],#ndt-bazi .bz-row input[type=number],#ndt-bazi .bz-row select{'
      + 'background:var(--bz-input);border-color:var(--bz-line);color:var(--bz-ink)}'
      + '#ndt-bazi .bz-field input:focus,#ndt-bazi .bz-field select:focus,'
      + '#ndt-bazi .bz-row input:focus,#ndt-bazi .bz-row select:focus{border-color:var(--bz-acc)}'
      + '#ndt-bazi .bz-radios label,#ndt-bazi .bz-checks label{color:var(--bz-ink2)}'
      + '#ndt-bazi .bz-row{border-bottom-color:var(--bz-line2)}'
      + '#ndt-bazi .bz-tabs{background:var(--bz-bg2);border-color:var(--bz-line)}'
      + '#ndt-bazi .bz-tabs span{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-tabs span.on{background:var(--bz-acc);color:#fff}'
      + '#ndt-bazi .bz-date{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-unkcity{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-btn{background:var(--bz-acc);color:#fff}'
      + '#ndt-bazi .bz-btn.ghost{color:var(--bz-acc);border-color:var(--bz-line)}'
      + '#ndt-bazi .bz-tbl th,#ndt-bazi .bz-tbl td{border-bottom-color:var(--bz-line2);color:var(--bz-ink)}'
      + '#ndt-bazi .bz-tbl thead th{background:var(--bz-bg2);color:var(--bz-mut)}'
      + '#ndt-bazi .bz-tbl tbody th{background:var(--bz-bg2);color:var(--bz-mut)}'
      + '#ndt-bazi .bz-tbl .cg{color:var(--bz-ink2)}'
      + '#ndt-bazi .bz-tbl .ssc{color:var(--bz-hi)}'
      + '#ndt-bazi .bz-tbl .unk{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-ss-tag{border-color:var(--bz-line);background:var(--bz-bg2);color:var(--bz-ink2)}'
      + '#ndt-bazi .bz-ss-tag:hover{background:var(--bz-input)}'
      + '#ndt-bazi .ss-hit:hover{color:var(--bz-hi)}'
      + '#ndt-bazi .bz-modal-mask{background:rgba(6,8,16,.62)}'
      + '#ndt-bazi .bz-modal-card{background:var(--bz-bg);color:var(--bz-ink2);border:1px solid var(--bz-line)}'
      + '#ndt-bazi .bz-modal-hd{border-bottom-color:var(--bz-line2)}'
      + '#ndt-bazi .bz-modal-hd b{color:var(--bz-hi)}'
      + '#ndt-bazi .bz-modal-hd .pos,#ndt-bazi .bz-modal-x{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-modal-body{color:var(--bz-ink2)}'
      + '#ndt-bazi .bz-modal-body .how{background:var(--bz-input);color:var(--bz-mut)}'
      + '#ndt-bazi .bz-modal-body .src{border-top-color:var(--bz-line2);color:var(--bz-mut)}'
      + '#ndt-bazi .bz-ss-why{background:var(--bz-bg2);border-left-color:var(--bz-acc);color:var(--bz-ink2)}'
      + '#ndt-bazi .bz-ss-why .how{background:var(--bz-input);color:var(--bz-mut)}'
      + '#ndt-bazi .bz-ss-why .hd b{color:var(--bz-hi)}'
      + '#ndt-bazi .bz-ss-why .src{border-top-color:var(--bz-line2);color:var(--bz-mut)}'
      + '#ndt-bazi .bz-dt-row{border-bottom-color:var(--bz-line2)}'
      + '#ndt-bazi .bz-dt-row .k,#ndt-bazi .bz-dt-row .n,#ndt-bazi .bz-dt-sec{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-dt-why{margin:8px 0 0;padding:9px 11px;border-radius:8px;background:var(--bz-input);'
      + 'font-size:12px;line-height:1.95;color:var(--bz-mut)}'
      + '#ndt-bazi .bz-dt-row .v{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-wx-row .w,#ndt-bazi .bz-hh-k{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-wx-row .bar{background:var(--bz-bg2)}'
      + '#ndt-bazi .bz-wx-row .bar i{background:linear-gradient(90deg,var(--bz-hi),var(--bz-acc))}'
      + '#ndt-bazi .bz-wx-row .num,#ndt-bazi .bz-hh-w{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-dy-cell,#ndt-bazi .bz-ly-cell{background:var(--bz-bg2)}'
      + '#ndt-bazi .bz-dy-cell .g,#ndt-bazi .bz-ly-cell .g{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-dy-cell .a,#ndt-bazi .bz-ly-cell .m{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-dy-cell.now,#ndt-bazi .bz-ln-cell.now{border-color:var(--bz-acc);background:var(--bz-input)}'
      + '#ndt-bazi .bz-ln-cell{background:var(--bz-bg2);border-color:var(--bz-line)}'
      + '#ndt-bazi .bz-ln-cell .g{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-ln-cell .y{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-hh-row{border-top-color:var(--bz-line2)}'
      + '#ndt-bazi .bz-zr-row{border-bottom-color:var(--bz-line2)}'
      + '#ndt-bazi .bz-zr-row .d,#ndt-bazi .bz-zr-row .gz{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-zr-row .w{color:var(--bz-ink2)}'
      + '#ndt-bazi .bz-case-row{background:var(--bz-bg2)}'
      + '#ndt-bazi .bz-case-row .n{color:var(--bz-ink)}'
      + '#ndt-bazi .bz-case-row .f{color:var(--bz-ink2)}'
      + '#ndt-bazi .bz-case-row .d{color:var(--bz-mut)}'
      + '#ndt-bazi .bz-case-open{background:var(--bz-input);border-color:var(--bz-line);color:var(--bz-acc)}'
      + '#ndt-bazi .bz-case-del{background:var(--bz-input);border-color:var(--bz-line);color:#C0544D}'
      /* 五行色：深浅主题下都保持可辨（木火土金水不会因为换主题而失去语义） */
      + '#ndt-bazi .w-mu{color:#2FA36B}'
      + '#ndt-bazi .w-huo{color:#DD4B39}'
      + '#ndt-bazi .w-tu{color:#8E5A2C}'
      + '#ndt-bazi .w-jin{color:#E0B33C}'
      + '#ndt-bazi .w-shui{color:#3E86D8}'
      /* ---- 结果页顶部 banner（照问真结果页：左圆形标 + 姓名 + 阴历阳历两行 + 右侧胎命身开关） ---- */
      + '#ndt-bazi .bz-banner{display:flex;align-items:center;gap:14px;flex-wrap:wrap;'
      + 'background:linear-gradient(100deg,#1B1B18,#2C2519 58%,#1F1C16);color:#F4E9CE;'
      + 'border-radius:14px;padding:13px 16px;margin-bottom:14px}'
      + '#ndt-bazi .bz-banner .logo{flex:0 0 auto;width:46px;height:46px;border-radius:50%;'
      + 'background:rgba(240,228,200,.10);border:1px solid rgba(240,228,200,.35);color:#E8CE93;'
      + 'display:flex;align-items:center;justify-content:center}'
      + '#ndt-bazi .bz-banner .logo svg{width:26px;height:26px}'
      + '#ndt-bazi .bz-banner .bn{flex:1 1 240px;min-width:0}'
      + '#ndt-bazi .bz-banner .bn b{font-size:18px;letter-spacing:2px}'
      + '#ndt-bazi .bz-banner .bd{font-size:12px;line-height:1.95;color:#CFC3A7;margin-top:3px}'
      + '#ndt-bazi .bz-banner .bd b{color:#F4E9CE;font-weight:600}'
      + '#ndt-bazi .bz-banner .bd .zt{color:#A99C7E;margin-left:2px}'
      + '#ndt-bazi .bz-tms{display:inline-flex;align-items:center;gap:9px;font-size:12px;'
      + 'color:#CFC3A7;cursor:pointer;user-select:none;flex:0 0 auto}'
      + '#ndt-bazi .bz-tms input{position:absolute;opacity:0;width:0;height:0}'
      + '#ndt-bazi .bz-tms .sw{width:38px;height:21px;border-radius:11px;background:rgba(255,255,255,.18);'
      + 'position:relative;transition:background .18s}'
      + '#ndt-bazi .bz-tms .sw i{position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;'
      + 'background:#F4E9CE;transition:left .18s}'
      + '#ndt-bazi .bz-tms input:checked + .sw{background:#C9A227}'
      + '#ndt-bazi .bz-tms input:checked + .sw i{left:19px}'
      + '#ndt-bazi .bz-tbl thead th.gong{color:var(--bz-hi)}'
      + '@media(max-width:560px){'
      + '  #ndt-bazi .bz-banner{padding:11px 12px;gap:9px}'
      + '  #ndt-bazi .bz-banner .logo{width:38px;height:38px}'
      + '  #ndt-bazi .bz-banner .logo svg{width:22px;height:22px}'
      + '  #ndt-bazi .bz-banner .bn b{font-size:16px}'
      + '  #ndt-bazi .bz-tbl thead th.gong,#ndt-bazi .bz-tbl thead th.zhu{font-size:11px;letter-spacing:0}'
      + '}';
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- 侧栏入口 ---------- */

  /* 侧栏图标：和 app.js 的 svgIco() 同一套规格（24×24、线宽 1.8、圆头）。
     图形是四根竖柱立在同一根基线上 —— 四根柱就是「四柱」，
     比罗盘更能一眼看出这是个八字排盘入口。 */
  var BAZI_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
    + '<line x1="4" y1="4.6" x2="4" y2="17.4"/><line x1="9.4" y1="4.6" x2="9.4" y2="17.4"/>'
    + '<line x1="14.6" y1="4.6" x2="14.6" y2="17.4"/><line x1="20" y1="4.6" x2="20" y2="17.4"/>'
    + '<line x1="2.2" y1="20.4" x2="21.8" y2="20.4"/></svg>';

  function ensureSideItem() {
    var bar = $('.sidebar');
    if (!bar) { return; }
    var item = $('[' + ITEM_KEY + ']', bar);
    if (!item) {
      /* 必须和 app.js 的 item() 同构：div.side-item + data-section + data-hash。
         app.js 的点击是 document 上的事件委托，靠 data-hash 认路。 */
      item = document.createElement('div');
      item.className = 'side-item';
      item.setAttribute('data-section', 'bazi');
      item.setAttribute('data-hash', HASH);
      item.setAttribute(ITEM_KEY, '1');
      item.innerHTML = BAZI_ICON + '<span class="side-item-label">四柱八字</span>';
    }
    /* 位置：签卜命理组内、「抽签问吉」之后（与 sidebar-order.js 的分组表一致）。
       已存在但被挪到别处（比如落到「其他」）时，这里把它搬回来。
       只在位置不对时才动 DOM —— 否则会和分组重排互相触发，侧栏反复重建。 */
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

  var formCal = 'solar';

  function formHtml() {
    var last = loadLast() || {};
    var now = new Date();
    var y = last.year || (now.getFullYear() - 25);
    formCal = last.cal === 'lunar' ? 'lunar' : 'solar';
    var mm = last.month || 6, dd = last.day || 15;
    var optMon = '', optDay = '', i, j;
    for (i = 1; i <= 12; i++) { optMon += '<option value="' + i + '"' + (mm === i ? ' selected' : '') + '>' + i + '</option>'; }
    for (j = 1; j <= 31; j++) { optDay += '<option value="' + j + '"' + (dd === j ? ' selected' : '') + '>' + j + '</option>'; }

    /* 十二时辰各取中点；子时劈成早子（0 点）与晚子（23 点）。
       晚子按问真排法：日柱仍取当日，只有时干按次日日干起 */
    var HOUR_OPT = [
      ['unknown', '未知时辰'],
      ['00:00', '子时 00:00'], ['02:00', '丑时 02:00'], ['04:00', '寅时 04:00'],
      ['06:00', '卯时 06:00'], ['08:00', '辰时 08:00'], ['10:00', '巳时 10:00'],
      ['12:00', '午时 12:00'], ['14:00', '未时 14:00'], ['16:00', '申时 16:00'],
      ['18:00', '酉时 18:00'], ['20:00', '戌时 20:00'], ['22:00', '亥时 22:00'],
      ['23:00', '晚子时 23:00']
    ];
    var curT = last.time || '12:00';
    var optHour = HOUR_OPT.map(function (h) {
      return '<option value="' + h[0] + '"' + (curT === h[0] ? ' selected' : '') + '>' + h[1] + '</option>';
    }).join('');
    var isMale = last.gender !== '女';

    return ''
      + '<div class="bz-card">'
      + '  <div class="bz-head"><h2>四柱八字</h2><span class="bz-sub">子平法 · 年柱以立春为界 · 月柱以十二节为界</span></div>'
      + '  <div class="bz-rows">'
      + '    <div class="bz-row"><span class="bz-rk">命主姓名</span>'
      + '      <input id="bz-name" type="text" maxlength="12" placeholder="可不填" value="' + esc(last.name || '') + '" style="flex:1 1 0;min-width:0">'
      + '      <span class="bz-rk" style="flex:0 0 auto">分组</span>'
      + '      <input id="bz-group" type="text" maxlength="12" placeholder="如：家人、朋友" value="' + esc(last.group || '') + '" style="width:120px">'
      + '    </div>'
      + '    <div class="bz-row"><span class="bz-rk">性别</span>'
      + '      <div class="bz-radios">'
      + '        <label><input type="radio" name="bz-gender" value="男"' + (isMale ? ' checked' : '') + '>男</label>'
      + '        <label><input type="radio" name="bz-gender" value="女"' + (isMale ? '' : ' checked') + '>女</label>'
      + '      </div>'
      + '      <div class="bz-tabs" id="bz-cal-tabs">'
      + '        <span data-v="solar"' + (formCal === 'solar' ? ' class="on"' : '') + '>公历</span>'
      + '        <span data-v="lunar"' + (formCal === 'lunar' ? ' class="on"' : '') + '>农历</span>'
      + '      </div>'
      + '    </div>'
      + '    <div class="bz-row"><span class="bz-rk">出生时间</span>'
      + '      <div class="bz-date">'
      + '        <input id="bz-y" class="w-y" type="number" min="1900" max="2100" value="' + y + '">年'
      + '        <select id="bz-m">' + optMon + '</select>月'
      + '        <select id="bz-d">' + optDay + '</select>日'
      + '        <select id="bz-h">' + optHour + '</select>'
      + '        <label id="bz-leap-wrap" style="display:' + (formCal === 'lunar' ? 'inline-flex' : 'none') + '">'
      + '          <input id="bz-leap" type="checkbox">闰月</label>'
      + '      </div>'
      + '    </div>'
      + '    <div class="bz-row"><span class="bz-rk">出生地址</span>'
      + '      <div class="bz-select">'
      + '        <select id="bz-prov" aria-label="省"></select>'
      + '        <select id="bz-city" aria-label="市"></select>'
      + '        <select id="bz-dist" aria-label="区县"></select>'
      + '      </div>'
      + '    </div>'
      + '    <div class="bz-row"><span class="bz-rk">乡镇街道</span>'
      + '      <div class="bz-select">'
      + '        <input id="bz-town" type="text" maxlength="24" placeholder="乡镇 / 街道，选填" style="flex:1 1 0;min-width:0">'
      + '        <label class="bz-unkcity"><input type="checkbox" id="bz-unk-city"' + (last.unkCity ? ' checked' : '') + '>未知地</label>'
      + '      </div>'
      + '    </div>'
      + '    <div class="bz-row"><span class="bz-rk">选项</span>'
      + '      <div class="bz-checks">'
      + '        <label><input id="bz-tst" type="checkbox"' + (last.useTST === false ? '' : ' checked') + '>真太阳时</label>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '  <div class="bz-tip" id="bz-tst-note" style="margin-top:10px"></div>'
      + '  <button class="bz-go2" id="bz-go">开始排盘</button>'
      + '</div>'
      + '<div class="bz-card"><h3>案例存档</h3><div id="bz-cases"></div></div>'
      + '<div class="bz-out" id="bz-out"><div class="bz-empty">填好出生信息后点「开始排盘」</div></div>';
  }

  /* ---------- 出生地址：省 / 市 / 区县 三级联动 ----------
     选项来自 window.BAZI_REGION（全国 34 个省级、2875 个区县；
     bazi-region.js 头注释写了数据源）。经度取该区县行政区划中心点，
     用于真太阳时换算。乡镇街道是自由填写的文字，只记录不参与换算。 */

  function regionData() { return window.BAZI_REGION || []; }

  var ADDR_IDS = ['bz-prov', 'bz-city', 'bz-dist'];
  var HH_ADDR_IDS = ['bz-hh-prov', 'bz-hh-city', 'bz-hh-dist'];

  function addrFillCity(keepName, ids) {
    var id = ids || ADDR_IDS;
    var R = regionData();
    var ps = $('#' + id[0]), cs = $('#' + id[1]);
    if (!ps || !cs) { return; }
    var p = R[Number(ps.value)] || R[0];
    cs.innerHTML = (p ? p.c : []).map(function (c, i) {
      var sel = (keepName && c.n === keepName) ? ' selected' : '';
      return '<option value="' + i + '"' + sel + '>' + esc(c.n) + '</option>';
    }).join('');
    addrFillDist(null, id);
  }

  function addrFillDist(keepName, ids) {
    var id = ids || ADDR_IDS;
    var R = regionData();
    var ps = $('#' + id[0]), cs = $('#' + id[1]), ds = $('#' + id[2]);
    if (!ps || !cs || !ds) { return; }
    var p = R[Number(ps.value)] || R[0];
    var c = (p && p.c[Number(cs.value || 0)]) || null;
    ds.innerHTML = (c ? c.d : []).map(function (d, i) {
      var sel = (keepName && d[1] === keepName) ? ' selected' : '';
      return '<option value="' + i + '"' + sel + '>' + esc(d[1]) + '</option>';
    }).join('');
  }

  /* 当前选中的地址 */
  function addrNow(ids) {
    var id = ids || ADDR_IDS;
    var R = regionData();
    var ps = $('#' + id[0]), cs = $('#' + id[1]), ds = $('#' + id[2]);
    var p = R[Number(ps && ps.value)] || R[0] || null;
    var c = (p && p.c[Number(cs && cs.value)]) || null;
    var d = (c && c.d[Number(ds && ds.value)]) || null;
    var town = ids ? '' : (($('#bz-town') || {}).value || '').replace(/^\s+|\s+$/g, '');
    return {
      p: p, c: c, d: d, town: town,
      lon: d ? Number(d[2]) : null,
      text: [p && p.n, c && c.n, d && d[1], town].filter(Boolean).join(' ')
    };
  }

  /* 按文字回填（旧存档、案例里存的是地名文字）：逐级找省 → 市 → 区县 */
  function addrApply(name, ids) {
    var id = ids || ADDR_IDS;
    var R = regionData();
    var ps = $('#' + id[0]), cs = $('#' + id[1]), ds = $('#' + id[2]);
    if (!ps || !cs || !ds || !R.length) { return false; }
    var parts = String(name || '').split(/[\s,，]+/).filter(Boolean);
    if (parts.length >= 2) {
      var pi = -1, ci = -1, di = -1, i, j, k;
      for (i = 0; i < R.length; i++) { if (R[i].n === parts[0]) { pi = i; break; } }
      if (pi >= 0) {
        for (j = 0; j < R[pi].c.length; j++) { if (R[pi].c[j].n === parts[1]) { ci = j; break; } }
        if (ci >= 0 && parts[2]) {
          for (k = 0; k < R[pi].c[ci].d.length; k++) { if (R[pi].c[ci].d[k][1] === parts[2]) { di = k; break; } }
        }
      }
      if (pi >= 0 && ci >= 0) {
        ps.value = String(pi);
        addrFillCity(R[pi].c[ci].n, id);
        cs.value = String(ci);
        addrFillDist(di >= 0 ? R[pi].c[ci].d[di][1] : null, id);
        if (di >= 0) { ds.value = String(di); }
        return true;
      }
    }
    var one = parts[0] || '';
    if (!one) { return false; }
    var pIdx = -1, cIdx = -1, dIdx = -1, i2, j2, k2;
    for (i2 = 0; i2 < R.length && pIdx < 0; i2++) {
      if (R[i2].n.indexOf(one) === 0) { pIdx = i2; }
    }
    if (pIdx < 0) {
      for (i2 = 0; i2 < R.length && pIdx < 0; i2++) {
        for (j2 = 0; j2 < R[i2].c.length && pIdx < 0; j2++) {
          if (R[i2].c[j2].n.indexOf(one) === 0) { pIdx = i2; cIdx = j2; }
        }
      }
    }
    if (pIdx < 0) {
      for (i2 = 0; i2 < R.length && pIdx < 0; i2++) {
        for (j2 = 0; j2 < R[i2].c.length && pIdx < 0; j2++) {
          for (k2 = 0; k2 < R[i2].c[j2].d.length && pIdx < 0; k2++) {
            if (R[i2].c[j2].d[k2][1].indexOf(one) === 0) { pIdx = i2; cIdx = j2; dIdx = k2; }
          }
        }
      }
    }
    if (pIdx < 0) { return false; }
    ps.value = String(pIdx);
    addrFillCity(cIdx >= 0 ? R[pIdx].c[cIdx].n : null, id);
    if (cIdx >= 0) {
      cs.value = String(cIdx);
      addrFillDist(dIdx >= 0 ? R[pIdx].c[cIdx].d[dIdx][1] : null, id);
      if (dIdx >= 0) { ds.value = String(dIdx); }
    }
    return true;
  }

  /* 「未知地」勾上后锁掉三级下拉 */
  function addrLock(lock) {
    var ids = ['bz-prov', 'bz-city', 'bz-dist', 'bz-town'];
    ids.forEach(function (id) {
      var el = $('#' + id);
      if (el) { el.disabled = !!lock; el.classList[lock ? 'add' : 'remove']('is-off'); }
    });
  }

  /* 首次渲染时把省列表填上，并恢复上次的选择 */
  function addrInit() {
    var R = regionData();
    var ps = $('#bz-prov');
    if (!ps || !R.length) { return; }
    ps.innerHTML = R.map(function (p, i) { return '<option value="' + i + '">' + esc(p.n) + '</option>'; }).join('');
    var last = loadLast() || {};
    var a = last.addr;
    if (a && a.p !== undefined) {
      ps.value = String(a.p);
      addrFillCity(a.cn || null);
      var cs = $('#bz-city');
      if (cs && a.c !== undefined) { cs.value = String(a.c); addrFillDist(a.dn || null); }
      var ds = $('#bz-dist');
      if (ds && a.d !== undefined) { ds.value = String(a.d); }
    } else if (last.city && last.city !== 'unknown' && last.city !== '未知地') {
      addrApply(last.city);
    } else {
      addrApply('北京市');
    }
    var townEl = $('#bz-town');
    if (townEl) { townEl.value = last.town || ''; }
    var unkEl = $('#bz-unk-city');
    if (unkEl) {
      if (last.unkCity) { unkEl.checked = true; }
      addrLock(unkEl.checked);
    }
  }

  /* 表单联动：历法切换、时辰未知/地址未知时关掉真太阳时并给出说明 */
  function bindForm() {
    $$('#bz-cal-tabs span').forEach(function (s) {
      s.addEventListener('click', function () {
        $$('#bz-cal-tabs span').forEach(function (x) { x.classList.remove('on'); });
        s.classList.add('on');
        formCal = s.getAttribute('data-v');
        var lp = $('#bz-leap-wrap');
        if (lp) { lp.style.display = formCal === 'lunar' ? 'inline-flex' : 'none'; }
        syncFormNote();
      });
    });
    var ps = $('#bz-prov'), cs = $('#bz-city'), ds = $('#bz-dist'), unkEl = $('#bz-unk-city');
    if (ps) { ps.addEventListener('change', function () { addrFillCity(null); syncFormNote(); }); }
    if (cs) { cs.addEventListener('change', function () { addrFillDist(null); syncFormNote(); }); }
    if (ds) { ds.addEventListener('change', syncFormNote); }
    if (unkEl) { unkEl.addEventListener('change', function () { addrLock(unkEl.checked); syncFormNote(); }); }
    var hEl = $('#bz-h');
    if (hEl) { hEl.addEventListener('change', syncFormNote); }
    var townEl = $('#bz-town');
    if (townEl) { townEl.addEventListener('input', syncFormNote); }
    if (unkEl) { addrLock(unkEl.checked); }
    var tst = $('#bz-tst');
    if (tst) { tst.addEventListener('change', syncFormNote); }
    syncFormNote();
  }

  function syncFormNote() {
    var unkCity = !!($('#bz-unk-city') && $('#bz-unk-city').checked);
    var t = (($('#bz-h') || {}).value) || '';
    var tst = $('#bz-tst');
    var unkHour = t === 'unknown';
    if (tst && (unkCity || unkHour)) {
      tst.disabled = true;
      tst.checked = false;
    } else if (tst) {
      tst.disabled = false;
    }
    var a = addrNow();
    var parts = [];
    if (unkCity) {
      parts.push('出生地未填，经度按东经 120° 计，不做真太阳时校正');
    } else if (a.lon !== null && !isNaN(a.lon)) {
      parts.push('出生地 ' + (a.text || '—') + '，经度 东经 ' + a.lon.toFixed(2) + '°');
      parts.push(tst && tst.checked ? '已按经度与均时差校正' : '未勾选真太阳时，按北京时间排');
    }
    if (unkHour) { parts.push('时辰未知，只排年、月、日三柱'); }
    var box = $('#bz-tst-note');
    if (box) { box.textContent = parts.join('　｜　'); }
  }

  /* ---------- 渲染 ---------- */

  var PILLAR_LABEL = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };
  var PILLAR_SHORT = { year: '年', month: '月', day: '日', hour: '时' };
  var WX_CLASS = { '木': 'w-mu', '火': 'w-huo', '土': 'w-tu', '金': 'w-jin', '水': 'w-shui' };

  function gzSpan(ch, isGan) {
    if (!ch) { return ''; }
    var wx = isGan ? BaziCore.GAN_WX[BaziCore.GAN.indexOf(ch)] : BaziCore.ZHI_WX[BaziCore.ZHI.indexOf(ch)];
    return '<span class="' + (WX_CLASS[wx] || '') + '">' + esc(ch) + '</span>';
  }

  /* 结果表：照问真的排法 —— 列＝身宫 / 命宫 / 胎元 / 年柱 / 月柱 / 日柱 / 时柱，
     行＝主星 / 天干 / 地支 / 藏干 / 星运 / 自坐 / 空亡 / 纳音 / 神煞。
     问真的藏干行里直接带十神（「己伤官」），没有单独的「副星」行。 */
  /* 胎命身开关：与问真一样记住上次选择，默认关闭 */
  function tmsOn() {
    try { return localStorage.getItem(TMS_KEY) === 'on'; } catch (e) { return false; }
  }
  function setTms(on) {
    try { localStorage.setItem(TMS_KEY, on ? 'on' : 'off'); } catch (e) {}
  }

  function pillarTable(r, opts) {
    opts = opts || {};
    var e = r.extra || {};
    var ny = e.nayin || {};
    var cgA = r.cangGan || {};
    var xkA = e.xunKongAll || {};
    var xyA = e.xingYun || {};
    var zzA = e.ziZuo || {};
    var unknown = !!r.hourUnknown;
    var gender = (r.input && r.input.gender) || '男';
    var ssList = r.shensha || [];
    var gong = e.columns || [];

    /* 神煞名点一下弹窗看释义，所以每个名字都要带上 data-ss（名）与 data-pos（哪一柱） */
    function ssOf(list, pillarName) {
      return list.filter(function (s) { return s.pillar === pillarName; })
        .map(function (s) {
          return '<span class="ln ss-hit" data-ss="' + esc(s.name) + '" data-pos="' + esc(pillarName) + '">'
            + esc(s.name) + '</span>';
        }).join('');
    }
    /* 问真结果表把「藏干」和「副星」拆成上下两行：
       藏干行只列地支所藏的天干（带五行色），副星行是这些藏干对日主的十神。 */
    function cangHtml(list) {
      if (!list || !list.length) { return '—'; }
      return list.map(function (x) {
        var wx = BaziCore.GAN_WX[BaziCore.GAN.indexOf(x.gan)];
        return '<span class="ln ' + (WX_CLASS[wx] || '') + '">' + esc(x.gan) + '</span>';
      }).join('');
    }
    function fuHtml(list) {
      if (!list || !list.length) { return '—'; }
      return list.map(function (x) {
        return '<span class="ln">' + esc(x.god) + '</span>';
      }).join('');
    }

    /* 胎命身开关：开＝左三列取身宫/命宫/胎元；关＝左两列取当前的流年、大运
       （问真结果页就是这两种排列，开关在 banner 右上角） */
    var mode = opts.mode === 'gong' ? 'gong' : 'yun';

    var dayGanIdx = BaziCore.GAN.indexOf(r.dayMaster.gan);
    var nowY = new Date().getFullYear();
    var lnCur = null, dyCur = null;
    (r.liunian || []).forEach(function (x) { if (x.year === nowY) { lnCur = x; } });
    var dyList = (r.dayun && r.dayun.list) || [];
    for (var di = 0; di < dyList.length; di++) { if (nowY >= dyList[di].startYear) { dyCur = dyList[di]; } }

    var yunSs = [];
    if (mode === 'yun' && (lnCur || dyCur)) {
      var extraCols = [];
      if (lnCur) { extraCols.push({ gz: { gan: lnCur.gan, zhi: lnCur.zhi } }); }
      if (dyCur) { extraCols.push({ gz: { gan: dyCur.gan, zhi: dyCur.zhi } }); }
      try { yunSs = BaziCore.findShenSha(r.pillars, gender, extraCols, ['流年', '大运', '']); }
      catch (err) { yunSs = []; }
    }
    function yunCol(label, g, z) {
      var gi = BaziCore.GAN.indexOf(g), zi = BaziCore.ZHI.indexOf(z);
      var cang = BaziCore.tenGodsOfZhi(dayGanIdx, zi);
      return {
        label: label, yun: true,
        god: esc(BaziCore.tenGod(dayGanIdx, gi)),
        gan: gzSpan(g, true),
        zhi: gzSpan(z, false),
        cang: cangHtml(cang),
        fu: fuHtml(cang),
        xy: esc(BaziCore.changShengOf(dayGanIdx, zi)),
        zz: esc(BaziCore.changShengOf(gi, zi)),
        xk: esc(BaziCore.xunKongOf(gi, zi).text),
        ny: esc(BaziCore.nayinOf(gi, zi).name),
        ss: ssOf(yunSs, label)
      };
    }

    var cols = [];
    if (mode === 'yun') {
      if (lnCur) { cols.push(yunCol('流年', lnCur.gan, lnCur.zhi)); }
      if (dyCur) { cols.push(yunCol('大运', dyCur.gan, dyCur.zhi)); }
    } else {
      /* 前三列：身宫 / 命宫 / 胎元（时辰未知时前两列不排，问真也只给胎元） */
      ['身宫', '命宫', '胎元'].forEach(function (lab, i) {
        var c = gong[i];
        if (!c) {
          cols.push({
            label: lab, gong: true, god: '—', gan: '—', zhi: '—',
            cang: '—', fu: '—', xy: '—', zz: '—', xk: '—', ny: '—', ss: '—'
          });
          return;
        }
        cols.push({
          label: lab, gong: true,
          god: esc(c.god || ''),
          gan: gzSpan(c.gan, true),
          zhi: gzSpan(c.zhi, false),
          cang: cangHtml(c.cang),
          fu: fuHtml(c.cang),
          xy: esc(c.xy || ''),
          zz: esc(c.zz || ''),
          xk: esc(c.xk || ''),
          ny: esc((c.ny && c.ny.name) || ''),
          ss: ssOf(ssList, lab)
        });
      });
    }
    /* 后四列：四柱 */
    ['year', 'month', 'day', 'hour'].forEach(function (k) {
      var p = r.pillars[k] || {};
      if (k === 'hour' && unknown) {
        cols.push({
          label: PILLAR_LABEL[k], god: '未知', gan: '<span class="unk">未知</span>',
          zhi: '<span class="unk">未知</span>', cang: '—', fu: '—', xy: '—',
          zz: '—', xk: '—', ny: '—', ss: '—'
        });
        return;
      }
      cols.push({
        label: PILLAR_LABEL[k],
        god: esc(k === 'day' ? (gender === '女' ? '元女' : '元男') : (p.god || '')),
        gan: gzSpan(p.gan, true),
        zhi: gzSpan(p.zhi, false),
        cang: cangHtml(cgA[k]),
        fu: fuHtml(cgA[k]),
        xy: esc(xyA[k] || ''),
        zz: esc(zzA[k] || ''),
        xk: esc(xkA[k] || ''),
        ny: esc(ny[k] ? ny[k].name : ''),
        ss: ssOf(ssList, PILLAR_SHORT[k])
      });
    });

    var TROWS = [
      ['主星', 'god', ''],
      ['天干', 'gan', 'gr'],
      ['地支', 'zhi', 'gr'],
      ['藏干', 'cang', 'cg'],
      ['副星', 'fu', 'cg'],
      ['星运', 'xy', ''],
      ['自坐', 'zz', ''],
      ['空亡', 'xk', ''],
      ['纳音', 'ny', ''],
      ['神煞', 'ss', 'ssc']
    ];

    var head = '<thead><tr><th class="first">日期</th>'
      + cols.map(function (c) {
        return '<th class="' + (c.gong ? 'gong' : 'zhu') + '">' + esc(c.label) + '</th>';
      }).join('') + '</tr></thead>';
    var body = TROWS.map(function (rw) {
      return '<tr data-r="' + rw[1] + '"><th>' + rw[0] + '</th>'
        + cols.map(function (c) { return '<td class="' + (rw[2] || '') + '">' + c[rw[1]] + '</td>'; }).join('')
        + '</tr>';
    }).join('');

    return '<div class="bz-tbl-wrap"><table class="bz-tbl" data-mode="' + mode + '" style="--bz-cols:' + cols.length + '">'
      + head + '<tbody>' + body + '</tbody></table></div>'
      + '<div class="bz-tbl-hint">左右滑动查看各柱 · 共 ' + cols.length + ' 列</div>';
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

  /* 神煞解释改成点表格里的名字弹窗，原来那一整块「神煞（点开看解释）」卡片不再出现 */
  function ssTipHtml(r) {
    if (!r.shensha.length) { return ''; }
    return '<div class="bz-tip" style="margin-top:6px">神煞名点一下看古诀查法与原文释义，本盘共命中 '
      + r.shensha.length + ' 条。释义与查法照抄问真八字官网（pcbz.iwzwh.com）神煞条目原文。</div>';
  }

  function ssModalHtml() {
    return '<div class="bz-modal" id="bz-ss-modal" aria-hidden="true">'
      + '  <div class="bz-modal-mask" data-ss-close="1"></div>'
      + '  <div class="bz-modal-card" role="dialog" aria-modal="true" aria-labelledby="bz-ss-name">'
      + '    <div class="bz-modal-hd"><b id="bz-ss-name">神煞</b><span class="pos" id="bz-ss-pos"></span>'
      + '      <button class="bz-modal-x" data-ss-close="1" aria-label="关闭">×</button></div>'
      + '    <div class="bz-modal-body" id="bz-ss-body"></div>'
      + '  </div>'
      + '</div>';
  }

  function openSs(name, pos) {
    var info = (BaziCore.SHENSHA_INFO || {})[name] || {};
    var m = document.getElementById('bz-ss-modal');
    if (!m) { return; }
    var nm = document.getElementById('bz-ss-name');
    var ps = document.getElementById('bz-ss-pos');
    var bd = document.getElementById('bz-ss-body');
    if (nm) { nm.textContent = name || '神煞'; }
    if (ps) {
      var posTxt = pos || '';
      if (posTxt === '年' || posTxt === '月' || posTxt === '日' || posTxt === '时') { posTxt += '柱'; }
      ps.textContent = posTxt;
    }
    var h = '';
    if (info.how) { h += '<div class="how"><em>古诀查法</em>' + srcText(info.how) + '</div>'; }
    h += '<div class="mean">' + (info.desc ? srcText(info.desc) : '<span>该神煞暂无释义。</span>') + '</div>';
    h += '<div class="src">出处：问真八字官网（pcbz.iwzwh.com）神煞条目原文</div>';
    if (bd) { bd.innerHTML = h; }
    m.classList.add('on');
    m.setAttribute('aria-hidden', 'false');
  }

  function closeSs() {
    var m = document.getElementById('bz-ss-modal');
    if (!m) { return; }
    m.classList.remove('on');
    m.setAttribute('aria-hidden', 'true');
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
      + row('命宫', e.mingGong.gz
        ? '<b>' + esc(e.mingGong.gz) + '</b>' + (e.mingGong.nayin ? '（' + esc(e.mingGong.nayin.name) + '）' : '')
        : '—', e.mingGong.gz ? '依月支与时支推' : (e.mingGong.note || ''))
      + row('身宫', e.shenGong.gz
        ? '<b>' + esc(e.shenGong.gz) + '</b>' + (e.shenGong.nayin ? '（' + esc(e.shenGong.nayin.name) + '）' : '')
        : '—', e.shenGong.gz ? '依月支与时支推' : (e.shenGong.note || ''))
      + row('旬空', '<b>' + esc(e.xunKong.text) + '</b>', '日柱所在旬所缺二支')
      + row('月令旺衰', '<b>' + esc(e.wangShuai.state) + '</b>', e.wangShuai.note)
      + row('格局', '<b>' + esc(e.geju.name) + '</b>', e.geju.note)
      + '<div class="bz-dt-sec">五行力量</div>'
      + '<div class="bz-wx">' + bars + '</div>'
      + '<div class="bz-dt-row"><span class="k">日主强弱</span>'
      + '<span class="v" style="color:' + ssTone + '"><b>' + esc(s.level) + '</b></span>'
      + '<span class="n">同党占 ' + s.ratio + '%（比劫＋印为同党）</span></div>'
      + '<div class="bz-dt-why">综合判定：' + esc(strengthWhy(r)) + '</div>';
  }

  /* 日主强弱的判定依据：把「月令 vs 同党」这层关系写成一句可核对的说明，
     省得 50% 同党却判偏弱看着像自相矛盾 */
  function strengthWhy(r) {
    var e = r.extra || {};
    var ws = e.wangShuai || {};
    var s = e.strength || {};
    var dayGan = r.pillars.day.gan;
    var monthZhi = r.pillars.month.zhi;
    var dwx = BaziCore.GAN_WX[BaziCore.GAN.indexOf(dayGan)];
    var mwx = BaziCore.ZHI_WX[BaziCore.ZHI.indexOf(monthZhi)];
    var deLing = (ws.state === '旺' || ws.state === '相');
    var lv = String(s.level || '');
    var head = '日主' + dayGan + '（' + dwx + '）生于' + monthZhi + '月，' + mwx + '当令、日主' + (deLing ? '得令' : '失令');
    if (!deLing) { head += '（月令' + mwx + '旺' + dwx + '弱）'; }
    var tail;
    if (lv === '中和') {
      tail = '同党（比劫＋印）占 ' + s.ratio + '%，与月令的耗泄大致相当，故判中和。';
    } else if (deLing) {
      tail = '同党（比劫＋印）占 ' + s.ratio + '%，又得月令生扶，故判' + lv + '。';
    } else if (lv.indexOf('强') >= 0) {
      tail = '同党（比劫＋印）占 ' + s.ratio + '%，已过六成、比劫与印成势，虽失月令仍判' + lv + '。';
    } else {
      tail = '同党（比劫＋印）占 ' + s.ratio + '%，但月令权重最大，同党之力抵不过月令，故判' + lv + '。';
    }
    return head + '；' + tail;
  }

  function dayunHtml(r) {
    /* 起运：startAge 是周岁小数（天数÷3 得来的），拆成 X 年 Y 个月；
       虚岁＝周岁＋１，问真大运的岁数标签用的就是虚岁 */
    var sa = r.dayun.startAge;
    var sy = Math.floor(sa), sm = Math.round((sa - sy) * 12);
    if (sm >= 12) { sy += 1; sm -= 12; }
    var zhou = Math.round(sa), xu = zhou + 1;
    var d0 = new Date(r.input.year, r.input.month - 1, r.input.day);
    var d1 = new Date(d0.getFullYear(), d0.getMonth() + sm, d0.getDate());
    d1.setFullYear(d1.getFullYear() + sy);
    var jiaoDate = d1.getFullYear() + '年' + (d1.getMonth() + 1) + '月' + d1.getDate() + '日';
    var nowAge = new Date().getFullYear() - r.input.year;
    var cells = r.dayun.list.map(function (d) {
      var isNow = nowAge >= d.startAge && nowAge < d.startAge + 10;
      return '<div class="bz-dy-cell' + (isNow ? ' now' : '') + '">'
        + '<div class="a">' + (d.startAge + 1) + '岁（虚）</div>'
        + '<div class="g">' + esc(d.name) + '</div>'
        + '<div class="t">' + esc(d.tenGod) + '</div>'
        + '</div>';
    }).join('');
    var dir = r.dayun.forward ? '顺排' : '逆排';
    return '<div class="bz-tip" style="margin-bottom:10px">'
      + dir + ' · 出生后 ' + sy + '年' + sm + '个月 起运（约 ' + zhou + ' 周岁，' + xu + ' 虚岁起运）· 首运交于 ' + jiaoDate
      + '<br>大运年龄按虚岁标（虚岁＝周岁＋１），与问真八字一致。'
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
    var unk = !!r.hourUnknown;
    var tstLine = '';
    if (tst) {
      tstLine = '真太阳时 <b>' + pad(tst.hh) + ':' + pad(tst.mi) + '</b>'
        + '（较北京时间 ' + (tst.deltaMin >= 0 ? '+' : '') + tst.deltaMin + ' 分钟'
        + (tst.dayShift ? '，跨至' + (tst.dayShift > 0 ? '次日' : '前一日') : '') + '）';
    }
    var birth = r.input.year + '年' + r.input.month + '月' + r.input.day + '日 '
      + (unk ? '未知时辰' : pad(r.input.hour) + ':' + pad(r.input.minute));
    var lunarLine = '';
    if (window.BaziLunar) {
      var lu = BaziLunar.solarToLunar(r.input.year, r.input.month, r.input.day);
      if (lu) { lunarLine = esc(lu.text); }
    }
    var nm = (($('#bz-name') || {}).value || '').trim() || '未命名';
    var zao = (r.input.gender === '女') ? '坤造' : '乾造';
    return ''
      + '<div class="bz-card">'
      + '  <div class="bz-savebar">'
      + '    <button class="bz-btn" id="bz-save">存入案例</button>'
      + '  </div>'
      + '  <div class="bz-banner">'
      + '    <span class="logo">' + BAZI_ICON + '</span>'
      + '    <div class="bn"><b>' + esc(nm) + '</b>'
      + '      <div class="bd">'
      + '        <div>' + (lunarLine ? '阴历 <b>' + lunarLine + '</b>' : '阴历 <b>—</b>')
      + '          <span class="zt">（' + zao + (unk ? ' · 时辰未知' : '') + '）</span></div>'
      + '        <div>阳历 <b>' + esc(birth) + '</b>' + (tst ? '<span class="zt">（已按真太阳时换算）</span>' : '') + '</div>'
      + '        <div>出生地 <b>' + esc(r.input.city || '未知地') + '</b>'
      + (r.input.cityUnknown ? '<span class="zt">（按东经 120° 计）</span>'
        : '<span class="zt">（东经 ' + (Number(r.input.lon) || 120).toFixed(2) + '°）</span>') + '</div>'
      + '      </div>'
      + '    </div>'
      + '    <label class="bz-tms" title="打开后左列排身宫 / 命宫 / 胎元；关闭则排流年 / 大运">'
      + '      <input type="checkbox" id="bz-tms"' + (tmsOn() ? ' checked' : '') + '>'
      + '      <span class="sw"><i></i></span><span>胎命身</span>'
      + '    </label>'
      + '  </div>'
      + '<div id="bz-tbl-host">' + pillarTable(r, { mode: tmsOn() ? 'gong' : 'yun' }) + '</div>'
      + '  <div class="bz-meta">'
      + '    生肖 <b>' + esc(r.shengxiao) + '</b>　日主 <b>' + esc(r.dayMaster.gan + '（' + r.dayMaster.wx + '·' + r.dayMaster.yinyang + '）') + '</b>'
      + (tstLine ? '<br>' + tstLine : '')
      + (r.jieqi.jie ? '<br>生于 <b>' + esc(r.jieqi.jie) + '</b> 之后，月令为 <b>' + esc(r.pillars.month.zhi) + '</b>' : '')
      + (unk ? '<br>时辰未知，时柱与涉及时支的神煞不排；命宫、身宫须以时支推，此处不给。' : '')
      + ssTipHtml(r)
      + '  </div>'
      + '</div>'
      + '<div class="bz-card">' + detailHtml(r) + '</div>'
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
      + '    <div class="bz-field" style="flex:1 1 100%"><label>对方出生地</label>'
      + '      <div class="bz-select" style="flex:1 1 auto">'
      + '        <select id="bz-hh-prov" aria-label="省"></select>'
      + '        <select id="bz-hh-city" aria-label="市"></select>'
      + '        <select id="bz-hh-dist" aria-label="区县"></select>'
      + '      </div></div>'
      + '  </div>'
      + '  <div class="bz-actions"><button class="bz-btn ghost" id="bz-hh-go">测 合 婚</button></div>'
      + '  <div id="bz-hh-out"></div>'
      + '</div>'
      + '<div class="bz-card"><h3>流月 · ' + new Date().getFullYear() + ' 年</h3>' + liuyueHtml(r) + '</div>'
      + '<div class="bz-card"><h3>择日 · 建除十二神</h3>' + zeriHtml(r) + '</div>'
      + ssModalHtml();
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
        && c.input.hour === r.input.hour && c.input.minute === r.input.minute
        && !!c.input.hourUnknown === !!r.input.hourUnknown);
    });
    arr.unshift({
      id: id, name: name || '未命名', group: group, savedAt: Date.now(),
      input: r.input,
      four: [r.pillars.year, r.pillars.month, r.pillars.day, r.pillars.hour]
        .map(function (p) { return (p.gan + p.zhi) || '未知'; }).join(' '),
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
    /* 存档里的 year/month/day 已是折算后的公历，回填一律按公历排，避免二次折算 */
    formCal = 'solar';
    $$('#bz-cal-tabs span').forEach(function (x) {
      x.classList.toggle('on', x.getAttribute('data-v') === 'solar');
    });
    if ($('#bz-leap-wrap')) { $('#bz-leap-wrap').style.display = 'none'; }
    if ($('#bz-leap')) { $('#bz-leap').checked = false; }
    if ($('#bz-name')) { $('#bz-name').value = c.name === '未命名' ? '' : c.name; }
    if ($('#bz-group')) { $('#bz-group').value = c.group || ''; }
    $('#bz-y').value = c.input.year;
    $('#bz-m').value = String(c.input.month);
    $('#bz-d').value = String(c.input.day);
    var sel = $('#bz-h');
    if (sel) {
      var hv = c.input.hourUnknown ? 'unknown' : (pad(c.input.hour) + ':' + pad(c.input.minute));
      var found = false;
      for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === hv) { found = true; break; } }
      sel.value = found ? hv : '12:00';
    }
    $$('#ndt-bazi input[name="bz-gender"]').forEach(function (el) {
      el.checked = el.value === (c.input.gender || '男');
    });
    if ($('#bz-city')) {
      if (c.input.cityUnknown) {
        if ($('#bz-unk-city')) { $('#bz-unk-city').checked = true; }
        addrLock(true);
      } else {
        if ($('#bz-unk-city')) { $('#bz-unk-city').checked = false; }
        addrLock(false);
        addrApply(c.input.city || '北京市');
        if (c.input.town && $('#bz-town')) { $('#bz-town').value = c.input.town; }
      }
    }
    if ($('#bz-tst')) { $('#bz-tst').checked = c.input.useTrueSolar !== false && !c.input.hourUnknown && !c.input.cityUnknown; }
    syncFormNote();
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
      add('日干相合', 14, '两人日主天干五合（' + a.pillars.day.gan + '·' + b.pillars.day.gan + '）。');
    } else if (ag === bg) {
      add('日干同气', 4, '两人日主同为' + a.pillars.day.gan + '，比肩同气。');
    } else {
      add('日干无合', 0, '日主天干不在五合之内（' + a.pillars.day.gan + '·' + b.pillars.day.gan + '）。');
    }

    /* 2. 日支六合 / 三合 / 相冲 / 相害 */
    if ((az + bz) % 12 === 1) {
      add('日支六合', 16, '两人日支六合（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi + '）。六合主和合。');
    } else if (az % 4 === bz % 4) {
      add('日支三合', 11, '两人日支同属三合局（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi + '）。');
    } else if ((az - bz) % 12 === 6 || (bz - az) % 12 === 6) {
      add('日支相冲', -15, '两人日支相冲（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi + '）。六冲主对立。');
    } else if ((az + bz) % 12 === 7) {
      add('日支相害', -7, '两人日支相害（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi + '）。');
    } else {
      add('日支无合', 0, '两人日支既不合也不冲（' + a.pillars.day.zhi + '·' + b.pillars.day.zhi + '）。');
    }

    /* 3. 年支（生肖）关系 */
    var ay = BaziCore.ZHI.indexOf(a.pillars.year.zhi);
    var by = BaziCore.ZHI.indexOf(b.pillars.year.zhi);
    if ((ay + by) % 12 === 1) { add('生肖六合', 8, '两人年支六合（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '）。'); }
    else if (ay % 4 === by % 4) { add('生肖三合', 6, '两人年支同属三合（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '）。'); }
    else if ((ay - by) % 12 === 6 || (by - ay) % 12 === 6) { add('生肖相冲', -8, '两人年支相冲（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '），即六冲。'); }
    else { add('生肖无涉', 0, '两人年支无合无冲（' + a.pillars.year.zhi + '·' + b.pillars.year.zhi + '）。'); }

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
      add('五行互补', 15, '双方所缺（' + (missA.concat(missB).join('、') || '—') + '）得对方补足。');
    } else if (fill === 1) {
      add('五行稍补', 7, '一方所缺得对方补足。');
    } else {
      var overlap = [];
      ['木','火','土','金','水'].forEach(function (w) {
        if ((ca[w] === 0) && (cb[w] === 0)) { overlap.push(w); }
      });
      if (overlap.length) {
        add('同缺五行', -6, '两人同缺' + overlap.join('、') + '。');
      } else {
        add('五行无明显互补', 0, '两人五行分布无互补，也无同类偏枯。');
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
      add('十神相配', 12, '男看女为「' + mSeesF + '」，女看男为「' + fSeesM + '」，即财官相配。');
    } else if (caiOk || guanOk) {
      add('十神半配', 6, '男看女「' + mSeesF + '」，女看男「' + fSeesM + '」，一方相合，一方平常。');
    } else {
      add('十神无配', 0, '男看女「' + mSeesF + '」，女看男「' + fSeesM + '」，无财官之应。');
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
      + '</div>';
  }


  /* ---------- 交互 ---------- */

  /* 最近一次排盘结果：胎命身开关切换时据此重排左列，不必重新读表单 */
  var LAST_RESULT = null;

  function doPaipan() {
    var y = parseInt(($('#bz-y') || {}).value, 10);
    var m = parseInt(($('#bz-m') || {}).value, 10);
    var d = parseInt(($('#bz-d') || {}).value, 10);
    var timeStr = (($('#bz-h') || {}).value || '12:00');
    var hourUnknown = timeStr === 'unknown';
    var parts = hourUnknown ? ['0', '0'] : timeStr.split(':');
    var hh = parseInt(parts[0], 10) || 0;
    var mi = parseInt(parts[1], 10) || 0;
    var gEl = document.querySelector('#ndt-bazi input[name="bz-gender"]:checked');
    var gender = gEl ? gEl.value : '男';
    var cityUnknown = !!($('#bz-unk-city') && $('#bz-unk-city').checked);
    var addr = addrNow();
    var city = cityUnknown ? '未知地' : (addr.text || '未知地');
    var addrLon = addr.lon;
    var useTST = !!($('#bz-tst') && $('#bz-tst').checked) && !hourUnknown && !cityUnknown;
    var lon = (cityUnknown || addrLon === null || isNaN(addrLon)) ? 120 : addrLon;

    if (!y || y < 1900 || y > 2100 || !m || m < 1 || m > 12 || !d || d < 1 || d > 31) {
      $('#bz-out').innerHTML = '<div class="bz-card"><div class="bz-tip" style="color:#C0504D">年月日填写有误，请检查。</div></div>';
      return;
    }
    var probe = new Date(y, m - 1, d);
    if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) {
      $('#bz-out').innerHTML = '<div class="bz-card"><div class="bz-tip" style="color:#C0504D">' + y + ' 年 ' + m + ' 月没有 ' + d + ' 日，请检查。</div></div>';
      return;
    }

    var input = { year: y, month: m, day: d, hour: hh, minute: mi, gender: gender,
      useTrueSolar: useTST, lon: lon, city: city, town: addr.town,
      hourUnknown: hourUnknown, cityUnknown: cityUnknown };

    /* 农历输入：先折算成公历再排盘 */
    var cal = formCal;
    var leap = !!($('#bz-leap') && $('#bz-leap').checked);
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
    LAST_RESULT = r;

    /* 胎命身开关：只换表格那一块，不重排整页 */
    var tmsBox = $('#bz-tms');
    if (tmsBox) {
      tmsBox.addEventListener('change', function () {
        setTms(tmsBox.checked);
        var host = $('#bz-tbl-host');
        if (host) { host.innerHTML = pillarTable(LAST_RESULT, { mode: tmsBox.checked ? 'gong' : 'yun' }); }
      });
    }

    /* 神煞名点击弹窗：委托挂在 #bz-out 上，胎命身开关重画表格也不会丢 */
    var outBox = $('#bz-out');
    if (outBox && !outBox.getAttribute('data-ss-bound')) {
      outBox.setAttribute('data-ss-bound', '1');
      outBox.addEventListener('click', function (ev) {
        var t = ev.target;
        if (!t || !t.closest) { return; }
        var hit = t.closest('.ss-hit');
        if (hit) { openSs(hit.getAttribute('data-ss'), hit.getAttribute('data-pos')); return; }
        if (t.closest('[data-ss-close]')) { closeSs(); }
      });
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' || ev.keyCode === 27) { closeSs(); }
      });
    }

    var hhGo = $('#bz-hh-go');
    if (hhGo) { hhGo.addEventListener('click', function () { doHehun(r); }); }
    hhAddrInit();

    var saveBtn = $('#bz-save');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '存入案例';
      saveBtn.addEventListener('click', function () { saveCase(r); });
    }

    try {
      localStorage.setItem(MEM_KEY, JSON.stringify({
        year: y, month: m, day: d, gender: gender, time: timeStr, city: city,
        town: addr.town,
        addr: (function () {
          var ps = $('#bz-prov'), cs = $('#bz-city'), ds = $('#bz-dist');
          if (!ps) { return null; }
          return {
            p: Number(ps.value),
            c: Number(cs && cs.value),
            d: Number(ds && ds.value),
            cn: addr.c ? addr.c.n : '',
            dn: addr.d ? addr.d[1] : ''
          };
        })(),
        unkCity: cityUnknown,
        useTST: useTST, cal: cal
      }));
    } catch (e) {}
  }

  /* 合婚表单里的地址：与主表单同一套全国数据，默认北京 */
  function hhAddrInit() {
    var R = regionData();
    var ps = $('#bz-hh-prov'), cs = $('#bz-hh-city'), ds = $('#bz-hh-dist');
    if (!ps || !cs || !ds || !R.length) { return; }
    ps.innerHTML = R.map(function (p, i) { return '<option value="' + i + '">' + esc(p.n) + '</option>'; }).join('');
    addrApply('北京市', HH_ADDR_IDS);
    ps.addEventListener('change', function () { addrFillCity(null, HH_ADDR_IDS); });
    cs.addEventListener('change', function () { addrFillDist(null, HH_ADDR_IDS); });
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
    var hhAddr = addrNow(HH_ADDR_IDS);
    var city = hhAddr.text || '未知地';

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
        useTrueSolar: true, lon: hhAddr.lon === null ? 120 : hhAddr.lon, city: city });
    } catch (e) {
      out.innerHTML = '<div class="bz-tip" style="color:#C0504D;margin-top:10px">排盘出错：' + esc(e.message) + '</div>';
      return;
    }
    var res = hehun(a, b);
    out.innerHTML = '<div style="margin-top:14px">' + hehunHtml(a, b, res) + '</div>';
  }

  /* ---------- 主题 ---------- */

  /* app.js 处理主题按钮的顺序是：DB.data.theme=值 → DB.save() → router()。
     router() 没有 #/bazi 这一支，会走 default 渲染官网首页，八字页被整个换掉、
     再被 watch 顶回来 —— 这就是「一点主题就闪、还像是没切成功」的来源。
     这里在 capture 阶段把这颗按钮接管下来：只改数据、落盘、换 .portal 上的主题类，
     页面结构一律不动，主题立刻生效，也没有中间帧。 */
  function applyTheme(v) {
    if (!v) { return; }
    try {
      if (typeof DB !== 'undefined' && DB && DB.data) {
        DB.data.theme = v;
        /* 与 app.js 原逻辑一致：主题变了，当前聊天模板若不在新主题的模板集里就换第一个 */
        try {
          if (typeof TEMPLATES !== 'undefined' && DB.user) {
            var valid = TEMPLATES[v] || TEMPLATES.default;
            if (valid && !valid.some(function (x) { return x.id === DB.user.tpl; })) { DB.user.tpl = valid[0].id; }
          }
        } catch (e2) {}
        DB.save();
      }
    } catch (e) {}
    var p = document.querySelector('.portal');
    if (p) {
      Object.keys(TH_CLS).forEach(function (k) { p.classList.remove(TH_CLS[k]); });
      if (TH_CLS[v]) { p.classList.add(TH_CLS[v]); }
    }
    $$('[data-theme-set]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-theme-set') === v);
    });
    cachePortal();
  }

  /* 快照恢复回来时可能带着切主题前的类名，按 DB 里的当前值校正一次 */
  function syncThemeClass() {
    var v = 'default';
    try { if (typeof DB !== 'undefined' && DB && DB.data && DB.data.theme) { v = DB.data.theme; } } catch (e) {}
    var p = document.querySelector('.portal');
    if (!p) { return; }
    Object.keys(TH_CLS).forEach(function (k) { p.classList.remove(TH_CLS[k]); });
    if (TH_CLS[v]) { p.classList.add(TH_CLS[v]); }
  }

  /* ---------- 页面接管 ---------- */

  /* app.js 的 switch 里没有 bazi 这一支，命中 #/bazi 会走 default → viewHome()。
     viewHome 是「官网首页」外壳（surfaceHeader + hero），根本没有 .p-main、
     也没有侧栏 —— 直接接管就会拿不到挂载点，整块内网界面被顶掉，
     用户看到的就是「一点就闪退」。

     解决办法：内网页面时把 .portal 的结构存一份快照；进八字页时 app.js
     已经把 #app 换成了官网首页，就在同一个 tick 里把快照放回去，
     再换掉中间的 .p-main。浏览器还没绘制，看不到中间那一帧。 */
  var PORTAL_SNAPSHOT = null;

  var shellBooting = false;
  /* 连快照都没有（第一次就直达 #/bazi）：先落到内网首页拿到正规门户外壳，
     再切回 #/bazi。正常人是从侧栏点进来的，走不到这里。 */
  function bootstrapShell() {
    if (shellBooting) { return; }
    shellBooting = true;
    location.hash = '#/forum';
    setTimeout(function () {
      location.hash = HASH;
      setTimeout(function () { shellBooting = false; tick(); }, 30);
    }, 80);
  }

  function cachePortal() {
    var p = $('#app .portal');
    if (p && $('.p-main', p)) {
      try { PORTAL_SNAPSHOT = p.outerHTML; } catch (e) {}
    }
  }

  function routeToBazi() {
    if (!isBaziPage()) { return; }
    if (!$('#app .p-main')) {
      var app = $('#app');
      if (app && PORTAL_SNAPSHOT) {
        app.innerHTML = PORTAL_SNAPSHOT;
        var restored = $('#app .p-main');
        if (restored) { restored.removeAttribute('data-ndt-bazi-rendered'); }
        syncThemeClass();
      }
      /* 快照也没有（比如第一次就是直接打开 #/bazi）：先落到内网首页，
         再切回来，拿一次正规门户外壳。 */
      if (!$('#app .p-main')) { bootstrapShell(); return; }
    }
    paint();
  }

  /* 预览页 / 调试用：按地名选中地址（'unknown' 表示未知地） */
  window.BaziAddrSelect = function (name) {
    var unk = $('#bz-unk-city');
    if (String(name) === 'unknown') {
      if (unk) { unk.checked = true; }
      addrLock(true);
      syncFormNote();
      return (addrNow().text || '未知地');
    }
    if (unk) { unk.checked = false; }
    addrLock(false);
    if (!addrApply(String(name || ''))) { addrApply('北京市'); }
    syncFormNote();
    return addrNow().text;
  };

  function paint() {
    if (!isBaziPage()) { return; }
    var main = $('#app .p-main');
    if (!main) { return; }
    if (main.getAttribute('data-ndt-bazi-rendered') === '1') { return; }
    ensureStyle();
    main.innerHTML = '<div id="ndt-bazi">' + formHtml() + '</div>';
    main.setAttribute('data-ndt-bazi-rendered', '1');
    addrInit();
    var btn = $('#bz-go');
    if (btn) { btn.addEventListener('click', doPaipan); }
    bindForm();
    renderCases();
    /* 侧栏高亮：app.js 的 item() 用的是 .on，不是 is-active */
    $$('#app .side-item').forEach(function (x) { x.classList.remove('on'); });
    $$('#app .side-item[data-section="bazi"]').forEach(function (x) { x.classList.add('on'); });
  }

  function tick() {
    ensureStyle();
    ensureSideItem();
    if (!isBaziPage()) { cachePortal(); return; }
    routeToBazi();
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

  /* 点击：capture 阶段就拦下来。app.js 的委托是读 [data-hash] 然后改 hash，
     当 hash 已经是 #/bazi 时它还会直接调 router()，那一步就会渲染官网首页。 */
  document.addEventListener('click', function (e) {
    var t = e.target;
    /* 八字页里点主题按钮：自己接管，不走 app.js 的 router() */
    var thBtn = (t && t.closest) ? t.closest('[data-theme-set]') : null;
    if (thBtn && isBaziPage()) {
      e.preventDefault();
      e.stopPropagation();
      applyTheme(thBtn.getAttribute('data-theme-set'));
      return;
    }
    var si = (t && t.closest) ? t.closest('[' + ITEM_KEY + ']') : null;
    if (!si) { return; }
    e.preventDefault();
    e.stopPropagation();
    if (location.hash !== HASH) { location.hash = HASH; }
    else { tick(); }
  }, true);

  /* 路由：app.js 的 router 也挂在 window 的 hashchange 上，且它先注册、
     所以到这里时 #app 已经被它换掉了。注意 window 作为 target 时 capture
     标记不生效（监听器按注册顺序调用），抢不到前面去 —— 只能等它跑完，
     在同一个 tick 里立刻把门户结构顶回来，浏览器还没绘制，看不到中间帧。 */
  window.addEventListener('hashchange', function () { tick(); });

  window.addEventListener('load', function () { tick(); });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(watch, 0);
  } else {
    document.addEventListener('DOMContentLoaded', watch);
  }
})();
