/**
 * Web Push küldés az edge-en (Cloudflare) — Web Crypto API-val, külső lib nélkül.
 *
 * Stratégia: PAYLOAD NÉLKÜLI push (RFC 8030 + VAPID/RFC 8292). Így nem kell a
 * bonyolult aes128gcm payload-titkosítás (RFC 8291) — csak a VAPID JWT-t kell
 * ES256-tal aláírni, amit a SubtleCrypto edge-en is tud. A push-szolgáltató egy
 * üres "tickle"-t kézbesít; a service worker `push` eseménye általános
 * értesítést mutat. A kanton-célzás szerver-oldalon történik (kinek küldünk).
 */

import { VAPID_PUBLIC_KEY, VAPID_SUBJECT } from "./push-keys";

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s));
}

/**
 * A VAPID privát kulcsból (d) + a publikus kulcsból (x,y) ECDSA P-256 aláíró
 * kulcs. A publikus kulcs 65 bájtos: 0x04 || X(32) || Y(32).
 */
async function importSigningKey(privateKeyB64url: string): Promise<CryptoKey> {
  const pub = b64urlToBytes(VAPID_PUBLIC_KEY);
  if (pub.length !== 65 || pub[0] !== 0x04) {
    throw new Error("Érvénytelen VAPID publikus kulcs (65 bájt, 0x04 prefix kell).");
  }
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    d: privateKeyB64url,
    ext: true,
  };
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

/** VAPID JWT (ES256) az adott push-szolgáltató originjára (aud). */
async function buildVapidJwt(audience: string, key: CryptoKey): Promise<string> {
  const header = strToB64url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = strToB64url(
    JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 óra
      sub: VAPID_SUBJECT,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );
  // A SubtleCrypto ES256 aláírása már r||s (IEEE P1363) — pont ez kell a JWS-hez.
  return `${signingInput}.${bytesToB64url(new Uint8Array(sig))}`;
}

export interface PushTarget {
  endpoint: string;
}

/**
 * Egyetlen feliratkozónak küld egy (payload nélküli) push-t. Visszaadja a
 * push-szolgáltató HTTP státuszát. 201 = kézbesítve; 404/410 = az endpoint
 * megszűnt (a hívó törölje a DB-ből).
 */
export async function sendPush(
  privateKeyB64url: string,
  target: PushTarget,
): Promise<number> {
  const audience = new URL(target.endpoint).origin;
  const key = await importSigningKey(privateKeyB64url);
  const jwt = await buildVapidJwt(audience, key);

  const res = await fetch(target.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      TTL: "86400",
    },
  });
  return res.status;
}
