// 離線快取：先拿網路上最新的，沒網路時用上次存的
const C="tw-stock-v1";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","data.json","manifest.json","icon-192.png"])))});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request.url.split("?")[0],cp));return r}).catch(()=>caches.match(e.request.url.split("?")[0])));
});
