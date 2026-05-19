const CACHE_NAME = 'pgn-study-static-v1';
const AUDIO_CACHE = 'pgn-study-audio-v1';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalación y precarga estática
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones (Estrategias de Caché)
self.addEventListener('fetch', event => {
  const request = event.request;

  // Estrategia para audios: Network First, fallback to Cache
  if (request.url.endsWith('.m4a') || request.url.includes('/audios/')) {
    event.respondWith(
      fetch(request).then(response => {
        // Guardar en caché dinámico si la red funciona
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(AUDIO_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Si no hay red, buscar en el caché de audios
        return caches.match(request);
      })
    );
  } else {
    // Estrategia estática: Cache First, fallback to Network
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request);
      })
    );
  }
});