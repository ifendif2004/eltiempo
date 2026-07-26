// ============================================================
// SERVICE WORKER - eltiempo. PWA
// Estrategia: Cache-First para assets, Network-First para API
// ============================================================

const CACHE_NAME = 'eltiempo-v1.0.2';
const STATIC_CACHE = 'eltiempo-static-v1.0.2';
const API_CACHE = 'eltiempo-api-v1.0.2';

// Assets estáticos para cachear en la instalación
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap'
];

// URLs de API externas (network-first con fallback a cache)
const API_URLS = [
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'nominatim.openstreetmap.org'
];

// ============================================================
// INSTALL: Pre-cachear todos los assets estáticos
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando assets estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Assets cacheados correctamente.');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((err) => {
        console.error('[SW] Error al cachear assets:', err);
      })
  );
});

// ============================================================
// ACTIVATE: Limpiar caches antiguas
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Eliminando cache antigua:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activado y caches limpias.');
        return self.clients.claim(); // Tomar control de todos los clientes
      })
  );
});

// ============================================================
// FETCH: Estrategia inteligente según el tipo de recurso
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean GET
  if (request.method !== 'GET') return;

  // Ignorar extensiones de Chrome y otros protocolos no-http
  if (!request.url.startsWith('http')) return;

  // ---- ESTRATEGIA 1: Network-First para APIs meteorológicas ----
  const isApiRequest = API_URLS.some((apiUrl) => url.hostname.includes(apiUrl));
  if (isApiRequest) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // ---- ESTRATEGIA 2: Cache-First para Google Fonts ----
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // ---- ESTRATEGIA 3: Cache-First para assets estáticos propios ----
  event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
});

// ============================================================
// ESTRATEGIA: Cache-First (assets estáticos, fuentes)
// Si existe en cache → devuelve desde cache.
// Si no → descarga, guarda en cache y devuelve.
// ============================================================
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Si falla todo, intentar devolver la página offline
    const offlinePage = await caches.match('./index.html');
    return offlinePage || new Response('Sin conexión', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// ============================================================
// ESTRATEGIA: Network-First (APIs de clima)
// Intenta red primero para datos frescos.
// Si falla → devuelve desde cache si existe (datos del clima anteriores).
// ============================================================
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Red no disponible, sirviendo desde cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Respuesta de error amigable para la API
    return new Response(
      JSON.stringify({ error: 'Sin conexión. Mostrando datos cacheados.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ============================================================
// PUSH NOTIFICATIONS (preparado para futuras notificaciones)
// ============================================================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'eltiempo.';
  const options = {
    body: data.body || 'Actualización del tiempo disponible.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(clients.openWindow(urlToOpen));
});
