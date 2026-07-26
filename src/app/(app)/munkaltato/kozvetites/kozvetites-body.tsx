"use client";

import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { LegalLangSwitch } from "@/components/ui/legal-lang-switch";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";
import { PlacementInquiryForm } from "@/components/views/placement-inquiry-form";

type WhyItem = { pre: string; bold: string; post: string };

const T: Record<LegalLang, {
  back: string; heading: string; eyebrow: string; h1: string; intro: string;
  steps: { emoji: string; title: string; body: string }[];
  whyTitle: string; why: WhyItem[];
  formTitle: string; footerPre: string; imprint: string; footerMid: string;
  jobSeekerPre: string; jobSeekerLink: string;
}> = {
  hu: {
    back: "Vissza a munkáltatói oldalra",
    heading: "Munkaerő-közvetítés",
    eyebrow: "Munkáltatóknak · AT / DE / NL",
    h1: "Megbízható magyar munkaerőt keresel?",
    intro: "A Kinti a kint élő magyarok mindennapi appja — álláskeresőink maguk kérik, hogy aktívan közvetítsük őket. Ausztriában, Németországban és Hollandiában közvetítünk: szakmunkától a vendéglátáson át az egészségügyig.",
    steps: [
      { emoji: "📋", title: "Elmondod, kit keresel", body: "Pozíció, helyszín, feltételek — az űrlapon 2 perc, kötelezettség nélkül." },
      { emoji: "🎯", title: "Előszűrt jelölteket kapsz", body: "A Kinti közösségéből azok közül válogatunk, akik kifejezetten hozzájárultak az aktív közvetítéshez — CV-vel, elvárásokkal, elérhetőséggel." },
      { emoji: "🤝", title: "Csak sikeres felvételnél fizetsz", body: "Nincs előleg, nincs hirdetési díj — a díjazás megállapodás szerinti sikerdíj. A jelöltnek a szolgáltatás ingyenes." },
    ],
    whyTitle: "Miért tőlünk?",
    why: [
      { pre: "A jelöltjeink ", bold: "már kint élnek vagy indulásra készek", post: " — nem hideg adatbázisból dolgozunk." },
      { pre: "Minden jelölt ", bold: "kifejezett hozzájárulással", post: " kerül a poolba (GDPR-tiszta folyamat)." },
      { pre: "Magyarul és németül/hollandul is kommunikálunk — ", bold: "a nyelvi szűrést mi elvégezzük", post: "." },
    ],
    formTitle: "Kérj ajánlatot — 24–48 órán belül jelentkezünk",
    footerPre: "A szolgáltatást a Feedback Jobs S.R.L. nyújtja (részletek: ",
    imprint: "Impresszum",
    footerMid: "). Svájcba jelenleg nem közvetítünk. Állást keresel? A közvetítés neked ",
    jobSeekerPre: "",
    jobSeekerLink: "ingyenes — jelentkezz itt",
  },
  de: {
    back: "Zurück zur Arbeitgeberseite",
    heading: "Personalvermittlung",
    eyebrow: "Für Arbeitgeber · AT / DE / NL",
    h1: "Suchst du verlässliche ungarische Arbeitskräfte?",
    intro: "Kinti ist die tägliche App der im Ausland lebenden Ungarn — unsere Arbeitsuchenden bitten selbst darum, aktiv vermittelt zu werden. Wir vermitteln in Österreich, Deutschland und den Niederlanden: von Facharbeit über Gastronomie bis zum Gesundheitswesen.",
    steps: [
      { emoji: "📋", title: "Du sagst uns, wen du suchst", body: "Position, Standort, Konditionen — im Formular 2 Minuten, ohne Verpflichtung." },
      { emoji: "🎯", title: "Du erhältst vorgeprüfte Kandidaten", body: "Wir wählen aus der Kinti-Community diejenigen aus, die der aktiven Vermittlung ausdrücklich zugestimmt haben — mit Lebenslauf, Erwartungen und Kontaktdaten." },
      { emoji: "🤝", title: "Du zahlst nur bei erfolgreicher Einstellung", body: "Keine Vorauszahlung, keine Anzeigengebühr — die Vergütung ist eine vereinbarte Erfolgsprovision. Für den Kandidaten ist der Service kostenlos." },
    ],
    whyTitle: "Warum wir?",
    why: [
      { pre: "Unsere Kandidaten ", bold: "leben bereits im Ausland oder sind reisebereit", post: " — wir arbeiten nicht mit einer kalten Datenbank." },
      { pre: "Jeder Kandidat kommt ", bold: "mit ausdrücklicher Einwilligung", post: " in den Pool (DSGVO-konformer Prozess)." },
      { pre: "Wir kommunizieren auf Ungarisch und auch auf Deutsch/Niederländisch — ", bold: "die Sprachprüfung übernehmen wir", post: "." },
    ],
    formTitle: "Angebot anfordern — wir melden uns innerhalb von 24–48 Stunden",
    footerPre: "Der Dienst wird von Feedback Jobs S.R.L. erbracht (Details: ",
    imprint: "Impressum",
    footerMid: "). In die Schweiz vermitteln wir derzeit nicht. Suchst du selbst eine Stelle? Die Vermittlung ist für dich ",
    jobSeekerPre: "",
    jobSeekerLink: "kostenlos — hier bewerben",
  },
  en: {
    back: "Back to the employer page",
    heading: "Recruitment",
    eyebrow: "For employers · AT / DE / NL",
    h1: "Looking for reliable Hungarian workers?",
    intro: "Kinti is the everyday app for Hungarians living abroad — our job seekers themselves ask to be actively placed. We place candidates in Austria, Germany, and the Netherlands: from skilled trades to hospitality to healthcare.",
    steps: [
      { emoji: "📋", title: "Tell us who you're looking for", body: "Position, location, terms — 2 minutes on the form, no obligation." },
      { emoji: "🎯", title: "You get pre-screened candidates", body: "We select from the Kinti community those who have explicitly opted in to active placement — with CV, expectations, and contact details." },
      { emoji: "🤝", title: "You only pay on a successful hire", body: "No upfront payment, no listing fee — the fee is an agreed success commission. The service is free for the candidate." },
    ],
    whyTitle: "Why us?",
    why: [
      { pre: "Our candidates ", bold: "already live abroad or are ready to move", post: " — we don't work from a cold database." },
      { pre: "Every candidate joins the pool ", bold: "with explicit consent", post: " (a GDPR-clean process)." },
      { pre: "We communicate in Hungarian as well as German/Dutch — ", bold: "we handle the language screening", post: "." },
    ],
    formTitle: "Request an offer — we'll be in touch within 24–48 hours",
    footerPre: "The service is provided by Feedback Jobs S.R.L. (details: ",
    imprint: "Imprint",
    footerMid: "). We do not currently place candidates in Switzerland. Looking for a job yourself? Placement is ",
    jobSeekerPre: "",
    jobSeekerLink: "free for you — apply here",
  },
};

const META_TITLE: Record<LegalLang, string> = {
  hu: "Munkaerő-közvetítés",
  de: "Personalvermittlung",
  en: "Recruitment",
};

export function KozvetitesBody({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [lang, setLang] = useLegalLang();
  const t = T[lang];

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          {META_TITLE[lang]}
        </span>
        <span className="flex-1" />
        <LegalLangSwitch lang={lang} onChange={setLang} />
        <Link
          href="/munkaltato"
          aria-label={t.back}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
          {t.eyebrow}
        </p>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          {t.h1}
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted">{t.intro}</p>
      </section>

      <section className="space-y-2.5">
        {t.steps.map((s, i) => (
          <div key={s.title} className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-lg">
              {s.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
                {i + 1}. {s.title}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-card border border-primary/25 bg-primary-soft p-4 shadow-card">
        <p className="text-[13.5px] font-extrabold text-ink">{t.whyTitle}</p>
        <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-ink-muted">
          {t.why.map((w) => (
            <li key={w.bold}>• {w.pre}<strong className="text-ink">{w.bold}</strong>{w.post}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-extrabold tracking-tight text-ink">{t.formTitle}</h2>
        <PlacementInquiryForm turnstileSiteKey={turnstileSiteKey} />
      </section>

      <p className="text-[11px] leading-snug text-ink-faint">
        {t.footerPre}
        <Link href="/impresszum" className="underline">{t.imprint}</Link>
        {t.footerMid}
        <Link href="/allasok/profil" className="underline">{t.jobSeekerLink}</Link>.
      </p>
    </div>
  );
}
