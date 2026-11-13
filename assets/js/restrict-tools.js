/* 哪都通 · 管理员限制帖子观看（旁路脚本，不修改 app.js）
   ① 管理员在帖子页的现有管理按钮旁多一个「限制观看 / 解除限制」
   ② 被限制的帖子：列表里照常显示标题，点进去后非作者、非管理员只看到守则提示
   ③ 作者本人和管理员照常浏览，帖子上方多一条「已被限制」状态条
   数据全部走后端 /api/posts/:id/hidden，前端只负责展示与发起操作。 */
(function(){
  'use strict';

  var RULE='本帖违反云端论坛守则已被禁止观看，请遵守云端论坛守则';
  var TIP_CLS='ndt-restricted-tip';
  var BTN_ATTR='data-ndt-hidden';
  var state={};           /* postId -> { hidden, status, authorId } */
  var fetching=false;

  /* ---------- 小工具 ---------- */
  function $(s,r){ return (r||document).querySelector(s); }
  function postIdFromHash(){
    var m=(location.hash||'').match(/#\/post\/([^/?#]+)/);
    return m?decodeURIComponent(m[1]):null;
  }
  function say(msg,kind){
    if(typeof toast==='function'){ try{ toast(msg,kind==='err'?'err':'ok'); return; }catch(e){} }
    console.log('[restrict] '+msg);
  }
  function isAdmin(){
    try{ return !!(Cloud&&Cloud.connected&&Cloud.user&&Number(Cloud.user.role)>=3); }
    catch(e){ return false; }
  }

  /* ---------- 旁路记录帖子详情的真实状态 ----------
     app.js 的 Cloud.getPost 走 window.fetch，这里包一层把响应体克隆出来读一次，
     既不改它的流程，也不用额外再请求一遍（避免凭空多算一次浏览量）。 */
  function wrapFetch(){
    if(fetching)return;
    var orig=window.fetch;
    if(typeof orig!=='function')return;
    fetching=true;
    window.fetch=function(input,init){
      var p=orig.apply(this,arguments);
      try{
        var url=(typeof input==='string')?input:(input&&input.url)||'';
        var method=((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
        var m=url.match(/\/api\/posts\/([^/?#]+)(?:\?|$)/);
        if(m&&method==='GET'){
          var pid=decodeURIComponent(m[1]);
          p.then(function(res){
            if(!res||typeof res.clone!=='function')return;
            res.clone().json().then(function(d){
              state[pid]={
                status:res.status,
                hidden:!!(d&&d.post&&d.post.hidden),
                authorId:(d&&d.post&&d.post.authorId)||null,
                ruleText:(d&&d.error)||''
              };
              tick();
            }).catch(function(){});
          }).catch(function(){});
        }
      }catch(e){ /* 记录状态失败不影响原请求 */ }
      return p;
    };
  }

  /* ---------- 管理员按钮 ---------- */
  function ensureButton(pid){
    var btn=document.querySelector('['+BTN_ATTR+']');
    if(btn){
      btn.dataset.ndtFor=pid;
      /* 状态是异步拿到的：每轮按最新状态刷新文案，请求进行中不覆盖 */
      if(!btn.disabled)paintBtn(btn,pid);
      return;
    }
    /* 借现有「加精」按钮的位置和样式：它本身就只对管理员渲染，插在旁边最自然 */
    var anchor=$('[data-essence]')||$('.q-meta [data-share]');
    if(!anchor||!anchor.parentNode)return;
    var clone=anchor.cloneNode(false);
    clone.className=anchor.className.indexOf('is-on')>=0
      ? anchor.className.replace(/\bis-on\b/g,'').trim()
      : anchor.className;
    clone.type='button';
    clone.removeAttribute('data-essence');
    clone.removeAttribute('data-share');
    clone.setAttribute(BTN_ATTR,'1');
    clone.dataset.ndtFor=pid;
    clone.onclick=function(){ toggle(clone,pid); };
    anchor.parentNode.insertBefore(clone,anchor.nextSibling);
    paintBtn(clone,pid);
  }
  function paintBtn(btn,pid){
    var s=state[pid]||{};
    btn.textContent=s.hidden?'解除限制':'限制观看';
    btn.title=s.hidden?'解除后所有人都能正常浏览':'限制后只有作者和管理员能看到内容';
    btn.disabled=false;
  }
  function toggle(btn,pid){
    var next=!(state[pid]&&state[pid].hidden);
    btn.disabled=true;
    Cloud.request('/posts/'+encodeURIComponent(pid)+'/hidden',
      {method:'POST',body:JSON.stringify({hidden:next})})
      .then(function(r){
        state[pid]=state[pid]||{};
        state[pid].hidden=!!r.hidden;
        state[pid].status=200;
        paintBtn(btn,pid);
        say(r.hidden?'已限制观看：其他人点开只会看到守则提示':'已解除限制，所有人都能正常浏览');
        tick();
      })
      .catch(function(e){
        btn.disabled=false;
        say((e&&e.message)||'操作失败，请稍后重试','err');
      });
  }

  /* ---------- 状态提示条（作者/管理员看得到内容时） ---------- */
  function ensureTip(pid,s){
    if(!s||!s.hidden||s.status!==200)return;
    if(document.querySelector('.'+TIP_CLS))return;
    var host=$('#app .p-panel');
    if(!host||!host.parentNode)return;
    var box=document.createElement('div');
    box.className=TIP_CLS;
    box.style.cssText='margin:0 0 12px;padding:10px 14px;border-radius:10px;'+
      'border:1px solid rgba(230,126,34,.45);background:rgba(230,126,34,.10);'+
      'color:#b9772a;font-size:13px;line-height:1.6;';
    box.innerHTML='<b style="margin-right:6px">已被限制观看</b>'+
      '本帖仅作者本人和管理员可见，其他成员点开只会看到守则提示。';
    host.parentNode.insertBefore(box,host);
  }

  /* ---------- 「加载失败」面板换成正式守则提示 ---------- */
  function polish403(pid,s){
    if(!s||s.status!==403)return;
    var panel=$('#app .p-panel.empty');
    if(!panel||panel.dataset.ndtPolished==='1')return;
    if(panel.textContent.indexOf('帖子加载失败')<0)return;
    panel.dataset.ndtPolished='1';
    panel.innerHTML=
      '<div style="padding:26px 18px;text-align:center">'+
        '<div style="font-size:30px;line-height:1;margin-bottom:14px">⛔</div>'+
        '<div style="font-size:15px;line-height:1.9;color:#8a4b3c">'+RULE+'</div>'+
        '<div style="margin-top:16px">'+
          '<a class="btn btn-sm" href="#/forum">返回论坛</a>'+
        '</div>'+
      '</div>';
  }

  /* ---------- 主循环 ---------- */
  function tick(){
    var pid=postIdFromHash();
    if(!pid)return;
    var s=state[pid];
    if(s)polish403(pid,s);
    if(isAdmin())ensureButton(pid);
    if(s)ensureTip(pid,s);
  }

  function boot(){
    setTimeout(tick,300);
    setInterval(tick,800);
    window.addEventListener('hashchange',function(){ setTimeout(tick,120); });
  }
  /* fetch 包装必须立刻生效：帖子详情请求可能在本脚本执行之后的任意时刻发出，
     等到 DOMContentLoaded 再包会漏掉这期间的请求，状态就永远拿不到。 */
  wrapFetch();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
