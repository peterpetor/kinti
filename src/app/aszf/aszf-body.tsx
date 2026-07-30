"use client";

import dynamic from "next/dynamic";
import { LegalPage } from "@/components/legal-page";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";
import { AszfHU } from "./aszf-hu";

/**
 * ⚠️ TELJESÍTMÉNY: a német és angol szöveg KÜLÖN chunkban tölt.
 *
 * Korábban mind a három nyelvi változat statikusan importálódott, így MINDEN
 * látogató letöltötte mind a ~2870 sort, pedig egyet lát belőle — ez adta az
 * oldal 53,9 kB-os JS-terhét. A `useLegalLang` SSR-en és az első kliens-renderen
 * MINDIG `hu`-t ad (hydration-biztos), a nyelvváltás csak mount UTÁN történik,
 * ezért a magyar szöveg marad statikus (nincs villanás a felhasználók zöménél),
 * a DE/EN pedig csak akkor töltődik, ha tényleg kell.
 */
const AszfDE = dynamic(() => import("./aszf-de").then((m) => m.AszfDE), {
  loading: () => <p className="text-[13px] text-ink-muted">Wird geladen…</p>,
});
const AszfEN = dynamic(() => import("./aszf-en").then((m) => m.AszfEN), {
  loading: () => <p className="text-[13px] text-ink-muted">Loading…</p>,
});

const TITLE: Record<LegalLang, string> = {
  hu: "Felhasználási Feltételek (ÁSZF)",
  de: "Nutzungsbedingungen (AGB)",
  en: "Terms of Use",
};

export function AszfBody() {
  const [lang, setLang] = useLegalLang();
  return (
    <LegalPage title={TITLE[lang]} updatedAt="2026-07-20" lang={lang} onLangChange={setLang}>
      {lang === "hu" && <AszfHU />}
      {lang === "de" && <AszfDE />}
      {lang === "en" && <AszfEN />}
    </LegalPage>
  );
}
