/* eslint-disable */
/**
 * Self-unregistering Mock Service Worker stub.
 * Proactively unregisters any active MSW service workers to guarantee
 * all network traffic reaches FastAPI backend directly in Docker production.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      // Reload active clients to release service worker control
      clients.forEach(client => {
        if (client.url && 'navigate' in client) {
          client.navigate(client.url);
        }
      });
    })
  );
});

// Pass all fetch requests directly to network without any interception
self.addEventListener('fetch', () => {
  return;
});
