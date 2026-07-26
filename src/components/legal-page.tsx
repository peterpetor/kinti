import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { LegalLangSwitch } from "@/components/ui/legal-lang-switch";
import type { LegalLang } from "@/hooks/use-legal-lang";

const CHROME: Record<LegalLang, {
  home: string; back: string; updated: string; question: string; abuse: string;
  nav: { impresszum: string; adatvedelem: string; aszf: string };
}> = {
  hu: {
    home: "Kezdőlap", back: "Vissza", updated: "Utolsó frissítés",
    question: "Kérdés vagy észrevétel:", abuse: "Visszaélés-bejelentés:",
    nav: { impresszum: "Impresszum", adatvedelem: "Adatkezelési Tájékoztató", aszf: "Felhasználási Feltételek" },
  },
  de: {
    home: "Startseite", back: "Zurück", updated: "Letzte Aktualisierung",
    question: "Frage oder Anmerkung:", abuse: "Missbrauch melden:",
    nav: { impresszum: "Impressum", adatvedelem: "Datenschutzerklärung", aszf: "Nutzungsbedingungen" },
  },
  en: {
    home: "Home", back: "Back", updated: "Last updated",
    question: "Question or feedback:", abuse: "Report abuse:",
    nav: { impresszum: "Imprint", adatvedelem: "Privacy Policy", aszf: "Terms of Use" },
  },
};

/**
 * Egységes keret a jogi oldalakhoz (impresszum, adatvédelem, ÁSZF, visszatérítés).
 * NEM része az (app)/layout.tsx-nek (nincs TabBar), önálló oldalak.
 *
 * `lang`/`onLangChange` OPCIONÁLIS — ha nincs megadva, pontosan úgy viselkedik,
 * mint korábban (HU, kapcsoló nélkül; pl. /fiok-torles ezt az utat használja).
 * A footer-linkelt jogi oldalak (impresszum/adatvedelem/aszf/visszateres) adják
 * át, a `useLegalLang()` hookkal.
 */
export function LegalPage({
  title,
  updatedAt,
  children,
  lang = "hu",
  onLangChange,
}: {
  title: string;
  /** "2026-05-25" formátum — megjelenítéshez a nyelvnek megfelelő formára konvertáljuk. */
  updatedAt: string;
  children: React.ReactNode;
  lang?: LegalLang;
  onLangChange?: (l: LegalLang) => void;
}) {
  const t = CHROME[lang];
  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label={t.home}
          className="inline-flex items-center gap-2 text-ink"
        >
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight">Kinti</span>
        </Link>
        <span className="flex-1" />
        {onLangChange && <LegalLangSwitch lang={lang} onChange={onLangChange} />}
        <Link
          href="/"
          aria-label={t.back}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
        </Link>
      </header>

      <h1 className="mb-1 text-[28px] font-extrabold leading-tight tracking-tight text-ink">
        {title}
      </h1>
      <p className="mb-8 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
        {t.updated}: {formatDate(updatedAt, lang)}
      </p>

      <article className="prose-kinti">{children}</article>

      <footer className="mt-12 border-t border-line pt-6 text-[12px] leading-relaxed text-ink-muted">
        {t.question}{" "}
        <a href="mailto:info@kinti.app" className="underline">info@kinti.app</a>
        <span className="mx-2">·</span>
        {t.abuse}{" "}
        <a href="mailto:abuse@kinti.app" className="underline">abuse@kinti.app</a>
      </footer>

      <nav className="mt-4 flex flex-wrap gap-3 text-[12.5px] font-semibold text-ink-muted">
        <Link href="/impresszum" className="underline">{t.nav.impresszum}</Link>
        <Link href="/adatvedelem" className="underline">{t.nav.adatvedelem}</Link>
        <Link href="/aszf" className="underline">{t.nav.aszf}</Link>
      </nav>
    </div>
  );
}

function formatDate(iso: string, lang: LegalLang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (lang === "de") {
    const DE_MONTH = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
    return `${d.getDate()}. ${DE_MONTH[d.getMonth()]} ${d.getFullYear()}`;
  }
  if (lang === "en") {
    const EN_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${EN_MONTH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  const HU_MONTH = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  return `${d.getFullYear()}. ${HU_MONTH[d.getMonth()]} ${d.getDate()}.`;
}
