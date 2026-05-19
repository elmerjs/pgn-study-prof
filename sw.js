/* ============================================================
   SERVICE WORKER - PGN Study PRO
   Estrategia: Cache-first para estáticos, Network-first para audios
   ============================================================ */

const CACHE_NAME = 'pgn-study-pro-v2';
const STATIC_ASSETS = [
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalación: cachear assets estáticos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Instalación completada');
      return self.skipWaiting();
    })
  );
});

// Activación: limpiar caches antiguos y tomar control de clientes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Eliminando cache antiguo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activación completada, reclamando clientes');
      return self.clients.claim();
    })
  );
});

// Estrategia de fetch
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejar peticiones del mismo origen
  if (url.origin !== self.location.origin) return;

  // Para archivos de audio: network-first con fallback a caché dinámico
  if (url.pathname.includes('/audios/') && url.pathname.match(/\.(m4a|mp3|ogg|wav|aac)$/i)) {
    event.respondWith(networkFirstForAudio(request));
    return;
  }

  // Para assets estáticos: cache-first con actualización en background
  event.respondWith(cacheFirstWithRefresh(request));
});

/**
 * Network-first para audios: intenta red, si falla busca en caché.
 * Si tiene éxito en red, guarda en caché dinámico.
 */
async function networkFirstForAudio(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Guardar copia en caché para uso offline futuro
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Red no disponible para audio, buscando en caché:', request.url);
  }
  // Fallback a caché
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  // Si no está en caché, devolver error controlado
  return new Response('Audio no disponible sin conexión', { status: 503 });
}

/**
 * Cache-first para estáticos: devuelve caché inmediato, luego actualiza en background.
 */
async function cacheFirstWithRefresh(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Actualizar en background (stale-while-revalidate)
    fetch(request).then(response => {
      if (response && response.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {});
    return cachedResponse;
  }
  // Si no está en caché, intentar red
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Error fetching:', request.url);
  }
  return new Response('Recurso no disponible', { status: 404 });
}