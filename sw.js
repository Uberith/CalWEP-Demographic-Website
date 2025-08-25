const CACHE_NAME = "calwep-static-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/dist/main.js",
  "/dist/maps.js",
  "/dist/pdf.js",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
});
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Only cache same-origin requests. Let API calls to external hosts pass
  // through untouched so the browser handles them normally. This avoids
  // accidentally caching responses from the backend API which could cause
  // stale data or misrouted requests when the base URL changes.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Bypass caching for API requests so dynamic responses like static map
  // images are always fetched from the network rather than the service worker
  // cache.
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }),
  );
});
