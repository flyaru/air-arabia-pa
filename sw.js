const CACHE='station-pa-shell-v5-20261012',ASSETS=['/','/index.html','/style.css','/app.js','/src/core.js','/src/templates.js','/src/cache.js','/manifest.json','/icons/icon.svg','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
// Wait until all old clients close. Never reload an active announcement to activate an update.
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('station-pa-shell-')&&k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(!ASSETS.includes(url.pathname)&&event.request.mode!=='navigate')return;
 // Versioned shell is served consistently. Audio is managed separately by IndexedDB.
 event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(event.request.mode==='navigate'?'/index.html':url.pathname);return cached||fetch(event.request);}));
});
