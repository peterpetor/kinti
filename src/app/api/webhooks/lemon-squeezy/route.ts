import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { upsertSubscription } from "@/lib/subscriptions";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/lemon-squeezy — Lemon Squeezy előfizetés-webhook.
 *
 * Plug-and-play: amíg a `LEMONSQUEEZY_WEBHOOK_SECRET` env nincs beállítva, az
 * endpoint 503-at ad (nincs bekötve). Ha megvan a secret, ellenőrzi az
 * X-Signature HMAC-SHA256 aláírást, majd frissíti az előfizetés-állapotot.
 *
 * A user_id a checkout passthrough custom mezőjéből jön
 * (checkout[custom][user_id]) → meta.custom_data.user_id.
 */

interface LsWebhook {
  meta?: { event_name?: string; custom_data?: { user_id?: string } };
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      customer_id?: number | string;
      variant_name?: string;
      renews_at?: string | null;
      ends_at?: string | null;
    };
  };
}

/** HMAC-SHA256(secret, body) hex (Web Crypto, edge-kompatibilis). */
async function hmacHex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Konstans-idejű string-összehasonlítás (timing-attack ellen). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function POST(req: Request) {
  const secret = getCloudflareEnv().LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook nincs konfigurálva." }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const expected = await hmacHex(secret, raw);
  if (!signature || !timingSafeEqual(signature.toLowerCase(), expected)) {
    return NextResponse.json({ error: "Érvénytelen aláírás." }, { status: 401 });
  }

  let payload: LsWebhook;
  try {
    payload = JSON.parse(raw) as LsWebhook;
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "";
  // Csak előfizetés-eseményekkel foglalkozunk.
  if (!eventName.startsWith("subscription_")) {
    return NextResponse.json({ ok: true, ignored: eventName });
  }

  const userId = payload.meta?.custom_data?.user_id;
  const attrs = payload.data?.attributes;
  if (!userId || !attrs?.status) {
    // Nem tudjuk kihez kötni / nincs státusz — naplózzuk, de 200 (ne retry-zzon a LS örökké).
    safeLogError("lemon-squeezy webhook", new Error(`hiányzó user_id vagy status (${eventName})`));
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await upsertSubscription({
      userId,
      status: attrs.status,
      plan: attrs.variant_name ?? "pro",
      lsSubscriptionId: payload.data?.id ?? null,
      lsCustomerId: attrs.customer_id != null ? String(attrs.customer_id) : null,
      // Lemondott előfizetésnél `ends_at` a hozzáférés vége; aktívnál `renews_at`.
      currentPeriodEnd: attrs.ends_at ?? attrs.renews_at ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("lemon-squeezy webhook upsert", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
