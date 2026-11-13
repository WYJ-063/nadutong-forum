/* 哪都通 · 站点访问统计（旁路脚本，不修改 app.js）
   ① 每次打开页面向上报一次，后端按天记 PV/UV；访客标识只存在本机，不记录 IP 和个人信息
   ② 管理员侧栏多一个「访问统计」入口，点开看今日、昨日、近 7 天和累计 */
(function(){
  'use strict';

  var VID_KEY='ndt-visit-id';
  var ENTRY_ATTR='data-ndt-visit-entry';
  var PANEL_ID='ndt-visit-panel';

  function uid(){
    try{
      if(window.crypto&&typeof crypto.randomUUID==='function')
        return crypto.randomUUID().replace(/-/g,'');
    }catch(e){}
    var s='';
    for(var i=0;i<4;i++)s+=Math.random().toString(36).slice(2,10);
    return s.slice(0,32);
  }
  function visitorId(){
    var v=null;
    try{ v=localStorage.getItem(VID_KEY); }catch(e){}
    if(!v||!/^[A-Za-z0-9_-]{8,64}$/.test(v)){
      v=uid();
      try{ localStorage.setItem(VID_KEY,v); }catch(e){}
    }
    return v;
  }
  function ping(){
    try{
      fetch('/api/stats/visit',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({vid:visitorId()}),
        keepalive:true
      }).catch(function(){});
    }catch(e){ /* 统计失败一律不影响页面 */ }
  }
  function isAdmin(){
    try{ return !!(Cloud&&Cloud.connected&&Cloud.user&&Number(Cloud.user.role)>=3); }
    catch(e){ return false; }
  }
  function esc(s){
    return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ---------- 统计面板 ---------- */
  function card(label,value,unit){
    return '<div style="background:#171c27;border:1px solid #262d3b;border-radius:10px;padding:12px 14px">'+
      '<div style="color:#7f8a9d;font-size:12px">'+esc(label)+'</div>'+
      '<div style="margin-top:4px"><b style="font-size:22px;color:#e6ebf3">'+esc(value)+'</b>'+
      '<span style="color:#8b95a7;margin-left:4px">'+esc(unit)+'</span></div>'+
    '</div>';
  }
  function openPanel(){
    var old=document.getElementById(PANEL_ID);
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    var mask=document.createElement('div');
    mask.id=PANEL_ID;
    mask.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;'+
      'background:rgba(9,12,20,.72);display:flex;align-items:center;justify-content:center;padding:16px;';
    mask.innerHTML='<div style="width:min(620px,100%);max-height:86vh;overflow:auto;background:#12161f;'+
      'border:1px solid #2a3140;border-radius:14px;padding:18px;color:#dbe3ef;font-size:13px;line-height:1.7;'+
      'box-shadow:0 18px 50px rgba(0,0,0,.5)">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'+
        '<b style="font-size:15px">访问统计</b>'+
        '<button type="button" data-close style="background:none;border:none;color:#8b95a7;font-size:20px;line-height:1;cursor:pointer">×</button>'+
      '</div>'+
      '<div data-body style="color:#8b95a7">正在读取…</div>'+
      '</div>';
    document.body.appendChild(mask);
    mask.addEventListener('click',function(e){ if(e.target===mask)mask.remove(); });
    var close=mask.querySelector('[data-close]');
    if(close)close.onclick=function(){ mask.remove(); };
    load(mask.querySelector('[data-body]'));
  }
  function load(box){
    if(!box)return;
    if(!(window.Cloud&&Cloud.request)){
      box.textContent='云端未连接，暂时读不到数据。';
      return;
    }
    Cloud.request('/stats/visit').then(function(d){
      d=d||{};
      var today=d.today||{},yest=d.yesterday||{},tot=d.total||{};
      var l7=d.last7||[],daily=d.daily||[];
      var max=1;
      for(var i=0;i<l7.length;i++){ if(Number(l7[i].pv)>max)max=Number(l7[i].pv); }
      var bars=l7.map(function(x){
        var w=Math.max(2,Math.round((Number(x.pv)||0)/max*100));
        return '<div style="display:flex;align-items:center;gap:8px;margin:5px 0">'+
          '<span style="width:70px;color:#7f8a9d">'+esc(String(x.day).slice(5))+'</span>'+
          '<span style="flex:1 1 auto;height:8px;background:#202634;border-radius:5px;overflow:hidden">'+
            '<span style="display:block;height:8px;width:'+w+'%;background:linear-gradient(90deg,#3b82f6,#f97316)"></span>'+
          '</span>'+
          '<span style="flex:0 0 96px;text-align:right;color:#9aa6b8">'+esc(x.uv)+' 人 / '+esc(x.pv)+' 次</span>'+
        '</div>';
      }).join('');

      var dailyTable=daily.length
        ? '<div style="color:#8b95a7;margin:14px 0 6px">最近 30 天</div>'+
          '<div style="max-height:220px;overflow:auto;border-top:1px solid #232a37">'+
          daily.map(function(x){
            return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1c2230">'+
              '<span style="color:#9aa6b8">'+esc(x.day)+'</span>'+
              '<span>访客 <b style="color:#e6ebf3">'+esc(x.uv)+'</b> · 浏览 <b style="color:#e6ebf3">'+esc(x.pv)+'</b></span>'+
            '</div>';
          }).join('')+'</div>'
        : '<div style="margin-top:14px;color:#5c6678">还没有数据，等有过访问之后这里就会出现。</div>';

      box.style.color='#dbe3ef';
      box.innerHTML=
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px">'+
          card('今日访客',today.uv||0,'人')+
          card('今日浏览',today.pv||0,'次')+
          card('昨日访客',yest.uv||0,'人')+
          card('昨日浏览',yest.pv||0,'次')+
        '</div>'+
        '<div style="color:#8b95a7;margin-bottom:4px">近 7 天</div>'+bars+
        '<div style="margin-top:14px;padding-top:12px;border-top:1px solid #232a37;color:#9aa6b8">'+
          '累计访客 <b style="color:#e6ebf3">'+esc(tot.uv||0)+'</b> 人 · 累计浏览 <b style="color:#e6ebf3">'+esc(tot.pv||0)+'</b> 次'+
        '</div>'+dailyTable+
        '<div style="margin-top:10px;color:#5c6678;font-size:12px">'+
          '统计从功能上线当天开始累计；访客按本机随机标识去重，不记录 IP、不记录看过的内容。</div>';
    }).catch(function(e){
      box.textContent='读取失败：'+((e&&e.message)||'未知错误');
    });
  }

  /* ---------- 管理员侧栏入口 ---------- */
  function ensureEntry(){
    if(!isAdmin())return;
    var side=document.querySelector('.sidebar');
    if(!side)return;
    if(side.querySelector('['+ENTRY_ATTR+']'))return;
    var anchor=side.querySelector('.side-item[data-section="forum-notices"]')||side.querySelector('.side-item');
    if(!anchor||!anchor.parentNode)return;
    var entry=document.createElement('div');
    entry.className='side-item';
    entry.setAttribute(ENTRY_ATTR,'1');
    entry.setAttribute('role','button');
    entry.setAttribute('tabindex','0');
    entry.style.cursor='pointer';
    entry.innerHTML='<span style="display:inline-block;width:1.2em;text-align:center">📊</span>'+
      '<span class="side-item-label">访问统计</span>';
    entry.onclick=function(e){ e.preventDefault(); e.stopPropagation(); openPanel(); };
    entry.onkeydown=function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openPanel(); }
    };
    anchor.parentNode.insertBefore(entry,anchor.nextSibling);
  }

  function boot(){
    ping();
    setInterval(ensureEntry,1200);
    window.addEventListener('hashchange',function(){ setTimeout(ensureEntry,150); });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
