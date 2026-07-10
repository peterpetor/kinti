/**
 * edge-cache.ts — KÉT-SZINTŰ TTL cache az edge-en.
 *
 *   L1 — izolátum-szintű Map: a meleg izolátum újrahasznosítja a kérések közt
 *        (mikroszekundumos hit, de izolátumonként külön, deploy = üres).
 *   L2 — Cloudflare Cache API (`caches.default`): POP-szintű, az ADOTT adat-
 *        központ ÖSSZES izolátuma közösen látja, túléli az izolátum-cserét és
 *        a deployt is (a TTL-ig). Hideg izolátum így nem üti a D1-et, ha a
 *        POP-on már járt valaki → terhelés alatt a D1-hit ~konstans marad,
 *        nem a forgalommal nő. Node-os `next dev` alatt nincs Cache API → az
 *        L2 némán kimarad, az L1 önmagában működik (viselkedés-azonos).
 *
 * Tudatosan vállalt korlátok: POP-onként külön cache (nincs globális
 * invalidálás), frissesség legfeljebb a TTL. Csak MINDENKINEK AZONOS,
 * JSON-szerializálható szerver-adatra (NEM per-user/tranzakciós adatra;
 * Date/Map/függvény a JSON-körutat nem éli túl).
 */

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Szintetikus kulcs-URL az L2-höz — sosem megy ki hálózatra, csak cache-kulcs. */
const L2_PREFIX = "https://edge-cache.kinti.internal/";

/** A workerd Cache API-ja, ha elérhető (CF edge: igen; Node dev/teszt: null). */
function popCache(): Cache | null {
  try {
    const c = (globalThis as { caches?: { default?: Cache } }).caches;
    return c?.default ?? null;
  } catch {
    return null;
  }
}

async function l2Get<T>(key: string): Promise<Entry<T> | null> {
  const cache = popCache();
  if (!cache) return null;
  try {
    const res = await cache.match(L2_PREFIX + encodeURIComponent(key));
    if (!res) return null;
    const body = (await res.json()) as { v: T; exp: number } | null;
    // Az abszolút lejáratot a testben hordozzuk → az L1 pontosan ugyanaddig
    // érvényes, nem adódik össze a két szint TTL-je (staleness ≤ 1×TTL marad).
    if (!body || typeof body.exp !== "number" || body.exp <= Date.now()) return null;
    return { value: body.v, expires: body.exp };
  } catch {
    return null;
  }
}

async function l2Set(key: string, value: unknown, expires: number, ttlMs: number): Promise<void> {
  const cache = popCache();
  if (!cache) return;
  try {
    const body = JSON.stringify({ v: value, exp: expires });
    await cache.put(
      L2_PREFIX + encodeURIComponent(key),
      new Response(body, {
        headers: {
          "content-type": "application/json",
          // A CF Cache API az s-maxage-ből ered a lejárat; a test `exp`-je a
          // pontos határ (óra-eltérés ellen a matchnél is ellenőrizzük).
          "cache-control": `s-maxage=${Math.max(1, Math.ceil(ttlMs / 1000))}`,
        },
      }),
    );
  } catch {
    /* nem szerializálható érték / cache-hiba → az L1 még véd, a hívó nem sérül */
  }
}

/**
 * A `fn` eredményét `ttlMs`-ig cache-eli `key` alatt (L1+L2). Párhuzamos hívások
 * egyetlen `fn`-futásra dedupálódnak (nincs cache-stampede). Hibánál nem
 * cache-elünk, a hívó ugyanazt a hibát kapja, mint cache nélkül.
 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > now) return hit.value;

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const p = (async () => {
    try {
      // L2: egy másik izolátum már betöltötte ezen a POP-on? → nincs D1-hit,
      // és az L1-et is hidratáljuk (a KÖVETKEZŐ kérés már mikroszekundumos).
      const shared = await l2Get<T>(key);
      if (shared) {
        store.set(key, shared);
        return shared.value;
      }

      const value = await fn();
      const expires = Date.now() + ttlMs;
      store.set(key, { value, expires });
      await l2Set(key, value, expires, ttlMs);
      return value;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

/** Cache ürítése — teszthez / kézi invalidáláshoz. Kulcs nélkül az L1-et üríti
 *  (az L2 POP-onkénti, kulcs nélküli ürítése nem lehetséges — TTL-lel jár le). */
export function clearEdgeCache(key?: string): void {
  if (key) {
    store.delete(key);
    try {
      void popCache()?.delete(L2_PREFIX + encodeURIComponent(key));
    } catch {
      /* dev/teszt környezetben nincs L2 */
    }
  } else {
    store.clear();
  }
}
