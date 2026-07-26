"use client";

import type { LegalLang } from "@/hooks/use-legal-lang";

const LABEL: Record<LegalLang, string> = { hu: "HU", de: "DE", en: "EN" };

/** Kis HU/DE/EN kapcsoló a jogi/tájékoztató oldalak fejlécében. */
export function LegalLangSwitch({
  lang,
  onChange,
}: {
  lang: LegalLang;
  onChange: (l: LegalLang) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Nyelv"
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 text-[11px] font-extrabold"
    >
      {(["hu", "de", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          className={
            "rounded-full px-2 py-1 uppercase tracking-wide transition " +
            (lang === l ? "bg-primary text-white" : "text-ink-muted")
          }
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
