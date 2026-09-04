// Smriti Offline Service Worker
const CACHE_NAME = 'smriti-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/patient',
  '/patient/reminders',
  '/patient/profile',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg'
];

// 1. Install Event: Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🌸 [ServiceWorker] Precaching App Shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Cache-First for assets, Network-First for navigation & fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle SPA navigation requests (e.g. /patient, /patient/reminders)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('/index.html') || await cache.match('/');
        return cached || new Response('Offline - Smriti App', { headers: { 'Content-Type': 'text/html' } });
      })
    );
    return;
  }

  // For static bundles, images and scripts: Cache-first with background cache update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background cache update
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Network fetch and store in cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/favicon.svg');
        }
      });
    })
  );
});
