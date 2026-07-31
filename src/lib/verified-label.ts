/**
 * „Ellenőrizve: 2026. július" — a frissesség-jel felirata.
 *
 * ⚠️ MIÉRT VAN KÜLÖN MODULBAN: a lejárati szabály (12 hónap) üzleti döntés,
 * nem megjelenítési részlet — teszt őrzi. Egy elavult „ellenőrizve" rosszabb,
 * mint a semmi: azt sugallná, hogy az adat friss, holott nem az.
 *
 * ⚠️ SZŰK ÁLLÍTÁS: a bélyeg azt igazolja, hogy a vállalkozás MŰKÖDIK — NEM
 * azt, hogy minden mezője (telefon, cím, nyitvatartás) helyes. A hívó felület
 * se ígérjen többet (ld. 0143 migráció és [[directory-freshness-audit]]).
 */

const MONTHS_HU = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];

/** Ennél régebbi ellenőrzést már nem állítunk — inkább nem írunk ki semmit. */
export const VERIFIED_MAX_AGE_MONTHS = 12;

/**
 * @param iso ISO dátum (`YYYY-MM-DD`) vagy null
 * @param now a „most" (tesztelhetőség miatt injektálható)
 * @returns pl. `"2026. július"`, vagy null ha nincs/lejárt/érvénytelen
 */
export function formatVerifiedLabel(iso: string | null | undefined, now: Date = new Date()): string | null {
  if (!iso) return null;
  // Csak a dátum-részt nézzük; a D1 adhat „YYYY-MM-DD HH:MM:SS" alakot is.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso).trim());
  if (!m) return null;

  const year = Number(m[1]);
  const monthIdx = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (monthIdx < 0 || monthIdx > 11 || day < 1 || day > 31) return null;

  const when = new Date(Date.UTC(year, monthIdx, day));
  if (Number.isNaN(when.getTime())) return null;

  // Jövőbeli dátum hibás adat — ne állítsunk semmit.
  if (when.getTime() > now.getTime()) return null;

  const ageMonths =
    (now.getUTCFullYear() - year) * 12 + (now.getUTCMonth() - monthIdx);
  if (ageMonths > VERIFIED_MAX_AGE_MONTHS) return null;

  return `${year}. ${MONTHS_HU[monthIdx]}`;
}
