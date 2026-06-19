/**
 * monitoring.ts — redaktált hiba-események továbbítása külső ingest-végpontra.
 *
 * Vendor-AGNOSZTIKUS: egy konfigurálható `ERROR_WEBHOOK_URL`-re küld POST-ot.
 * A test FORMÁTUMA a URL-ből derül ki: Discord-webhook → `{content}`, Slack →
 * `{text}` (ezek SAJÁT sémát várnak, különben 400-at adnának), minden más
 * (Logflare/Baselime/saját ingest) → általános JSON. Alapból KIKAPCSOLVA — env
 * nélkül no-op.
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

/**
 * A webhook-test összeállítása a cél-URL formátuma szerint. Discord/Slack saját
 * sémát vár (különben 400); minden más általános JSON-t kap.
 */
function buildWebhookBody(url: string, event: MonitoringEvent): string {
  // Ember-olvasható, egysoros összefoglaló a chat-platformokhoz (PII-mentes,
  // a hívó már redaktálta). Discord content-limit 2000 → 1800-ra vágjuk.
  const summary = [
    "🔴 **kinti**",
    `\`${event.source}\``,
    event.prefix,
    event.name ? `· ${event.name}` : "",
    event.status != null ? `(status ${event.status})` : "",
    event.message ? `\n${event.message}` : "",
    event.url ? `\n<${event.url}>` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 1800);

  if (/discord(app)?\.com\/api\/webhooks/i.test(url)) {
    return JSON.stringify({ content: summary });
  }
  if (/hooks\.slack\.com/i.test(url)) {
    return JSON.stringify({ text: summary });
  }
  // Általános JSON-ingest (Logflare / Baselime / saját endpoint).
  return JSON.stringify({
    service: "kinti",
    level: "error",
    ts: new Date().toISOString(),
    ...event,
  });
}

export function forwardError(event: MonitoringEvent): void {
  let url: string | undefined;
  try {
    url = getCloudflareEnv().ERROR_WEBHOOK_URL?.trim();
  } catch {
    return; // nincs request-kontextus (build/statikus) → kihagyjuk
  }
  if (!url) return; // monitoring kikapcsolva

  const payload = buildWebhookBody(url, event);

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
