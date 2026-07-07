const CACHE = 'axisco-v4';
self.addEventListener('install', e => {
  const base = new URL('./', self.location.href).pathname;
  const files = [base, base + 'index.html', base + 'manifest.json', base + 'axisco-logo.jpeg', base + 'axisco-bg.jpeg', 'axisco%20pic.jpeg'];
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(files)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const base = new URL('./', self.location.href).pathname;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(base).then(r => r || caches.match(base + 'index.html')))
    );
    return;
  }
  if (url.pathname.endsWith('/api/data')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('offline', { status: 503 })))
  );
});
