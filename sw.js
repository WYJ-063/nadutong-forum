self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
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
