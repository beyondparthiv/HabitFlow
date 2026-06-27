// HabitFlow service worker — network-first with cache fallback for offline
// viewing. Only same-origin GETs are cached (Supabase API calls pass through).
const CACHE = "habitflow-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // skip cross-origin (Supabase)

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches
          .open(CACHE)
          .then((cache) => cache.put(request, copy))
          .catch(() => {});
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
