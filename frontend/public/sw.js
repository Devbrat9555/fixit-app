const CACHE_NAME = 'fixit-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg?v=2'
];

// Install event - Skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 🚨 BYPASS FOR API & CLERK & NON-GET
  if (
    event.request.method !== 'GET' || 
    url.pathname.includes('/api/') || 
    url.hostname.includes('clerk') ||
    url.hostname.includes('accounts.')
  ) {
    return;
  }

  // NAVIGATION (SPA support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  // ASSETS
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request)
        .then((networkResponse) => {
          // Optional: Cache images or other assets here
          return networkResponse;
        })
        .catch(() => {
          // Silent fail for network errors
          return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
    })
  );
});
