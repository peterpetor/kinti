"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  PERMITS,
  evaluatePermit,
  type WizardAnswers,
  type WizardResult,
} from "@/lib/permit-wizard";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

interface StepOption {
  value: string;
  label: string;
  emoji: string;
  hint?: string;
}

interface Step {
  id: keyof WizardAnswers;
  question: string;
  options: StepOption[];
}

const STEPS_CH: Step[] = [
  {
    id: "citizenship",
    question: "Honnan jössz?",
    options: [
      {
        value: "eu",
        label: "🇭🇺 Magyarország / 🇪🇺 EU / 🇮🇸 EFTA",
        emoji: "🇪🇺",
        hint: "Szabad mozgás megállapodás — könnyebb engedélyek.",
      },
      {
        value: "non-eu",
        label: "🌍 Nem-EU ország (USA, India, UK, stb.)",
        emoji: "🌍",
        hint: "Harmadik országbeli — kvótás rendszer.",
      },
    ],
  },
  {
    id: "duration",
    question: "Mennyi időre tervezed Svájcban tartózkodni?",
    options: [
      {
        value: "short",
        label: "< 3 hónap (turizmus, üzleti út, családlátogatás)",
        emoji: "✈️",
      },
      {
        value: "medium",
        label: "3-12 hónap (szezonális munka, csere, nyelvtanfolyam)",
        emoji: "📅",
      },
      {
        value: "long",
        label: "1-5 év (munkavállalás, családi)",
        emoji: "🏠",
      },
      {
        value: "permanent",
        label: "5+ év / végleges letelepedés",
        emoji: "🏡",
      },
    ],
  },
  {
    id: "purpose",
    question: "Mi a fő célod?",
    options: [
      {
        value: "work",
        label: "Munkavállalás Svájcban",
        emoji: "💼",
      },
      {
        value: "study",
        label: "Tanulás (egyetem, nyelvtanfolyam, csere)",
        emoji: "🎓",
      },
      {
        value: "family",
        label: "Családi okok (házasság, családtag)",
        emoji: "👨‍👩‍👧",
      },
      {
        value: "retired",
        label: "Nyugdíjasként, anyagi-független",
        emoji: "🏖️",
      },
      {
        value: "cross-border",
        label: "Szomszéd országban élek, csak Svájcban dolgozom",
        emoji: "🚗",
        hint: "Naponta / hetente hazajársz — G-engedély.",
      },
    ],
  },
  {
    id: "previousStay",
    question: "Volt-e már svájci tartózkodási engedélyed?",
    options: [
      {
        value: "5-or-more",
        label: "Igen, már 5+ éve B-engedéllyel élek itt",
        emoji: "🪪",
        hint: "C-engedélyre jogosult lehetsz.",
      },
      {
        value: "less-than-5",
        label: "Igen, de kevesebb mint 5 éve",
        emoji: "📅",
      },
      {
        value: "none",
        label: "Nem, ez az első alkalom",
        emoji: "✨",
      },
    ],
  },
];

// Ausztria — EU-fókuszú lépések (a magyar EU-állampolgárnak más a valóság).
const STEPS_AT: Step[] = [
  {
    id: "citizenship",
    question: "Honnan jössz?",
    options: [
      { value: "eu", label: "🇭🇺 Magyarország / 🇪🇺 EU / 🇮🇸 EFTA", emoji: "🇪🇺", hint: "Szabad mozgás — nincs szükség tartózkodási engedélyre." },
      { value: "non-eu", label: "🌍 Nem-EU ország (USA, India, UK, stb.)", emoji: "🌍", hint: "Harmadik országbeli — Rot-Weiß-Rot Karte / vízum." },
    ],
  },
  {
    id: "duration",
    question: "Mennyi időre tervezed Ausztriában tartózkodni?",
    options: [
      { value: "short", label: "< 3 hónap (turizmus, üzleti út, családlátogatás)", emoji: "✈️" },
      { value: "medium", label: "3-12 hónap (szezonális munka, csere, kurzus)", emoji: "📅" },
      { value: "long", label: "1-5 év (munkavállalás, családi)", emoji: "🏠" },
      { value: "permanent", label: "5+ év / végleges letelepedés", emoji: "🏡" },
    ],
  },
  {
    id: "purpose",
    question: "Mi a fő célod?",
    options: [
      { value: "work", label: "Munkavállalás Ausztriában", emoji: "💼" },
      { value: "study", label: "Tanulás (egyetem, kurzus, csere)", emoji: "🎓" },
      { value: "family", label: "Családi okok (házasság, családtag)", emoji: "👨‍👩‍👧" },
      { value: "retired", label: "Nyugdíjasként, anyagi-független", emoji: "🏖️" },
      { value: "cross-border", label: "Magyarországon élek, csak Ausztriában dolgozom", emoji: "🚗", hint: "Ingázó (pl. Sopron–Burgenland) — EU-állampolgárként szabad." },
    ],
  },
  {
    id: "previousStay",
    question: "Mióta élsz (jogszerűen) Ausztriában?",
    options: [
      { value: "5-or-more", label: "Már 5+ éve folyamatosan itt élek", emoji: "🪪", hint: "Daueraufenthaltra jogosult lehetsz." },
      { value: "less-than-5", label: "Kevesebb mint 5 éve", emoji: "📅" },
      { value: "none", label: "Most érkezem / első alkalom", emoji: "✨" },
    ],
  },
];

// Németország — EU-fókuszú lépések (Freizügigkeit; a lakcím-bejelentés a kulcs).
const STEPS_DE: Step[] = [
  {
    id: "citizenship",
    question: "Honnan jössz?",
    options: [
      { value: "eu", label: "🇭🇺 Magyarország / 🇪🇺 EU / 🇮🇸 EFTA", emoji: "🇪🇺", hint: "Szabad mozgás (Freizügigkeit) — nincs szükség tartózkodási engedélyre." },
      { value: "non-eu", label: "🌍 Nem-EU ország (USA, India, UK, stb.)", emoji: "🌍", hint: "Harmadik országbeli — Aufenthaltstitel / Blaue Karte EU." },
    ],
  },
  {
    id: "duration",
    question: "Mennyi időre tervezed Németországban tartózkodni?",
    options: [
      { value: "short", label: "< 3 hónap (turizmus, üzleti út, családlátogatás)", emoji: "✈️" },
      { value: "medium", label: "3-12 hónap (szezonális munka, csere, kurzus)", emoji: "📅" },
      { value: "long", label: "1-5 év (munkavállalás, családi)", emoji: "🏠" },
      { value: "permanent", label: "5+ év / végleges letelepedés", emoji: "🏡" },
    ],
  },
  {
    id: "purpose",
    question: "Mi a fő célod?",
    options: [
      { value: "work", label: "Munkavállalás Németországban", emoji: "💼" },
      { value: "study", label: "Tanulás (egyetem, kurzus, csere)", emoji: "🎓" },
      { value: "family", label: "Családi okok (házasság, családtag)", emoji: "👨‍👩‍👧" },
      { value: "retired", label: "Nyugdíjasként, anyagi-független", emoji: "🏖️" },
      { value: "cross-border", label: "Másik országban élek, csak Németországban dolgozom", emoji: "🚗", hint: "Ingázó — EU-állampolgárként szabad." },
    ],
  },
  {
    id: "previousStay",
    question: "Mióta élsz (jogszerűen) Németországban?",
    options: [
      { value: "5-or-more", label: "Már 5+ éve folyamatosan itt élek", emoji: "🪪", hint: "Daueraufenthalt-EU-ra jogosult lehetsz." },
      { value: "less-than-5", label: "Kevesebb mint 5 éve", emoji: "📅" },
      { value: "none", label: "Most érkezem / első alkalom", emoji: "✨" },
    ],
  },
];

export function PermitWizard() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";
  const isDE = country === "DE";
  const STEPS = isDE ? STEPS_DE : isAT ? STEPS_AT : STEPS_CH;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const [result, setResult] = useState<WizardResult | null>(null);

  function choose(value: string) {
    const next = { ...answers, [STEPS[step].id]: value } as Partial<WizardAnswers>;
    setAnswers(next);

    if (step >= STEPS.length - 1) {
      // Mindenre válaszolt — eredmény
      setResult(evaluatePermit(next as WizardAnswers, country));
    } else {
      setStep(step + 1);
    }
  }

  function back() {
    if (step === 0) return;
    setStep(step - 1);
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  if (result) {
    return <ResultView result={result} onRestart={restart} country={country} />;
  }

  const currentStep = STEPS[step];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">🪪</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              Melyik engedély kell nekem?
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              4 gyors kérdés alapján megmondjuk, mi a legrelevánsabb a{" "}
              {isDE ? "németországi" : isAT ? "ausztriai" : "svájci"} tartózkodási helyzetedhez.
            </p>
          </div>
        </div>
      </section>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
            {step + 1} / {STEPS.length}
          </p>
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="text-[11.5px] font-bold text-primary underline"
            >
              ← Vissza
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                i <= step ? "bg-primary" : "bg-line",
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-ink text-pretty">
          {currentStep.question}
        </h2>

        <div className="space-y-2">
          {currentStep.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => choose(opt.value)}
              className="flex w-full items-start gap-3 rounded-[14px] border-2 border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99] hover:border-primary/40 hover:bg-primary-soft/30"
            >
              <span className="text-2xl shrink-0">{opt.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-extrabold text-ink">{opt.label}</p>
                {opt.hint && (
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{opt.hint}</p>
                )}
              </div>
              <Icon name="chevR" size={14} className="text-ink-muted shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </section>

      <LegalDisclaimer
        toolName="engedély-varázsló"
        variant="legal"
        notAdviceFor="jogi vagy bevándorlási"
        extraWarning={isDE
          ? "A pontos eljárás és feltételek időnként változnak, és a határidők városonként (Bundesland) eltérnek. A varázsló csak általános útmutatás — a TE konkrét helyzetedre vonatkozó státuszt a helyi Bürgeramt / Ausländerbehörde vagy szakképzett ügyvéd határozza meg."
          : isAT
          ? "A pontos eljárás és feltételek időnként változnak. A varázsló csak általános útmutatás — a TE konkrét helyzetedre vonatkozó státuszt a tartózkodási hatóság (Bécsben MA 35, tartományokban Landeshauptmann/BH) vagy szakképzett ügyvéd határozza meg."
          : "Az engedély-eljárás kantonok közt eltér, és a feltételek időnként változnak. A varázsló csak általános útmutatás — a TE konkrét helyzetedre vonatkozó engedélyt mindig a kantoni Migrationsamt vagy szakképzett ügyvéd határozza meg."}
        officialSources={isDE ? [
          { label: "make-it-in-germany.com — hivatalos portál", url: "https://www.make-it-in-germany.com/" },
          { label: "BAMF — Migráció", url: "https://www.bamf.de/" },
        ] : isAT ? [
          { label: "oesterreich.gv.at — Aufenthalt", url: "https://www.oesterreich.gv.at/themen/leben_in_oesterreich/aufenthalt.html" },
          { label: "migration.gv.at — Migráció", url: "https://www.migration.gv.at/" },
        ] : [
          { label: "SEM — Migráció hivatalos", url: "https://www.sem.admin.ch/" },
          { label: "ch.ch — Tartózkodás", url: "https://www.ch.ch/de/leben-in-der-schweiz/aufenthalt/" },
        ]}
      />
    </div>
  );
}

function ResultView({ result, onRestart, country }: { result: WizardResult; onRestart: () => void; country: string }) {
  const isAT = country === "AT";
  const isDE = country === "DE";
  const primary = PERMITS[result.primary];
  const alternatives = result.alternatives.map((t) => PERMITS[t]);

  return (
    <div className="space-y-4">
      {/* Primary */}
      <section
        className="rounded-card border-2 p-5 shadow-pop"
        style={{ borderColor: `${primary.color}66`, backgroundColor: `${primary.color}0d` }}
      >
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Javasolt engedélytípus
        </p>
        <div className="mt-2 flex items-start gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[14px] text-3xl" style={{ backgroundColor: primary.color, color: "white" }}>
            {primary.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
              {primary.name}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{primary.shortDesc}</p>
          </div>
        </div>
      </section>

      {/* Tanácsok */}
      {result.notes.length > 0 && (
        <section className="rounded-card border-2 border-primary/30 bg-primary-soft p-4 shadow-card">
          <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-primary">
            💡 Egyedi tanácsok a helyzetedhez
          </h3>
          <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-ink">
            {result.notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Részletes info */}
      <section className="space-y-2">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Részletek
        </h3>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
          <DetailRow label="Időtartam" value={primary.duration} />
          <DetailRow label="Munkavállalás" value={primary.workPermitted} />
          <DetailRow label={isAT || isDE ? "Költözés" : "Kanton-váltás"} value={primary.cantonChange} />
          <DetailRow label="Családtag-egyesítés" value={primary.familyReunion} />
        </div>
      </section>

      {/* Pros / Cons */}
      <section className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-card border border-success/30 bg-success/5 p-4 shadow-card">
          <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-success">
            ✓ Előnyök
          </h4>
          <ul className="space-y-1.5 text-[12px] leading-snug text-ink">
            {primary.pros.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-success shrink-0">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-accent/30 bg-accent-soft p-4 shadow-card">
          <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-accent">
            ✕ Hátrányok
          </h4>
          <ul className="space-y-1.5 text-[12px] leading-snug text-ink">
            {primary.cons.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent shrink-0">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Hova kérvényezz */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <h3 className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-ink-muted">
          📍 Hova kérvényezz?
        </h3>
        <p className="text-[13px] leading-relaxed text-ink">{primary.applyTo}</p>
        {primary.links.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {primary.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[11.5px] font-bold text-primary hover:bg-primary-soft transition"
              >
                🔗 {l.label}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Alternatívák */}
      {alternatives.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
            Másodlagos lehetőségek
          </h3>
          {alternatives.map((alt) => (
            <div
              key={alt.type}
              className="flex items-start gap-3 rounded-card border border-line bg-surface p-3 shadow-card"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white text-lg"
                style={{ backgroundColor: alt.color }}
              >
                {alt.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-extrabold text-ink">{alt.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">{alt.shortDesc}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card active:scale-[0.99]"
      >
        <Icon name="arrowLeft" size={14} strokeWidth={2.4} className="rotate-180" />
        Új kérdéssor
      </button>

      <LegalDisclaimer
        toolName="engedély-varázsló"
        variant="legal"
        notAdviceFor="jogi vagy bevándorlási"
        extraWarning="A varázsló javaslata egyszerű, általános minták alapján készült. A te konkrét helyzetedet (családi állapot, munkaadói támogatás, korábbi tartózkodás, büntetett előélet) csak az illetékes hatóság és/vagy szakképzett ügyvéd tudja értékelni."
        officialSources={isDE ? [
          { label: "make-it-in-germany.com", url: "https://www.make-it-in-germany.com/" },
        ] : isAT ? [
          { label: "migration.gv.at — Migráció", url: "https://www.migration.gv.at/" },
        ] : [
          { label: "SEM — Migráció", url: "https://www.sem.admin.ch/" },
        ]}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink">{value}</p>
    </div>
  );
}
