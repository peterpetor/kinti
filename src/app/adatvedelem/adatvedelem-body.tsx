"use client";

import { LegalPage } from "@/components/legal-page";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";
import { AdatvedelemHU } from "./adatvedelem-hu";
import { AdatvedelemDE } from "./adatvedelem-de";
import { AdatvedelemEN } from "./adatvedelem-en";

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
