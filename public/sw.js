// sw.js - Service Worker file

// Define a cache name
const CACHE_NAME = 'my-pwa-cache-v1';

// List the assets to cache during installation
// Make sure to include all critical files your app needs to run offline
const urlsToCache = [
  '/', // Cache the root path
  '/index.html', // Cache the main HTML file
  '/manifest.json', // Cache the web app manifest
  // Add paths to your CSS, JS bundles, and other essential assets here
  // For example:
  '/static/css/main.css',
  '/static/js/main.js',
  '/assets/unicorn.gif', // Include your unicorn GIF
  // If you are using Pure.css from a CDN, you might not cache it here
  // unless you download it and serve it locally.
];

// Install event: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache addAll failed:', error);
      })
  );
});

// Fetch event: Serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the asset is in the cache, serve it
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // If the asset is not in the cache, fetch it from the network
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Optional: Cache new successful responses
            // Be cautious with caching dynamic content or large files here
            // if (networkResponse.ok) {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME).then((cache) => {
            //     cache.put(event.request, responseToCache);
            //   });
            // }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', event.request.url, error);
            // You could serve an offline page here if the fetch fails
            // return caches.match('/offline.html'); // Example
          });
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match the current cache name
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

