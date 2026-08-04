/**
 * szam-format.ts — determinisztikus magyar számformázás.
 *
 * ⚠️ MIÉRT NEM `toLocaleString("hu-HU")`?
 * Mert a `Intl` eredménye KÖRNYEZETFÜGGŐ. A prerender-környezetben (build /
 * Workers) nincs teljes ICU-adat a magyar locale-hoz, ezért `(4300).
 * toLocaleString("hu-HU")` ott `"4300"`-at ad — a böngészőben viszont
 * `"4 300"`-at (nem törő szóközzel). Ha ugyanaz a szám a szerver-HTML-be és a
 * hidratáláskor is bekerül, a kettő ELTÉR, és a React eldobja a hidratálást:
 *
 *   Minified React error #425 — „Text content does not match server-rendered HTML"
 *
 * Ez ÉLESBEN történt meg a /berkalkulator lapon (#425 + #422); a testvér-lapok
 * ugyanazzal a tervezővel, de a csúszka-felirat nélkül tiszták voltak.
 *
 * Ez a függvény tisztán aritmetikából dolgozik, így szerveren és kliensen
 * BETŰRE ugyanazt adja — az eltérés lehetősége megszűnik.
 */

/** Nem törő szóköz — a magyar ezres elválasztó (így nem törik sorvégen). */
const EZRES = " ";

/**
 * Egész szám magyar formában: `4300` → `4 300`.
 * Nem véges értékre üres sztringet ad (a képernyőn a „NaN" mindig hiba).
 */
export function szam(n: number): string {
  if (!Number.isFinite(n)) return "";
  const egesz = Math.round(Math.abs(n));
  const jegyek = String(egesz);
  let ki = "";
  for (let i = 0; i < jegyek.length; i++) {
    if (i > 0 && (jegyek.length - i) % 3 === 0) ki += EZRES;
    ki += jegyek[i];
  }
  return (n < 0 ? "−" : "") + ki;
}
