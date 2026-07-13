/**
 * Google Play Developer API kliens (edge-kompatibilis, lib-mentes).
 *
 * A vásárlás-ellenőrzéshez (purchaseToken → valódi, fizetett vásárlás?) a
 * Play Developer API-t hívjuk egy SERVICE ACCOUNT nevében. A hitelesítés
 * OAuth2 JWT-flow: a service account kulcsával RS256-tal aláírt JWT-t
 * access tokenre cseréljük. Mindez WebCrypto-val fut (Cloudflare edge OK).
 *
 * Szükséges env (Cloudflare secret):
 *   GOOGLE_PLAY_PACKAGE_NAME  — pl. app.kinti.twa
 *   GOOGLE_PLAY_SA_EMAIL      — a service account email címe
 *   GOOGLE_PLAY_SA_KEY        — a service account PRIVÁT kulcsa (PKCS8 PEM,
 *                               a JSON kulcsfájl "private_key" mezője, a \n-ek
 *                               megtartásával)
 *
 * Beállítás: Play Console → Setup → API access → service account létrehozás,
 * jogosultság: "View financial data" + "Manage orders". Részletek: android/README.md.
 */
import { getCloudflareEnv } from "./cloudflare";

interface PlayEnv {
  GOOGLE_PLAY_PACKAGE_NAME?: string;
  GOOGLE_PLAY_SA_EMAIL?: string;
  GOOGLE_PLAY_SA_KEY?: string;
}

function playEnv(): PlayEnv {
  try {
    return getCloudflareEnv() as PlayEnv;
  } catch {
    return {
      GOOGLE_PLAY_PACKAGE_NAME: process.env.GOOGLE_PLAY_PACKAGE_NAME,
      GOOGLE_PLAY_SA_EMAIL: process.env.GOOGLE_PLAY_SA_EMAIL,
      GOOGLE_PLAY_SA_KEY: process.env.GOOGLE_PLAY_SA_KEY,
    };
  }
}

export function isPlayConfigured(): boolean {
  const e = playEnv();
  return !!(e.GOOGLE_PLAY_PACKAGE_NAME && e.GOOGLE_PLAY_SA_EMAIL && e.GOOGLE_PLAY_SA_KEY);
}

export function playPackageName(): string {
  return playEnv().GOOGLE_PLAY_PACKAGE_NAME ?? "";
}

/* ---------- OAuth2 service-account access token (JWT bearer flow) ---------- */

function b64url(data: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof data === "string") bytes = new TextEncoder().encode(data);
  else bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.token;

  const env = playEnv();
  if (!env.GOOGLE_PLAY_SA_EMAIL || !env.GOOGLE_PLAY_SA_KEY) {
    throw new Error("Google Play service account nincs konfigurálva");
  }

  const iat = Math.floor(now / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: env.GOOGLE_PLAY_SA_EMAIL,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat,
      exp: iat + 3600,
    }),
  );

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(env.GOOGLE_PLAY_SA_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  const jwt = `${header}.${payload}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`Google OAuth token hiba: HTTP ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: now + data.expires_in * 1000 };
  return data.access_token;
}

/* ---------------------- androidpublisher API hívások ---------------------- */

const API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";

export interface PlaySubscriptionState {
  /** ACTIVE / IN_GRACE_PERIOD → jogosultság él. */
  active: boolean;
  /** Lejárat ISO-8601 (a subscriptions currentPeriodEnd-jébe). */
  expiryTime: string | null;
  /** Nyers subscriptionState a naplózáshoz. */
  state: string;
  acknowledged: boolean;
}

/** Előfizetés állapota (subscriptionsv2). */
export async function getSubscriptionState(purchaseToken: string): Promise<PlaySubscriptionState> {
  const token = await getAccessToken();
  const pkg = playPackageName();
  const res = await fetch(
    `${API}/${encodeURIComponent(pkg)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Play subscriptionsv2 hiba: HTTP ${res.status}`);
  const data = (await res.json()) as {
    subscriptionState?: string;
    acknowledgementState?: string;
    lineItems?: Array<{ expiryTime?: string }>;
  };
  const state = data.subscriptionState ?? "UNKNOWN";
  return {
    active: state === "SUBSCRIPTION_STATE_ACTIVE" || state === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
    expiryTime: data.lineItems?.[0]?.expiryTime ?? null,
    state,
    acknowledged: data.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
  };
}

export interface PlayProductState {
  purchased: boolean;
  acknowledged: boolean;
}

/** Egyszeri termék (pl. job_featured) állapota. */
export async function getProductState(productId: string, purchaseToken: string): Promise<PlayProductState> {
  const token = await getAccessToken();
  const pkg = playPackageName();
  const res = await fetch(
    `${API}/${encodeURIComponent(pkg)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Play products hiba: HTTP ${res.status}`);
  const data = (await res.json()) as { purchaseState?: number; acknowledgementState?: number };
  return {
    purchased: data.purchaseState === 0,
    acknowledged: data.acknowledgementState === 1,
  };
}

/**
 * Vásárlás nyugtázása — e nélkül a Play 3 nap után AUTOMATIKUSAN visszatéríti
 * a vásárlást! Előfizetésnél és terméknél más-más endpoint.
 */
export async function acknowledgePurchase(
  kind: "subscription" | "product",
  productId: string,
  purchaseToken: string,
): Promise<void> {
  const token = await getAccessToken();
  const pkg = playPackageName();
  const path =
    kind === "subscription"
      ? `purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`
      : `purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
  const res = await fetch(`${API}/${encodeURIComponent(pkg)}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  // 400 "already acknowledged" nem hiba — idempotens újrahíváskor előfordul.
  if (!res.ok && res.status !== 400) {
    throw new Error(`Play acknowledge hiba: HTTP ${res.status}`);
  }
}
