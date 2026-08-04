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
 * Ez a függvény tisztán aritmetikából dolgozik, így szerveren és kliensen
 * BETŰRE ugyanazt adja — az eltérés lehetősége megszűnik. Az éles HTML-ben
 * ellenőrizve: `4300` helyett most `4 300` megy ki.
 *
 * ⚠️⚠️ HELYESBÍTÉS — EZ NEM OLDOTTA MEG A /berkalkulator HIBÁJÁT.
 * Ezt a modult azért írtam, mert azt hittem, a lap #425/#422 hibájának ez az
 * oka. TÉVEDTEM: a javítás kiment élesbe, a hiba MEGMARADT. Az eredeti
 * következtetésem hibás összehasonlításon állt — a /berkalkulator és a
 * /berkalkulator/[orszag] lap HÁROM dologban tér el (ez a grafikon, a
 * SalaryCalculatorSwitch és a CountryGuard), én meg egyre fogtam.
 *
 * Amit a fenti kockázatról tudunk, az attól még igaz és valós: a locale-függő
 * formázás SSR-ben tényleg eltérést okozhat, és a /hova-koltozzek lapon
 * ugyanez a minta lappangott. A /berkalkulator hibája viszont NYITOTT — a
 * mérések szerint ország-független, 537 ms-nál (adat előtt) csattan, a
 * grafikon API-ját blokkolva is megjelenik, és az AZONOS tartalmú helyi
 * produkciós buildben NEM reprodukálódik.
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
