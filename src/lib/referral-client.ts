/**
 * referral-client.ts — „Küldj egy magyart" kliensoldali segédek.
 *
 * NINCS account/identitás: a meghívó-kód a böngészőben generált random érték
 * (localStorage), nem köthető a felhasználóhoz. A szerver csak anonim konverziókat
 * számol kódonként ([[privacy-no-server-identity]]).
 */

const CODE_KEY = "kinti_invite_code";
const REFERRED_KEY = "kinti_referred_by";
const RE = /^[a-z0-9]{4,16}$/i;
// Félreérthetetlen karakterek (nincs 0/o/1/l/i).
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function genCode(): string {
  try {
    const arr = new Uint8Array(7);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => ALPHABET[b % ALPHABET.length]).join("");
  } catch {
    return Math.random().toString(36).slice(2, 9);
  }
}

/** A felhasználó saját (anonim) meghívó-kódja — első hívásra generálva, utána stabil. */
export function getMyInviteCode(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(CODE_KEY);
    if (existing && RE.test(existing)) return existing;
    const code = genCode();
    localStorage.setItem(CODE_KEY, code);
    return code;
  } catch {
    return "";
  }
}

export function inviteUrl(code: string): string {
  return `https://kinti.app/meghivo/${code}`;
}

/** Ki hívott meg (ha meghívó-linkről jött) — első meghívó nyer, nem írható felül. */
export function getReferredBy(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(REFERRED_KEY);
    return v && RE.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function setReferredBy(code: string): void {
  if (typeof window === "undefined" || !RE.test(code)) return;
  try {
    if (!localStorage.getItem(REFERRED_KEY)) localStorage.setItem(REFERRED_KEY, code);
  } catch {
    /* ignore */
  }
}

export function isValidInviteCode(code: string): boolean {
  return RE.test(code);
}
