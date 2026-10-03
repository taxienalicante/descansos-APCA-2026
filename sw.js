const CACHE = 'apca-descansos-v3';
const SHELL = ['./','./index.html','./manifest.webmanifest','./app-icon-192.png','./app-icon-512.png','./app-icon-maskable.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // Red primero: siempre intenta la versión más reciente; si no hay red, usa la caché.
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const net = await fetch(req, { cache: 'no-store' });
        if (net && net.ok) cache.put('./index.html', net.clone());
        return net;
      } catch (err) {
        const cached = await cache.match('./index.html');
        return cached || Response.error();
      }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
