/* ============================================================
   界面细节增强（数字滚动）
   独立文件：不修改 app.js 的渲染函数，只观察 DOM 里已有的数字节点，
   数值一变就做「递增 + 轻微放大」的过渡。
   ============================================================ */
(function(){
  'use strict';
  if(window.__uiPolishLoaded) return;
  window.__uiPolishLoaded=true;

  var reduce=false;
  try{ reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}

  /* 记录每个数字节点上一次的值：key → number */
  var last=new Map();
  var ANIM='data-num-anim';

  function toNum(txt){
    var s=String(txt==null?'':txt).replace(/[^\d-]/g,'');
    if(!s||s==='-')return null;
    var n=parseInt(s,10);
    return isNaN(n)?null:n;
  }

  /* 给数字节点算一个稳定的 key，重渲染换了节点也能接着比 */
  function keyOf(el){
    if(el.classList.contains('vote-count')){
      var box=el.parentElement;
      var holder=box?(box.querySelector('[data-vote]')||box.querySelector('[data-avote]')):null;
      var id=holder?(holder.getAttribute('data-vote')||holder.getAttribute('data-avote')):null;
      if(id)return 'vote:'+id;
      return null; /* 拿不到 id 就不动，避免错位动画 */
    }
    if(el.closest('.cs')){
      /* 云端账号卡的三个小格子里只有「积分」是纯数字，等级/称号不参与滚动 */
      var lab=el.closest('.cs').querySelector('span');
      if(lab&&lab.textContent.indexOf('积分')>=0)return 'pts:account';
      return null;
    }
    if(el.classList.contains('slc-points'))return 'pts:space';
    return null;
  }

  function pop(el){
    el.classList.remove('num-pop');
    /* 强制回流，保证连续两次变化都能重放动画 */
    void el.offsetWidth;
    el.classList.add('num-pop');
    setTimeout(function(){ el.classList.remove('num-pop'); },460);
  }

  function tween(el,from,to){
    if(reduce||from===to){ el.textContent=String(to); return; }
    var span=Math.abs(to-from);
    var dur=Math.max(320,Math.min(900,240+span*45));
    el.setAttribute(ANIM,'1');
    var t0=0;
    function frame(t){
      if(!t0)t0=t;
      var k=Math.min(1,(t-t0)/dur);
      var e=1-Math.pow(1-k,3); /* ease-out */
      el.textContent=String(Math.round(from+(to-from)*e));
      if(k<1){ requestAnimationFrame(frame); }
      else{
        el.textContent=String(to);
        el.removeAttribute(ANIM);
        pop(el);
      }
    }
    requestAnimationFrame(frame);
  }

  function scan(scope){
    var nodes=scope.querySelectorAll('.vote-count, .cs b, .slc-points');
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      if(el.hasAttribute(ANIM))continue;      /* 正在动画，别打断自己 */
      if(el.children.length)continue;          /* 结构复杂的不碰 */
      var key=keyOf(el);
      if(!key)continue;
      var val=toNum(el.textContent);
      if(val===null)continue;
      if(!last.has(key)){ last.set(key,val); continue; } /* 第一次见到只记不滚 */
      var prev=last.get(key);
      if(prev===val)continue;
      last.set(key,val);
      tween(el,prev,val);
    }
  }

  /* 只扫 #app，避免扫描整个文档 */
  var app=null;
  var pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(function(){
      pending=false;
      app=app&&app.isConnected?app:document.getElementById('app');
      if(app)scan(app);
    });
  }

  function start(){
    var boot=document.getElementById('app');
    if(boot)scan(boot); /* 首屏的数字先记一遍基准值，不做动画 */
    var ob=new MutationObserver(schedule);
    ob.observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
