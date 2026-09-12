const CACHE='baqiyat-v6';
const APP=['./','./index.html','./manifest.json','./mahmoudabujarad.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // Keep Quran API usable when online and cached when revisited.
  if(u.hostname==='api.alquran.cloud'){
    e.respondWith(caches.open(CACHE).then(async cache=>{
      try{
        const r=await fetch(e.request);
        if(r.ok) cache.put(e.request,r.clone());
        return r;
      }catch(_){
        return cache.match(e.request)||new Response('Offline',{status:503});
      }
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r.ok && (u.origin===location.origin || u.hostname==='fonts.googleapis.com' || u.hostname==='fonts.gstatic.com')){
      caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
    }
    return r;
  }).catch(()=>cached)));
});
