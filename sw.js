/* 静态资源缓存版本号。
   注意：正式发布新版本时，把下面的 v1 改成 v2、v3……
   旧缓存会被自动清掉，用户下次打开就是新文件。
   index.html 走"网络优先"，所以新部署能被立刻感知，不会卡在旧版本。 */
const ASSET_CACHE = 'ndt-assets-v4';
/* 页面留一份缓存只作兜底：网络不通 / 超时才用它，正常有网一律取最新的。
   （早先写成"缓存优先、后台更新"，结果是不会清缓存的用户永远停在上一个版本，
     这条路是错的，改回网络优先。） */
const PAGE_CACHE = 'ndt-pages-v1';
const PAGE_NET_TIMEOUT = 3500;

self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys
      .filter(k=>k.indexOf('ndt-assets-')===0&&k!==ASSET_CACHE)
      .map(k=>caches.delete(k)));
    await self.clients.claim();
    /* 新版本接管后，让还开着旧页面的标签重新加载一次，
       这样用户不用懂什么叫强制刷新也能直接看到新版。 */
    try{
      const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
      for(const c of list){ try{ await c.navigate(c.url); }catch(e){} }
    }catch(e){}
  })());
});

/* 静态资源加速：只缓存 /assets/ 下的 CSS、JS、图标。
   它们的地址都带 ?v= 版本号，换了版本就是新地址，不会读到旧文件；
   HTML 与接口请求完全不拦，保证新版部署后立刻生效。 */
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  let url;
  try{ url=new URL(req.url); }catch(e){ return; }
  if(url.origin!==self.location.origin)return;

  /* 首页：网络优先，超时才用缓存。
     有网时一定拿最新的 index.html——新部署立刻生效，不用清缓存；
     国内网络抖动或没网时才退回缓存那份，至少能进站、不白屏。 */
  if(url.pathname==='/'||url.pathname==='/index.html'){
    event.respondWith((async()=>{
      const cache=await caches.open(PAGE_CACHE);
      let net=null;
      try{
        net=await Promise.race([
          fetch(req,{cache:'no-store'}),
          new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),PAGE_NET_TIMEOUT))
        ]);
      }catch(e){ net=null; }
      if(net&&net.ok){
        try{ cache.put('/index.html',net.clone()); }catch(e){}
        return net;
      }
      const hit=await cache.match('/index.html');
      if(hit)return hit;
      if(net)return net;
      return new Response('页面暂时打不开，请稍后重试',
        {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    })());
    return;
  }

  if(url.pathname.indexOf('/assets/')<0)return;
  event.respondWith((async()=>{
    try{
      const cache=await caches.open(ASSET_CACHE);
      const hit=await cache.match(req);
      if(hit)return hit;
      const res=await fetch(req);
      if(res&&res.ok&&res.type!=='opaque'){
        try{ cache.put(req,res.clone()); }catch(e){}
      }
      return res;
    }catch(e){
      /* 缓存不可用（隐私模式等）就直连，别把页面搞坏 */
      return fetch(req);
    }
  })());
});

/* 服务器 Web Push 到达（页面关闭/后台时也能收到） */
self.addEventListener('push',event=>{
  let data={};
  try{ data=event.data?event.data.json():{}; }
  catch(e){ data={title:'哪都通论坛',body:'您有一条新的动态'}; }
  event.waitUntil((async()=>{
    const clientList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const visible=clientList.find(c=>c.visibilityState==='visible');
    if(visible){
      /* 页面已打开且可见：交给页面自己的轮询/角标处理，避免同一条消息弹两次 */
      try{ visible.postMessage({type:'NDT_PUSH_RECEIVED',data}); }catch(e){}
      return;
    }
    const title=data.title||'哪都通论坛';
    const options={
      body:String(data.body||'您有一条新的动态').slice(0,180),
      tag:data.tag||'ndt-push',
      data:{url:data.url||'#/forum'},
      icon:'./assets/icons/icon-192.png',
      badge:'./assets/icons/icon-192.png',
      renotify:true
    };
    await self.registration.showNotification(title,options);
  })());
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=(event.notification.data&&event.notification.data.url)||'#/forum';
  event.waitUntil((async()=>{
    const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clientsList){
      if('focus' in client){
        await client.focus();
        try{client.postMessage({type:'NDT_NOTIFICATION_CLICK',url});}catch(e){}
        return;
      }
    }
    if(self.clients.openWindow)await self.clients.openWindow(url.startsWith('#')?('./'+url):url);
  })());
});
