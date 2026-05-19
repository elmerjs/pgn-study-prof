const VERSION = 'pgn-study-pro-v1';
const STATIC_CACHE = `${VERSION}-static`;
const AUDIO_CACHE = `${VERSION}-audio`;
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
const AUDIO_FILES = [
  './audios/Claves_del_núcleo_común_para_la_Procuraduría.m4a',
  './audios/Estructura_y_funciones_de_la_Procuraduría.m4a',
  './audios/Ep-3.m4a',
  './audios/La_gestión_documental_evita_la_impunidad.m4a',
  './audios/Ofimática_y_ética_digital_en_la_PGN.m4a',
  './audios/Lógica_y_pilares_de_la_contratación_estatal.m4a',
  './audios/La_ruta_legal_del_gasto_público_colombiano.m4a',
  './audios/Estrategia_psicométrica_para_el_examen_PGN.m4a'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => ![STATIC_CACHE, AUDIO_CACHE].includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (data.type === 'CACHE_ALL_AUDIO') {
    event.waitUntil(cacheAllAudio());
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.destination === 'audio' || AUDIO_FILES.some((file) => url.pathname.endsWith(file.replace('./', '/')))) {
    event.respondWith(audioStrategy(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  if (['style', 'script', 'image', 'manifest', 'font'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});

async function navigationStrategy(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put('./index.html', fresh.clone());
    return fresh;
  } catch {
    return (await caches.match(request)) || (await caches.match('./index.html'));
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function audioStrategy(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    if (cached) return cached;
    return new Response('Audio no disponible offline todavía.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function cacheAllAudio() {
  await notifyClients({ status: 'downloading', message: 'Preparando caché offline de los audios...' });
  try {
    const cache = await caches.open(AUDIO_CACHE);
    for (const file of AUDIO_FILES) {
      const response = await fetch(file, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`No se pudo descargar ${file}`);
      await cache.put(file, response.clone());
    }
    await notifyClients({ status: 'ready' });
  } catch (error) {
    await notifyClients({ status: 'error', message: error.message || 'Error al descargar audios offline.' });
  }
}

async function notifyClients(payload) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'OFFLINE_CACHE_STATUS', payload });
  }
}
