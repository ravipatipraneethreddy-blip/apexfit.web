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

  const SAFE_PARAMS = new Set(['date', 'page', 'type']);
  
  const getNormalizedUrl = (requestUrl) => {
    const parsed = new URL(requestUrl);
    const keysToDrop = [];
    parsed.searchParams.forEach((_, key) => {
      if (!SAFE_PARAMS.has(key)) keysToDrop.push(key);
    });
    keysToDrop.forEach(k => parsed.searchParams.delete(k));
    return parsed.toString();
  };

  const enforceCacheLimit = async (cache, limit = 50) => {
    const keys = await cache.keys();
    if (keys.length > limit) {
      await Promise.all(keys.slice(0, 10).map(k => cache.delete(k)));
    }
  };

  // Skip caching for Mutations explicitly
  if (event.request.method !== "GET") {
    event.respondWith(fetch(event.request));
    return;
  }

  // Next.js RSC fetches: Network-first w/ strict timeout, fallback to cache
  if (url.searchParams.has("_rsc")) {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const normalizedKey = getNormalizedUrl(event.request.url);

      try {
        const response = await fetch(event.request, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        // Cache successful requests dynamically to enable offline reading
        if (response.ok && response.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(normalizedKey, response.clone());
          await enforceCacheLimit(cache);
        }
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        // Network drop/timeout: read from sanitized cache key
        const cached = await caches.match(normalizedKey);
        if (cached) return cached;
        throw err; // Allow Next.js boundaries to catch remaining faults naturally
      }
    })());
    return;
  }

  // Standard static pages: Stale-while-revalidate for fast structural load
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Network timeout')), 4000);
        fetch(event.request).then(async response => {
          clearTimeout(timeoutId);
          if (response.ok && response.status === 200 && url.origin === self.location.origin) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
            await enforceCacheLimit(cache);
          }
          resolve(response);
        }).catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
      }).catch(err => {
        if (!cached) {
          if (event.request.mode === 'navigate') return caches.match('/');
          throw err;
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
