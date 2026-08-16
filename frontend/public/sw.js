// Service Worker Uninstaller & Cache Cleanser
// This completely unregisters any stuck service workers and wipes all stale caches

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          client.navigate(client.url);
        }
      });
    })
  );
});
