import { getCloudflareEnv } from "./cloudflare";

/**
 * Cloudflare Turnstile — szerver-oldali siteverify.
 *
 * A kliens megkapja a token-t a widget-től (`<TurnstileWidget />`), és átadja
 * a beküldő végpontoknak; itt verifikáljuk, hogy a token valódi és még
 * nem lett "elsütve". A Cloudflare endpoint:
 *   POST https://challenges.cloudflare.com/turnstile/v0/siteverify
 *
 * GDPR-tiszta: a Cloudflare nem küld vissza PII-t, csak a token érvényességi
 * státuszát. Az IP-t opcionálisan elküldhetjük a kontextushoz, de nem mentjük.
 */
export interface TurnstileResult {
  ok: boolean;
  errorCodes: string[];
}

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  if (!token) return { ok: false, errorCodes: ["missing-input-response"] };

  const env = getCloudflareEnv();
  const secret = env.TURNSTILE_SECRET;
  if (!secret) return { ok: false, errorCodes: ["missing-secret"] };

  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );
  if (!res.ok) return { ok: false, errorCodes: [`http-${res.status}`] };

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    "error-codes"?: string[];
  };
  return {
    ok: Boolean(data.success),
    errorCodes: data["error-codes"] ?? [],
  };
}
