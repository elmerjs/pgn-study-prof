/* ═══════════════════════════════════════════════════════════
   PGN STUDY — sw.js
   Service Worker — cache-first para assets estáticos
   Audios NO se cachean (son muy pesados)
   ═══════════════════════════════════════════════════════════ */

'use strict';

const CACHE_NAME = 'pgn-study-v1';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
];

/* ─── INSTALL ───────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

/* ─── ACTIVATE ──────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

/* ─── FETCH ─────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Audios: siempre desde la red (no cachear)
  if (url.pathname.includes('/audios/') || url.pathname.endsWith('.m4a')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Fonts externas (Google Fonts): red primero, sin caché
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 408 })));
    return;
  }

  // Resto de assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Solo cachear respuestas válidas de nuestro origen
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'opaque'
        ) {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(() => {
        // Fallback offline: devolver index.html para navegación
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
