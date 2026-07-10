/**
 * wa-phone.ts — telefonszám → wa.me-kompatibilis nemzetközi számjegysor.
 * TISZTA modul (unit-tesztelhető) — a kliens-oldali WaLink/PhoneReveal használja.
 */

/** Ország → nemzetközi hívókód (a wa.me-nek országkódos szám kell). */
const COUNTRY_DIAL: Record<string, string> = { CH: "41", AT: "43", DE: "49", NL: "31", HU: "36" };

/**
 * Telefonszám → wa.me-kompatibilis nemzetközi számjegysor, vagy null, ha nem
 * állapítható meg biztonsággal. "+41…"/"0041…" → 41…; helyi "079…" alak CSAK
 * ismert országnál konvertálható (dial + a vezető 0 nélkül) — egyébként inkább
 * NEM mutatunk WhatsApp-gombot, mint hogy rossz számra írjon a felhasználó.
 */
export function waNumber(phone: string, country?: string | null): string | null {
  // A gyakori "+49 (0)151…" írásmód zárójeles (0)-ját EL KELL dobni, különben
  // rossz (0-val kezdődő körzetű) nemzetközi számot gyártanánk.
  const raw = phone.trim().replace(/\(0\)/g, "");
  const digits = raw.replace(/\D/g, "");
  let out: string | null = null;
  if (raw.startsWith("+")) out = digits;
  else if (digits.startsWith("00")) out = digits.slice(2);
  else if (digits.startsWith("0") && country && COUNTRY_DIAL[country]) {
    out = COUNTRY_DIAL[country] + digits.slice(1);
  }
  if (!out || out.length < 8 || out.length > 15) return null;
  return out;
}

/** Előre kitöltött nyitó-üzenet — udvarias + Kinti-attribúció (a vállalkozó
 *  látja, honnan jött az érdeklődő → a Szaknévsor értékének bizonyítéka). */
export const WA_PREFILL = "Üdvözlöm! A Kinti szaknévsorában (kinti.app) találtam meg Önt. ";
