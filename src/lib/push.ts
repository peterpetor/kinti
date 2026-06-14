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
  /** A feliratkozó publikus kulcsa (base64url) — titkosított payloadhoz kell. */
  p256dh?: string;
  /** A feliratkozó auth-titka (base64url) — titkosított payloadhoz kell. */
  auth?: string;
}

export interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

/** TS 5.x szigorítás miatt a Uint8Array → BufferSource castot egy helperbe tesszük. */
const bs = (u: Uint8Array): BufferSource => u as unknown as BufferSource;

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", bs(ikm), "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: bs(salt), info: bs(info) }, key, length * 8);
  return new Uint8Array(bits);
}

/**
 * Web Push payload titkosítás (RFC 8291 + aes128gcm content coding, RFC 8188).
 * A body: salt(16) | rs(4) | idlen(1)=65 | as_public(65) | ciphertext.
 */
async function encryptPayload(p256dhB64: string, authB64: string, plaintext: Uint8Array): Promise<Uint8Array> {
  const uaPublic = b64urlToBytes(p256dhB64); // 65 bájt (0x04||X||Y)
  const authSecret = b64urlToBytes(authB64); // 16 bájt

  // Efemer ECDH kulcspár + közös titok a feliratkozó publikus kulcsával.
  const asKeyPair = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])) as CryptoKeyPair;
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", asKeyPair.publicKey)); // 65 bájt
  const uaKey = await crypto.subtle.importKey("raw", bs(uaPublic), { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, asKeyPair.privateKey, 256));

  const salt = crypto.getRandomValues(new Uint8Array(16));

  // RFC 8291: IKM = HKDF(salt=auth, ikm=ecdh, info="WebPush: info\0"||ua||as, 32)
  const keyInfo = concatBytes(new TextEncoder().encode("WebPush: info"), new Uint8Array([0]), uaPublic, asPublic);
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);

  // RFC 8188: CEK (16) + NONCE (12) az IKM-ből a random salttal.
  const cek = await hkdf(salt, ikm, concatBytes(new TextEncoder().encode("Content-Encoding: aes128gcm"), new Uint8Array([0])), 16);
  const nonce = await hkdf(salt, ikm, concatBytes(new TextEncoder().encode("Content-Encoding: nonce"), new Uint8Array([0])), 12);

  // Egyetlen rekord: plaintext || 0x02 (utolsó-rekord határoló).
  const padded = concatBytes(plaintext, new Uint8Array([0x02]));
  const aesKey = await crypto.subtle.importKey("raw", bs(cek), { name: "AES-GCM" }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: bs(nonce), tagLength: 128 }, aesKey, bs(padded)));

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  return concatBytes(salt, rs, new Uint8Array([asPublic.length]), asPublic, ciphertext);
}

/**
 * Egyetlen feliratkozónak küld push-t. Ha `payload` ÉS a target p256dh+auth
 * megvan → titkosított payload (a SW a konkrét szöveget mutatja). Egyébként
 * payload nélküli „tickle". Visszaadja a HTTP státuszt (201=ok; 404/410=törlendő).
 */
export async function sendPush(
  privateKeyB64url: string,
  target: PushTarget,
  payload?: PushPayload,
): Promise<number> {
  const audience = new URL(target.endpoint).origin;
  const key = await importSigningKey(privateKeyB64url);
  const jwt = await buildVapidJwt(audience, key);

  const headers: Record<string, string> = {
    Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
    TTL: "86400",
  };

  let body: Uint8Array | undefined;
  if (payload && target.p256dh && target.auth) {
    try {
      const plaintext = new TextEncoder().encode(JSON.stringify(payload));
      body = await encryptPayload(target.p256dh, target.auth, plaintext);
      headers["Content-Encoding"] = "aes128gcm";
      headers["Content-Type"] = "application/octet-stream";
    } catch {
      // Titkosítás hiba → payload nélküli tickle (a SW az általánosat mutatja).
      body = undefined;
    }
  }

  const res = await fetch(target.endpoint, { method: "POST", headers, body: body as BodyInit | undefined });
  return res.status;
}
