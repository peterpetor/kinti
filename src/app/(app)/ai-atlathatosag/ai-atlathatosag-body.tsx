"use client";

import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { LegalLangSwitch } from "@/components/ui/legal-lang-switch";
import { useLegalLang, type LegalLang } from "@/hooks/use-legal-lang";

interface AiFeature {
  emoji: string;
  name: string;
  what: string;
  model: string;
  limits: string;
}

const FEATURES: Record<LegalLang, AiFeature[]> = {
  hu: [
    {
      emoji: "🔎",
      name: "AI-kereső (Szaknévsor „AI-mód”)",
      what: "A természetes nyelvű keresésedet (pl. „villanyszerelő Bécsben”) szűrőkké alakítja. A találati lista maga NEM AI — a valódi adatbázisból jön.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "Félreértheti a keresést — a szűrők kézzel mindig felülbírálhatók.",
    },
    {
      emoji: "💬",
      name: "Kinti Asszisztens (kezdőlap)",
      what: "A szabad szövegben leírt problémádból kinyeri, milyen szakember-kategória és régió segíthet, majd VALÓDI útmutató-cikkeket és szaknévsor-bejegyzéseket ajánl. Szöveges tanácsot, választ NEM generál — csak irányít. Egyszerű kereséseknél AI-hívás sincs (szabály-alapú értelmezés).",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI) — csak az értelmezéshez",
      limits: "Félreértheti a kérdést — az ajánlott cikk/szakember ilyenkor mellé mehet. Nem ad jogi, pénzügyi vagy egészségügyi tanácsot.",
    },
    {
      emoji: "🧭",
      name: "Szemantikus keresés",
      what: "A kereséseket és a szaknévsor-bejegyzéseket jelentés-vektorokká alakítja, hogy rokon értelmű találatokat is megtaláljon. Ha nem elérhető, sima kulcsszavas keresésre vált.",
      model: "BAAI bge-m3 beágyazó-modell (Cloudflare Vectorize)",
      limits: "Csak a találatok SORRENDJÉT befolyásolja; tartalmat nem hoz létre.",
    },
    {
      emoji: "📄",
      name: "CV-audit (PRO)",
      what: "A feltöltött önéletrajzhoz javítási javaslatokat ad (szerkezet, megfogalmazás, helyi elvárások).",
      model: "Meta Llama modellek + PDF-szövegkinyerés (Cloudflare Workers AI)",
      limits: "Javaslat, nem szabály — a CV-dről te döntesz. A feltöltött CV-t védett tárolóban tartjuk.",
    },
    {
      emoji: "📖",
      name: "Hivatali szótár",
      what: "Hivatali kifejezések magyarázata. ELSŐDLEGESEN kézzel ellenőrzött, kurált szócikkekből dolgozik; AI-magyarázat csak ott jelenik meg, ahol nincs kurált tartalom — és ilyenkor „becslés” jelölést kap.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "Az AI-jelölésű magyarázat tévedhet — hivatalos ügyben mindig az eredeti dokumentum és a hatóság az irányadó.",
    },
    {
      emoji: "🛡️",
      name: "Beküldés-előszűrés (spam)",
      what: "Az új beküldéseket (vállalkozás, ajánlás) előszűri nyilvánvaló spam/reklám ellen.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "Az AI csak ELŐSZŰR — a megjelenésről minden esetben emberi moderátor dönt. Téves elutasításnál írj nekünk.",
    },
    {
      emoji: "🔊",
      name: "Napi szó — kiejtés",
      what: "A napi szó meghallgatható kiejtését beszédszintézis állítja elő.",
      model: "Beszédszintézis-modell (Cloudflare Workers AI)",
      limits: "A gépi kiejtés közelítő — az anyanyelvi kiejtés eltérhet.",
    },
  ],
  de: [
    {
      emoji: "🔎",
      name: "KI-Suche („KI-Modus“ im Branchenbuch)",
      what: "Wandelt deine natürlichsprachliche Suche (z. B. „Elektriker in Wien“) in Filter um. Die Trefferliste selbst ist KEINE KI — sie stammt aus der echten Datenbank.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "Kann die Suche missverstehen — die Filter lassen sich immer manuell überschreiben.",
    },
    {
      emoji: "💬",
      name: "Kinti-Assistent (Startseite)",
      what: "Ermittelt aus deiner frei formulierten Beschreibung, welche Fachkraft-Kategorie und Region helfen könnte, und empfiehlt dann ECHTE Ratgeber-Artikel und Branchenbuch-Einträge. Erstellt KEINEN Text-Ratschlag, keine Antwort — leitet nur weiter. Bei einfachen Suchen erfolgt gar kein KI-Aufruf (regelbasierte Auswertung).",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI) — nur zur Auswertung",
      limits: "Kann die Frage missverstehen — der empfohlene Artikel/die Fachkraft kann dann daneben liegen. Gibt keinen rechtlichen, finanziellen oder gesundheitlichen Rat.",
    },
    {
      emoji: "🧭",
      name: "Semantische Suche",
      what: "Wandelt Suchanfragen und Branchenbuch-Einträge in Bedeutungs-Vektoren um, um auch sinnverwandte Treffer zu finden. Ist sie nicht verfügbar, wird auf einfache Stichwortsuche umgeschaltet.",
      model: "BAAI bge-m3 Embedding-Modell (Cloudflare Vectorize)",
      limits: "Beeinflusst nur die REIHENFOLGE der Treffer; erzeugt keinen Inhalt.",
    },
    {
      emoji: "📄",
      name: "CV-Audit (PRO)",
      what: "Gibt Verbesserungsvorschläge zum hochgeladenen Lebenslauf (Struktur, Formulierung, lokale Erwartungen).",
      model: "Meta-Llama-Modelle + PDF-Textextraktion (Cloudflare Workers AI)",
      limits: "Ein Vorschlag, keine Regel — über deinen Lebenslauf entscheidest du. Der hochgeladene Lebenslauf wird geschützt gespeichert.",
    },
    {
      emoji: "📖",
      name: "Behörden-Wörterbuch",
      what: "Erklärung von Behördenbegriffen. Arbeitet PRIMÄR mit handkuratierten, geprüften Einträgen; eine KI-Erklärung erscheint nur dort, wo kein kuratierter Inhalt vorliegt — und wird dann als „Schätzung“ gekennzeichnet.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "Die KI-gekennzeichnete Erklärung kann irren — in offiziellen Angelegenheiten ist immer das Originaldokument und die Behörde maßgeblich.",
    },
    {
      emoji: "🛡️",
      name: "Einreichungs-Vorfilter (Spam)",
      what: "Filtert neue Einreichungen (Unternehmen, Empfehlung) vorab gegen offensichtlichen Spam/Werbung.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "Die KI FILTERT NUR VOR — über die Veröffentlichung entscheidet stets ein menschlicher Moderator. Bei fälschlicher Ablehnung schreib uns.",
    },
    {
      emoji: "🔊",
      name: "Wort des Tages — Aussprache",
      what: "Die anhörbare Aussprache des Worts des Tages wird per Sprachsynthese erzeugt.",
      model: "Sprachsynthese-Modell (Cloudflare Workers AI)",
      limits: "Die maschinelle Aussprache ist eine Annäherung — die Aussprache von Muttersprachlern kann abweichen.",
    },
  ],
  en: [
    {
      emoji: "🔎",
      name: "AI search (Directory “AI mode”)",
      what: "Turns your natural-language search (e.g. “electrician in Vienna”) into filters. The results list itself is NOT AI — it comes from the real database.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "May misread your search — filters can always be overridden manually.",
    },
    {
      emoji: "💬",
      name: "Kinti Assistant (home screen)",
      what: "Works out from your free-text description which professional category and region might help, then recommends REAL guide articles and directory listings. Does NOT generate text advice or answers — it only guides. For simple searches there isn't even an AI call (rule-based interpretation).",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI) — for interpretation only",
      limits: "May misread the question — the recommended article/professional may then be off-target. Gives no legal, financial, or medical advice.",
    },
    {
      emoji: "🧭",
      name: "Semantic search",
      what: "Turns searches and directory listings into meaning vectors so related results can also be found. If unavailable, falls back to plain keyword search.",
      model: "BAAI bge-m3 embedding model (Cloudflare Vectorize)",
      limits: "Only affects the ORDER of results; does not generate content.",
    },
    {
      emoji: "📄",
      name: "CV audit (PRO)",
      what: "Gives improvement suggestions for your uploaded CV (structure, wording, local expectations).",
      model: "Meta Llama models + PDF text extraction (Cloudflare Workers AI)",
      limits: "A suggestion, not a rule — you decide about your CV. The uploaded CV is kept in protected storage.",
    },
    {
      emoji: "📖",
      name: "Official-terms dictionary",
      what: "Explains official/administrative terms. Works PRIMARILY from hand-checked, curated entries; an AI explanation appears only where no curated content exists — and is then marked as an “estimate”.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "The AI-marked explanation can be wrong — for official matters, the original document and the authority always take precedence.",
    },
    {
      emoji: "🛡️",
      name: "Submission pre-screening (spam)",
      what: "Pre-screens new submissions (business, referral) against obvious spam/advertising.",
      model: "Meta Llama 3.1 8B (Cloudflare Workers AI)",
      limits: "The AI only PRE-SCREENS — a human moderator always decides on publication. If wrongly rejected, write to us.",
    },
    {
      emoji: "🔊",
      name: "Word of the day — pronunciation",
      what: "The playable pronunciation of the word of the day is generated by speech synthesis.",
      model: "Speech-synthesis model (Cloudflare Workers AI)",
      limits: "The machine pronunciation is approximate — native pronunciation may differ.",
    },
  ],
};

const T: Record<LegalLang, {
  back: string; heading: string; intro: string; principlesTitle: string;
  principles: string[]; featuresTitle: string; modelLabel: string; limitsLabel: string;
  actTitle: string; act1: string; act2: string; reportTitle: string; reportBody: string;
  related: string; privacy: string; imprint: string;
}> = {
  hu: {
    back: "Vissza a Főoldalra",
    heading: "Hogyan használunk mesterséges intelligenciát?",
    intro: "A Kinti több funkciója mesterséges intelligenciát használ. Itt átláthatóan leírjuk: melyik funkció mit csinál, milyen modellel, és mik a korlátai. Utoljára frissítve: 2026. július 23.",
    principlesTitle: "Alapelveink",
    principles: [
      "Jelölés: ahol AI-generált tartalmat látsz, azt jelöljük (🤖 / „becslés”).",
      "Kurált-először: ahol lehet, kézzel ellenőrzött tartalom az elsődleges, az AI csak kiegészít.",
      "Ember dönt: AI önállóan soha nem hoz rád nézve döntést — a moderáció emberi, az AI-visszajelzés gyakorlási segédlet.",
      "Nincs tiltott gyakorlat: nem használunk érzelem-felismerést, social scoringot vagy manipulatív technikát.",
      "Adataid: az AI-hívásokat a Cloudflare Workers AI futtatja; a beküldött szöveget nem használjuk fel modellek tanítására, és nem adjuk át harmadik félnek hirdetési célra.",
    ],
    featuresTitle: "AI-funkcióink",
    modelLabel: "Modell:",
    limitsLabel: "Korlátok:",
    actTitle: "EU AI-rendelet (AI Act)",
    act1: "AI-funkcióink a felhasználót segítő, átláthatósági kötelezettség alá eső eszközök: mindig jelezzük, ha AI-jal beszélsz vagy AI-generált tartalmat látsz. A CV-audit a te önkéntes felkészülő-eszközöd — valós felvételi vagy munkáltatói döntést nem hoz és nem támogat. Tiltott AI-gyakorlatot (érzelem-felismerés, social scoring, manipuláció) nem alkalmazunk.",
    act2: "Ami nem AI: az állás-kereső „% egyezés” pontszáma egyszerű, szabály-alapú számítás (a szakmád, a régiód és a bér-elvárásod egyezése a hirdetéssel) — nem gépi tanulás, és kizárólag neked segít rangsorolni; munkáltató nem lát belőle semmit.",
    reportTitle: "Hibás vagy problémás AI-választ kaptál?",
    reportBody: "Írd meg nekünk az info@kinti.app címre (mit kérdeztél, mit válaszolt az AI) — minden jelzést átnézünk, és ha kell, javítjuk a szabályokat. A tartalom-bejelentő gombok is működnek minden felhasználói tartalomnál.",
    related: "Kapcsolódó:",
    privacy: "Adatkezelési Tájékoztató",
    imprint: "Impresszum",
  },
  de: {
    back: "Zurück zur Startseite",
    heading: "Wie nutzen wir künstliche Intelligenz?",
    intro: "Mehrere Funktionen von Kinti nutzen künstliche Intelligenz. Hier beschreiben wir transparent: welche Funktion was tut, mit welchem Modell, und wo die Grenzen liegen. Zuletzt aktualisiert: 23. Juli 2026.",
    principlesTitle: "Unsere Grundsätze",
    principles: [
      "Kennzeichnung: Wo du KI-generierten Inhalt siehst, kennzeichnen wir ihn (🤖 / „Schätzung“).",
      "Kuratiert zuerst: Wo möglich, ist handgeprüfter Inhalt primär, die KI ergänzt nur.",
      "Der Mensch entscheidet: Die KI trifft niemals eigenständig eine Entscheidung über dich — die Moderation ist menschlich, das KI-Feedback ist eine Übungshilfe.",
      "Keine verbotene Praxis: Wir nutzen keine Emotionserkennung, kein Social Scoring und keine manipulativen Techniken.",
      "Deine Daten: Die KI-Aufrufe laufen über Cloudflare Workers AI; den eingereichten Text nutzen wir nicht zum Training von Modellen und geben ihn nicht zu Werbezwecken an Dritte weiter.",
    ],
    featuresTitle: "Unsere KI-Funktionen",
    modelLabel: "Modell:",
    limitsLabel: "Grenzen:",
    actTitle: "EU-KI-Verordnung (AI Act)",
    act1: "Unsere KI-Funktionen sind nutzerunterstützende Werkzeuge, die einer Transparenzpflicht unterliegen: Wir weisen immer darauf hin, wenn du mit KI sprichst oder KI-generierten Inhalt siehst. Der CV-Audit ist dein freiwilliges Vorbereitungswerkzeug — er trifft und unterstützt keine echte Einstellungs- oder Arbeitgeberentscheidung. Verbotene KI-Praktiken (Emotionserkennung, Social Scoring, Manipulation) wenden wir nicht an.",
    act2: "Was keine KI ist: Die „%-Übereinstimmung“ der Job-Suche ist eine einfache, regelbasierte Berechnung (Übereinstimmung deines Berufs, deiner Region und deiner Gehaltsvorstellung mit der Anzeige) — kein maschinelles Lernen, und sie hilft ausschließlich dir beim Einordnen; ein Arbeitgeber sieht davon nichts.",
    reportTitle: "Eine fehlerhafte oder problematische KI-Antwort erhalten?",
    reportBody: "Schreib uns an info@kinti.app (was du gefragt hast, was die KI geantwortet hat) — wir sehen uns jede Meldung an und passen bei Bedarf die Regeln an. Die Melde-Buttons für Inhalte funktionieren ebenfalls bei jedem Nutzerinhalt.",
    related: "Verwandt:",
    privacy: "Datenschutzerklärung",
    imprint: "Impressum",
  },
  en: {
    back: "Back to Home",
    heading: "How do we use artificial intelligence?",
    intro: "Several Kinti features use artificial intelligence. Here we describe transparently: which feature does what, with which model, and what its limits are. Last updated: 23 July 2026.",
    principlesTitle: "Our principles",
    principles: [
      "Labelling: where you see AI-generated content, we label it (🤖 / “estimate”).",
      "Curated first: where possible, hand-checked content comes first, AI only supplements.",
      "A human decides: AI never independently makes a decision about you — moderation is human, AI feedback is a practice aid.",
      "No prohibited practice: we do not use emotion recognition, social scoring, or manipulative techniques.",
      "Your data: AI calls run on Cloudflare Workers AI; we do not use submitted text to train models or share it with third parties for advertising purposes.",
    ],
    featuresTitle: "Our AI features",
    modelLabel: "Model:",
    limitsLabel: "Limits:",
    actTitle: "EU AI Act",
    act1: "Our AI features are user-assisting tools subject to a transparency obligation: we always indicate when you're talking to AI or seeing AI-generated content. The CV audit is your voluntary preparation tool — it does not make or support any actual hiring or employer decision. We do not use prohibited AI practices (emotion recognition, social scoring, manipulation).",
    act2: "What is not AI: the job search's “% match” score is a simple, rule-based calculation (matching your profession, region, and salary expectation against the listing) — not machine learning, and it only helps you rank listings; an employer sees none of it.",
    reportTitle: "Got a wrong or problematic AI answer?",
    reportBody: "Write to us at info@kinti.app (what you asked, what the AI answered) — we review every report and adjust the rules where needed. Content-report buttons also work on all user content.",
    related: "Related:",
    privacy: "Privacy Policy",
    imprint: "Imprint",
  },
};

const META_TITLE: Record<LegalLang, string> = {
  hu: "AI-átláthatóság",
  de: "KI-Transparenz",
  en: "AI transparency",
};

export function AiAtlathatosagBody() {
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
          href="/"
          aria-label={t.back}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="space-y-3">
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
          {t.heading}
        </h1>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">{t.intro}</p>
      </section>

      <section className="rounded-card border border-primary/25 bg-primary-soft p-4 shadow-card">
        <p className="text-[13.5px] font-extrabold text-ink">{t.principlesTitle}</p>
        <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-ink-muted">
          {t.principles.map((p, i) => {
            const [strong, ...rest] = p.split(": ");
            return (
              <li key={i}>
                • <strong className="text-ink">{strong}:</strong> {rest.join(": ")}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{t.featuresTitle}</h2>
        {FEATURES[lang].map((f) => (
          <div key={f.name} className="rounded-card border border-line bg-surface p-4 shadow-card">
            <p className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
              {f.emoji} {f.name}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{f.what}</p>
            <p className="mt-1.5 text-[11.5px] text-ink-faint">
              <strong className="text-ink-muted">{t.modelLabel}</strong> {f.model}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-faint">
              <strong className="text-ink-muted">{t.limitsLabel}</strong> {f.limits}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{t.actTitle}</h2>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">{t.act1}</p>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">{t.act2}</p>
      </section>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="text-[13.5px] font-extrabold text-ink">{t.reportTitle}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          {t.reportBody.split("info@kinti.app")[0]}
          <a href="mailto:info@kinti.app" className="font-bold text-primary underline">info@kinti.app</a>
          {t.reportBody.split("info@kinti.app")[1]}
        </p>
      </section>

      <p className="text-[11px] leading-snug text-ink-faint">
        {t.related} <Link href="/adatvedelem" className="underline">{t.privacy}</Link> ·{" "}
        <Link href="/impresszum" className="underline">{t.imprint}</Link>
      </p>
    </div>
  );
}
