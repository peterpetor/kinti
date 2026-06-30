/**
 * push-client.ts — kliensoldali push-segédek.
 *
 * `readyRegistration`: hang-biztos service-worker-lekérés. A
 * `navigator.serviceWorker.ready` SOHA nem oldódik fel, ha nincs (és nem is lesz)
 * aktív SW — ezért előbb `getRegistration()` (azonnal felel), és ha van, de még
 * nem aktív, a `ready`-t timeout-tal versenyeztetjük. (Megegyezik a job-alert-radar
 * korábbi helyi helperével — közös, hogy ne driftelődjön szét.)
 */
export async function readyRegistration(timeoutMs = 5000): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration().catch(() => null);
  if (existing?.active) return existing;
  if (!existing) return null;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<ServiceWorkerRegistration | null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}
