"use client";

/**
 * offline-cache.ts — kliensoldali offline-tárolás a böngésző Cache API-ján.
 * A `kinti-guides-offline` STABIL nevű cache-be tölt, amit a service worker
 * megőriz app-frissítésnél és offline navigációnál kiszolgál (lásd public/sw.js).
 * Best-effort: hiba (nincs Cache API / hálózat) SOSEM dob.
 */
export const OFFLINE_CACHE = "kinti-guides-offline";

/** Egy vagy több oldal eltárolása offline olvasásra. */
export async function cacheOfflinePaths(paths: string[]): Promise<void> {
  if (typeof caches === "undefined" || paths.length === 0) return;
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    await Promise.all(
      paths.map(async (p) => {
        try {
          const res = await fetch(p, { cache: "reload" });
          if (res.ok) await cache.put(p, res.clone());
        } catch {
          /* egy-egy oldal kihagyható */
        }
      }),
    );
  } catch {
    /* nincs Cache API */
  }
}

/** Egy korábban offline-ra mentett oldal eltávolítása a cache-ből. */
export async function removeOfflinePath(path: string): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.delete(path);
  } catch {
    /* ignore */
  }
}
