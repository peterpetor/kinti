/*
 * kinti Service Worker — pure browser script (NEM Cloudflare Worker!).
 *
 * Stratégia röviden:
 *   • /_next/static/* és /icons/*   →  cache-first (immutable build-artifaktok)
 *   • /api/media/*                  →  cache-first (R2 immutable URL-ek)
 *   • /api/* (minden más)           →  bypass — soha nem cache-eljük (D1/Clerk élő)
 *   • navigation kérések (HTML)     →  network-first, offline fallback /offline-ra
 *   • egyéb GET                     →  stale-while-revalidate
 *
 * Verziózás: a `VERSION` változót növeljük, ha a kasztni-cache stratégia/precache
 * lista változik. Régi VERSION-ű cache-eket az `activate` lépésben töröljük.
 *
 * Frissítés: `skipWaiting` + `clients.claim` automatikusan — a kliens
 * (sw-register.tsx) felismeri az új SW-t és megkérdezi a felhasználót,
 * akar-e azonnal frissíteni.
 */

const VERSION = "kinti-v3";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const MEDIA_CACHE = `${VERSION}-media`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const OFFLINE_URL = "/offline";

/** Telepítéskor előmelegítjük a legfontosabb statikus erőforrásokat. */
const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/kinti.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // A precache nem-kritikus: ha egyetlen fájl is hiányzik, ne bukjon el a teljes install.
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {
            /* ignoráljuk az egyedi hibákat */
          }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      );
      // Navigation Preload: a navigációs kérésnél a böngésző párhuzamosan indít
      // egy hálózati kérést, mire a SW felébred — gyorsabb élmény.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // külső kéréseket sose nyúljunk meg

  // Statikus build-artifaktok → cache-first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // R2 média (immutable kulccsal) → cache-first
  if (url.pathname.startsWith("/api/media/")) {
    event.respondWith(cacheFirst(req, MEDIA_CACHE));
    return;
  }

  // Minden más /api/* → soha ne cache-eljünk; legyen friss
  if (url.pathname.startsWith("/api/")) return;

  // Navigációs kérés (HTML oldal) → network-first, fallback /offline-ra
  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage(event));
    return;
  }

  // Egyéb GET (pl. /manifest, /favicon, root assetek) → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

/** Üzenetkezelés: a kliens SKIP_WAITING-gel kérheti az új SW azonnali aktiválását. */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// --- stratégiák -----------------------------------------------------------

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    // CSAK 200-at (vagy opaque-ot) cache-elünk. A Cache API NEM engedi a
    // 206 Partial Content-et (range-kérésnél kapunk ilyet pl. /api/media-ra)
    // — különben "Partial response is unsupported" hibára futunk.
    if (res.status === 200 || res.type === "opaque") {
      cache.put(req, res.clone()).catch(() => {
        /* idempotens: ha mégis hibázik, csak nem cache-elünk */
      });
    }
    return res;
  } catch (err) {
    // Ha még semmi nincs cache-ben sem, a böngésző saját hiba-oldala jön.
    throw err;
  }
}

async function networkFirstPage(event) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    // navigation preload válasz, ha van
    const preload = await event.preloadResponse;
    const res = preload || (await fetch(event.request));
    // Csak 200 cache-elhető (a 206-ot a Cache API elutasítja).
    if (res && res.status === 200) {
      cache.put(event.request, res.clone()).catch(() => {});
    }
    return res;
  } catch {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("Offline", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then((res) => {
      // Csak 200 cache-elhető (a 206-ot a Cache API elutasítja).
      if (res.status === 200) {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}
