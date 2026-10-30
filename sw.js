self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});

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
      icon:'./assets/logo.png',
      badge:'./assets/logo.png',
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
