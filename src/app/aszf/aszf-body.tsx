"use client";

import { LegalPage } from "@/components/legal-page";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";
import { AszfHU } from "./aszf-hu";
import { AszfDE } from "./aszf-de";
import { AszfEN } from "./aszf-en";

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
