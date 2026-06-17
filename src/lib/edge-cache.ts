/**
 * edge-cache.ts — pehelysúlyú, IZOLÁTUM-szintű TTL memó-cache.
 *
 * A Cloudflare Workers a meleg izolátumot újrahasznosítja a kérések között, így
 * egy modul-szintű Map túléli a kéréseket (amíg az izolátum él). Ezzel a gyakran
 * kért, MINDENKINEK AZONOS szerver-adat (pl. a kezdőlap vállalkozás/esemény
 * listája) ~N másodpercig kiszolgálható a D1 újra-lekérdezése nélkül — ez a
 * page-szintű ISR (next-on-pages alatt megbízhatatlan) praktikus megfelelője.
 *
 * Tudatosan vállalt korlátok: izolátumonként külön cache (nincs globális
 * invalidálás), a frissesség legfeljebb a TTL, új deploy = új izolátum = friss
 * cache. Csak olyan adatra használd, ahol a ≤TTL késleltetés elfogadható (NEM
 * per-user vagy tranzakciós adatra).
 */

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * A `fn` eredményét `ttlMs`-ig cache-eli `key` alatt. Párhuzamos hívások egyetlen
 * `fn`-futásra dedupálódnak (nincs cache-stampede). Hibánál nem cache-elünk, a
 * hívó ugyanazt a hibát kapja, mint cache nélkül.
 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > now) return hit.value;

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const p = (async () => {
    try {
      const value = await fn();
      store.set(key, { value, expires: Date.now() + ttlMs });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

/** Cache ürítése — teszthez / kézi invalidáláshoz. Kulcs nélkül mindent töröl. */
export function clearEdgeCache(key?: string): void {
  if (key) store.delete(key);
  else store.clear();
}
