const CACHE = 'apca-descansos-v2';
const SHELL = ['./','./index.html','./manifest.webmanifest','./app-icon-192.png','./app-icon-512.png','./app-icon-maskable.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('./index.html');
      const net = fetch(req).then(r => { if (r && r.ok) cache.put('./index.html', r.clone()); return r; }).catch(() => null);
      return cached || (await net) || fetch(req);
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
