/* 静态资源缓存版本号。
   注意：正式发布新版本时，把下面的 v1 改成 v2、v3……
   旧缓存会被自动清掉，用户下次打开就是新文件。
   index.html 与 /api 一律不缓存，所以发布后立刻能感知到新版本。 */
const ASSET_CACHE = 'ndt-assets-v3';
/* 页面本身也留一份：国内直连 Cloudflare 经常要等很久甚至超时，
   先给缓存能让站点立刻打开，新版本在后台更新、下次打开生效。 */
const PAGE_CACHE = 'ndt-pages-v1';

self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys
      .filter(k=>k.indexOf('ndt-assets-')===0&&k!==ASSET_CACHE)
      .map(k=>caches.delete(k)));
    await self.clients.claim();
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

  /* 首页：缓存优先、后台更新。网络抖的时候至少能进站，而不是白屏干等 */
  if(url.pathname==='/'||url.pathname==='/index.html'){
    event.respondWith((async()=>{
      const cache=await caches.open(PAGE_CACHE);
      const hit=await cache.match('/index.html');
      const net=fetch(req).then(res=>{
        if(res&&res.ok){ try{ cache.put('/index.html',res.clone()); }catch(e){} }
        return res;
      }).catch(()=>null);
      return hit||net||new Response('页面暂时打不开，请稍后重试',
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
