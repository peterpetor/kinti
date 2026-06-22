/**
 * paddle.ts — Paddle (Billing) szerver-oldali integráció.
 *
 * - createTransaction(): a checkout-ot SZERVEREN hozzuk létre a már validált
 *   custom_data-val (userId/businessId/jobId), majd a kliens a Paddle.js
 *   overlay-ben ezt a transactiont nyitja meg. Így a jogosultság-adat
 *   szerver-kontrollált marad (lásd a checkout route ownership-ellenőrzését).
 * - verifyPaddleSignature(): a webhook `Paddle-Signature` fejlécének HMAC-SHA256
 *   ellenőrzése (constant-time).
 */
import { getCloudflareEnv } from "./cloudflare";

const PADDLE_API_BASE =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

/** Szerver-oldali Paddle transaction (checkout) létrehozása → transaction id. */
export async function createTransaction(
  priceId: string,
  customData: Record<string, string>,
  customer?: { email?: string },
): Promise<string> {
  const apiKey = getCloudflareEnv().PADDLE_API_KEY;
  if (!apiKey) throw new Error("Missing PADDLE_API_KEY");

  const body: Record<string, unknown> = {
    items: [{ price_id: priceId, quantity: 1 }],
    custom_data: customData,
    collection_mode: "automatic",
  };
  if (customer?.email) body.customer = { email: customer.email };

  const res = await fetch(`${PADDLE_API_BASE}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paddle transaction error: ${res.status} ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { data?: { id?: string } };
  const id = data.data?.id;
  if (!id) throw new Error("Paddle transaction: missing id");
  return id;
}

/**
 * Paddle webhook aláírás-ellenőrzés. A `Paddle-Signature` fejléc formátuma:
 *   `ts=<unix>;h1=<hex hmac>`
 * ahol h1 = HMAC-SHA256(secret, `${ts}:${rawBody}`). Constant-time összevetés
 * (crypto.subtle.verify), titok hiányában / hibás formátumnál false.
 */
export async function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = getCloudflareEnv().PADDLE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const kv of signatureHeader.split(";")) {
    const i = kv.indexOf("=");
    if (i > 0) parts[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
  }
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = new Uint8Array(
    h1.match(/[\da-f]{2}/gi)?.map((b) => parseInt(b, 16)) || [],
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(`${ts}:${rawBody}`));
}
