/**
 * PII-mentes szerveroldali logger.
 *
 * Cloudflare Workers logs-ban szöveges keresés van — bárki, akinek a CF
 * account-hoz hozzáférése van, lát mindent, amit `console.error/log`-gal
 * írunk. A felhasználói tartalom (email, telefonszám, üzenet, név) NEM kerülhet
 * a logba: GDPR adatminimalizálás + ha valaha kiszivárog egy CF-credential,
 * a logokból ne lehessen PII-t kinyerni.
 *
 * Használat:
 *   } catch (err) {
 *     safeLogError("[business/submit] email send failed", err);
 *   }
 *
 * A `err.name`, `err.statusCode` és csak az error message DEBUG-relevant része
 * megy ki — a Resend-hibák tartalmazhatnak címzett email-t, ezt levágjuk.
 */

const EMAIL_RE = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
const PHONE_RE = /\+?\b\d[\d\s()-]{6,}\d\b/g;

/** Eltávolítja az email-címeket és telefonszámokat egy stringből. */
export function redactPii(s: string): string {
  return s
    .replace(EMAIL_RE, "[email-redacted]")
    .replace(PHONE_RE, "[phone-redacted]");
}

interface ErrorLike {
  name?: string;
  message?: string;
  statusCode?: number | string;
  cause?: unknown;
}

/**
 * Hibát logol PII nélkül — csak a típust és a redactált message-et.
 * Az eredeti hiba-objektumot (cause/stack) NEM tartalmazza, mert az
 * potenciálisan PII-t hordoz a Resend / fetch trace-ekben.
 */
export function safeLogError(prefix: string, err: unknown): void {
  let name: string | undefined;
  let status: string | number | undefined;
  let message: string | undefined;

  if (err instanceof Error || (typeof err === "object" && err !== null)) {
    const e = err as ErrorLike;
    name = e.name;
    status = e.statusCode;
    if (e.message) message = redactPii(String(e.message)).slice(0, 200);
    const parts: string[] = [];
    if (name) parts.push(`name=${name}`);
    if (status !== undefined) parts.push(`status=${status}`);
    if (message) parts.push(`msg=${message}`);
    console.error(prefix, parts.join(" · ") || "[unknown error shape]");
  } else {
    // String / number / undefined
    message = redactPii(err === undefined ? "[undefined]" : String(err)).slice(0, 200);
    console.error(prefix, message);
  }

  // Külső monitoring (ha ERROR_WEBHOOK_URL be van állítva). LUSTA import, hogy
  // a safe-log top-level NE húzza be a cloudflare-t → unit-tesztelhető marad.
  // Best-effort: a forwardError waitUntil-lel él tovább, a hibákat elnyeljük.
  void import("./monitoring")
    .then((m) => m.forwardError({ source: "server", prefix, name, status, message }))
    .catch(() => {});
}

/** Hash-szel egyenértékű "rövidítés" ami azonosítja a sort de nem fedi fel. */
export function safeIdHint(id: string | null | undefined): string {
  if (!id) return "[null]";
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}
