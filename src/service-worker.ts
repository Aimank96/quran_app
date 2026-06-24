/**
 * Service Worker for offline support and bandwidth optimization
 * 
 * This caches Quran data and audio locally on the user's device.
 * After first download, subsequent visits use cached data (no bandwidth).
 * Users can help save server costs by donating.
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'quran-v1';
const CACHE_NAMES = {
  data: `${CACHE_VERSION}-data`,
  audio: `${CACHE_VERSION}-audio`,
  pages: `${CACHE_VERSION}-pages`,
};

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── Install: Cache static assets ───────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.pages).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate: Clean up old caches ──────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHE_NAMES).includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: Cache-first strategy for data/audio, Network-first for HTML ─────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Audio files: Cache-first (save bandwidth!)
  if (url.pathname.startsWith('/audio/') || url.hostname.includes('firebasestorage')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response; // Return cached audio
        }
        return fetch(request).then((response) => {
          // Cache successful audio responses
          if (response.ok && request.destination === 'audio') {
            const clone = response.clone();
            caches.open(CACHE_NAMES.audio).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Data files (surah JSON): Cache-first
  if (
    url.pathname.includes('/data/') ||
    url.pathname.includes('surah-') ||
    url.pathname.includes('surahs.json')
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAMES.data).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages: Network-first (always get latest)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAMES.pages).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request) || new Response('Offline');
        })
    );
    return;
  }

  // Other assets: Network-first
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => caches.match(request))
  );
});
