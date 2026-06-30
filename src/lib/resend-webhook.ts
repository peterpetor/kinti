/**
 * resend-webhook.ts — a Resend webhook aláírás-ellenőrzése (Svix-séma).
 *
 * A Resend a webhookokat Svix-szel írja alá: `svix-id`, `svix-timestamp`,
 * `svix-signature` fejlécek, a titok formátuma `whsec_<base64>`. A jel:
 *   base64( HMAC-SHA256( base64decode(secret), "{id}.{timestamp}.{body}" ) )
 * A `svix-signature` szóközzel elválasztott `v1,<base64>` lista (lehet több aktív
 * titok). Web Crypto-val, külső csomag nélkül (edge-kompatibilis).
 */
export async function verifyResendSignature(
  secret: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  body: string,
): Promise<boolean> {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;

  // Replay-védelem: ±5 perc tolerancia a timestampre.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(secretKey), (c) => c.charCodeAt(0));
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey("raw", keyBytes as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`) as BufferSource);
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

  return signature.split(" ").some((part) => {
    const comma = part.indexOf(",");
    const sig = comma >= 0 ? part.slice(comma + 1) : part;
    return timingSafeEqual(sig, expected);
  });
}

/** Konstans-idejű string-összehasonlítás (timing-attack ellen). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
