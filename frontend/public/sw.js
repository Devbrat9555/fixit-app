const CACHE_NAME = 'fixit-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install event - Skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event - Clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // 🚨 CRITICAL: Bypass Service Worker for Clerk and API calls
  if (
    event.request.method !== 'GET' || 
    url.includes('/api/') || 
    url.includes('clerk') || 
    url.includes('accounts.') ||
    url.includes('.clerk.accounts.dev')
  ) {
    return;
  }

  // Navigation requests (entering a URL or refreshing) should return index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Hashed assets (index-XXXX.js/css) should always be fetched fresh
  if (url.includes('index-')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
