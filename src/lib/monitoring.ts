/**
 * monitoring.ts — redaktált hiba-események továbbítása külső ingest-végpontra.
 *
 * Vendor-AGNOSZTIKUS: egy konfigurálható `ERROR_WEBHOOK_URL`-re küld JSON POST-ot,
 * ami működik Logflare HTTP-ingesttel, Baselime events-szel, egy Sentry-relay-jel
 * vagy akár Slack/Discord-webhookkal. Alapból KIKAPCSOLVA — env nélkül no-op.
 *
 * Best-effort és NEM blokkoló: a fetch a `waitUntil`-ön él tovább a válasz után,
 * a hibákat elnyeli. A payload MÁR redaktált (a hívó a safe-log-on át adja át),
 * így PII nem hagyja el a rendszert.
 *
 * FONTOS: ezt a modult csak LUSTÁN (dynamic import) hívd a cloudflare-mentes
 * helyekről (pl. safe-log), különben a `./cloudflare` tranzitív importja a
 * unit-teszteket megtörné.
 */
import { getCloudflareEnv, getCloudflareCtx } from "./cloudflare";

export interface MonitoringEvent {
  source: "server" | "client";
  /** Kontextus-címke, pl. "[business/submit] email send failed". */
  prefix: string;
  /** Hiba neve (pl. TypeError). */
  name?: string;
  /** HTTP/alkalmazás státusz, ha van. */
  status?: string | number;
  /** MÁR redaktált üzenet. */
  message?: string;
  /** Next.js error digest (kliens). */
  digest?: string;
  /** Kliens: az ablak URL-je, query nélkül. */
  url?: string;
}

export function forwardError(event: MonitoringEvent): void {
  let url: string | undefined;
  try {
    url = getCloudflareEnv().ERROR_WEBHOOK_URL?.trim();
  } catch {
    return; // nincs request-kontextus (build/statikus) → kihagyjuk
  }
  if (!url) return; // monitoring kikapcsolva

  const payload = JSON.stringify({
    service: "kinti",
    level: "error",
    ts: new Date().toISOString(),
    ...event,
  });

  try {
    const p = fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
    }).catch(() => {});
    getCloudflareCtx()?.waitUntil(p);
  } catch {
    /* best-effort — a monitoring sosem törheti meg a fő műveletet */
  }
}
