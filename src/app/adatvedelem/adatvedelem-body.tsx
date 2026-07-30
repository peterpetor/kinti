"use client";

import dynamic from "next/dynamic";
import { LegalPage } from "@/components/legal-page";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";
import { AdatvedelemHU } from "./adatvedelem-hu";

/**
 * ⚠️ TELJESÍTMÉNY: ld. az ÁSZF-oldal azonos megjegyzését — a DE/EN szöveg külön
 * chunkban tölt. A `useLegalLang` SSR-en és az első kliens-renderen mindig `hu`-t
 * ad, ezért a magyar marad statikus (nincs villanás), a másik kettő csak akkor
 * töltődik le, ha a látogató tényleg arra a nyelvre vált.
 */
const AdatvedelemDE = dynamic(() => import("./adatvedelem-de").then((m) => m.AdatvedelemDE), {
  loading: () => <p className="text-[13px] text-ink-muted">Wird geladen…</p>,
});
const AdatvedelemEN = dynamic(() => import("./adatvedelem-en").then((m) => m.AdatvedelemEN), {
  loading: () => <p className="text-[13px] text-ink-muted">Loading…</p>,
});

const TITLE: Record<LegalLang, string> = {
  hu: "Adatkezelési Tájékoztató",
  de: "Datenschutzerklärung",
  en: "Privacy Policy",
};

export function AdatvedelemBody() {
  const [lang, setLang] = useLegalLang();
  return (
    <LegalPage title={TITLE[lang]} updatedAt="2026-07-20" lang={lang} onLangChange={setLang}>
      {lang === "hu" && <AdatvedelemHU />}
      {lang === "de" && <AdatvedelemDE />}
      {lang === "en" && <AdatvedelemEN />}
    </LegalPage>
  );
}
