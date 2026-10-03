// Service worker: abre al instante (cachea la app) y actualiza en segundo plano.
const CACHE = 'apca-descansos-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add('./index.html')).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('./index.html');
      const net = fetch(req).then((r) => { if (r && r.ok) cache.put('./index.html', r.clone()); return r; }).catch(() => null);
      return cached || (await net) || fetch(req);
    })());
  }
});
