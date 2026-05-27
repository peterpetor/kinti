/**
 * VAPID PUBLIC kulcs — nyilvános, ezért biztonságos a kódban tartani.
 * Használja a kliens (applicationServerKey a feliratkozáshoz) ÉS a szerver
 * (a `k` paraméter a VAPID Authorization fejlécben).
 *
 * A PRIVÁT kulcs SOSE itt van — az Cloudflare titok (VAPID_PRIVATE_KEY).
 */
export const VAPID_PUBLIC_KEY =
  "BBXSR44h7QwSUFDchNDcL_KEvmKQm_xTBcbTtnXNUX4HSx5-DK6Mf05KwnlMlbDJojZmJsBEVQEcm0FACMyVIxk";

/** A VAPID `sub` claim — kapcsolattartó (mailto vagy https URL). */
export const VAPID_SUBJECT = "mailto:info@kinti.app";

/** base64url → Uint8Array (a böngésző applicationServerKey-jéhez). */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
