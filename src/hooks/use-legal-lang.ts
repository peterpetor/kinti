"use client";

import { useEffect, useState } from "react";

/**
 * Nyelv-állapot a jogi/tájékoztató oldalakhoz (Impresszum, Adatvédelem, ÁSZF,
 * Visszatérítés, AI-átláthatóság, PRO, Közvetítés) — UGYANAZ a `kinti_lang`
 * localStorage-kulcs és IP-detektálási logika, mint a landing.html motorjában
 * (lásd public/landing-i18n.js), hogy a nyelv-választás a landing és az app
 * érintett oldalai között konzisztens legyen.
 *
 * Maga az alkalmazás (kereső, profilok, admin) MARAD magyar — ez a hook
 * KIZÁRÓLAG a footer-linkelt jogi/tájékoztató oldalakon használt.
 *
 * HYDRATION-BIZTOS: SSR és az első kliens-render is 'hu'-t ad (nincs
 * szerver/kliens eltérés), mount UTÁN olvassa be a tárolt/IP-detektált nyelvet.
 */
export type LegalLang = "hu" | "de" | "en";

const KEY = "kinti_lang";
const DE_C = new Set(["DE", "AT", "CH", "LI"]);
const EN_C = new Set(["GB", "IE", "US", "CA", "AU", "NZ", "ZA", "MT", "JM", "SG", "PH", "NG", "KE", "GH", "IN"]);

function langForCountry(cc: string): LegalLang {
  const c = cc.toUpperCase();
  if (c === "HU") return "hu";
  if (DE_C.has(c)) return "de";
  if (EN_C.has(c)) return "en";
  return "en"; // Hollandia, Svédország stb. → angol fallback (mint a landingen)
}

/**
 * @param detectByIp
 *   `true` (alap) — nincs mentett választás → IP-ből tippelünk nyelvet.
 *      Ez a LANDING footeréből nyíló jogi oldalakon helyes: oda nem-magyar
 *      olvasó (hatóság, partner, helyi ügyfél) is érkezhet.
 *
 *   `false` — nincs mentett választás → MARAD MAGYAR.
 *      ⚠️ Az APP-ON BELÜLI oldalakon ez a helyes (2026-08-01, user-döntés):
 *      az app közönsége definíció szerint KÜLFÖLDÖN ÉLŐ MAGYAR, tehát az
 *      IP-tipp gyakorlatilag MINDIG idegen nyelvet adott — a /pro oldal
 *      németül fogadta azt, aki addig végig magyar felületet használt.
 *      A kifejezett nyelvváltás ettől függetlenül megmarad (localStorage),
 *      és visszatéréskor is érvényes.
 */
export function useLegalLang(
  { detectByIp = true }: { detectByIp?: boolean } = {},
): [LegalLang, (l: LegalLang) => void] {
  const [lang, setLangState] = useState<LegalLang>("hu");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* elérhetetlen localStorage → az alábbi ág dönt */
    }
    // A MENTETT, KIFEJEZETT választás mindig erősebb — ez a felhasználó döntése.
    if (stored === "hu" || stored === "de" || stored === "en") {
      setLangState(stored);
      return;
    }
    if (!detectByIp) return; // marad a 'hu' alapérték
    fetch("/cdn-cgi/trace")
      .then((r) => r.text())
      .then((t) => {
        const m = /(?:^|\n)loc=([A-Z]{2})/.exec(t);
        if (m) setLangState(langForCountry(m[1]));
      })
      .catch(() => {
        /* nincs jel → marad 'hu' */
      });
  }, [detectByIp]);

  const setLang = (l: LegalLang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };

  return [lang, setLang];
}
