const CACHE = 'setlog-cache-v17';
const ASSETS = ['./', './index.html', './style.css', './app.js', './exercise-library-coach.json', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './supabase-config.js', './exercise-w1-1.svg', './exercise-w1-2.svg', './exercise-w1-3.svg', './exercise-w1-4.svg', './exercise-w1-5.svg', './exercise-w1-6.svg', './exercise-w1-7.svg', './exercise-w2-1.svg', './exercise-w2-2.svg', './exercise-w2-3.svg', './exercise-w2-4.svg', './exercise-w2-5.svg', './exercise-w2-6.svg', './exercise-w3-1.svg', './exercise-w3-2.svg', './exercise-w3-3.svg', './exercise-w3-4.svg', './exercise-w3-5.svg', './exercise-w3-6.svg', './exercise-w3-7.svg', './exercise-w3-8.svg', "./exercise-g1-1.jpg", "./exercise-g1-2.jpg", "./exercise-g1-3.jpg", "./exercise-g1-4.jpg", "./exercise-g1-5.jpg", "./exercise-g1-6.jpg", "./exercise-g2-1.jpg", "./exercise-g2-2.jpg", "./exercise-g2-3.jpg", "./exercise-g2-4.jpg", "./exercise-g2-5.jpg", "./exercise-g2-6.jpg"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('setlog-cache-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Prefer the network while online so published fixes appear after reload;
// use the local cache as a fallback when the device is offline.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && (response.type === 'basic' || response.type === 'default')) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const offlinePage = new URL('./index.html', self.registration.scope).href;
        return (await caches.match(offlinePage)) || Response.error();
      }
      return Response.error();
    }
  })());
});
