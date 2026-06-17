/**
 * report-client-error.ts — kliens-oldali hiba jelentése a szervernek.
 *
 * Az error boundary-k (global-error, route-error) hívják: a böngészőben történt
 * crash a Cloudflare Workers logokba SOHA nem kerül be, ezért egy belső route-ra
 * (`/api/client-error`) küldjük, ami redaktál és továbbít a monitoringra.
 *
 * Tisztán kliens-API (fetch/location) — nincs szerver/cloudflare import, hogy
 * a böngésző-bundle-ben gond nélkül fusson. Best-effort, sosem dob.
 */
export function reportClientError(error: { name?: string; message?: string; digest?: string } | null | undefined): void {
  try {
    if (typeof fetch !== "function") return;
    const body = JSON.stringify({
      name: error?.name,
      message: error?.message,
      digest: error?.digest,
      url: typeof location !== "undefined" ? location.href : undefined,
    });
    // keepalive: túléli a lap-elhagyást/újratöltést is.
    void fetch("/api/client-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* best-effort */
  }
}
