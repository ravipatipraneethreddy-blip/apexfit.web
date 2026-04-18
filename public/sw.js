const CACHE_NAME = 'apexfit-v2';
const STATIC_ASSETS = [
  '/',
  '/diet',
  '/workout',
  '/profile',
  '/progress',
  '/reports',
  '/bodyfat',
];

// Install: cache static pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[SW] Cache install failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, SWR for pages, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Static assets (JS, CSS, fonts, images + next static): cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|ico|webp)$/) ||
    url.pathname.startsWith('/_next/static/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // API Requests: Network-first
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/search')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // Next.js RSC fetches & mutations: Network-first to prevent stale data pop-ins
  if (
    url.searchParams.has("_rsc") ||
    event.request.method !== "GET"
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Standard Pages: Stale-while-revalidate for fast structural load
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Network timeout')), 4000);
        fetch(event.request).then(response => {
          clearTimeout(timeoutId);
          if (response.ok && url.origin === self.location.origin && event.request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          resolve(response);
        }).catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
      }).catch(() => {
        if (!cached) {
          if (event.request.mode === 'navigate') return caches.match('/');
          return new Response('Offline', { status: 503 });
        }
      });

      return cached || fetchPromise;
    })
  );
});

// Handle push notifications
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
      },
      actions: data.actions || [],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
