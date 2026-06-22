"use client";

import { useState } from "react";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

type CantonCode = "ZH" | "BE" | "GE" | "VD" | "BS" | "LU" | "AG" | "SG" | "TI";

interface SchoolLevel {
  name: string;
  nameDe?: string;
  emoji: string;
  ages: string;
  years: number | string;
  color: string;
  bg: string;
  description: string;
  tracks?: string[];
  tip?: string;
}

interface CantonData {
  name: string;
  lang: "de" | "fr" | "it";
  flag: string;
  note: string;
  levels: SchoolLevel[];
}

const CANTONS: Record<CantonCode, CantonData> = {
  ZH: {
    name: "Zürich",
    lang: "de",
    flag: "🔵⚪",
    note: "A legnagyobb kanton. A Sekundarschule 3 szintre (A/B/C) tagolódik, ahol az A a legjobb tanulmányi eredményűeknek való.",
    levels: [
      { name: "Kindergarten", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "Kötelező 2 év. Játékos fejlesztés, szociális készségek. Nem osztályoznak.", tip: "A gyerekek svájcinámet dialektusban kommunikálnak — ne ijedj meg, ha a kisgyerek hamarabb érti, mint te!" },
      { name: "Primarschule", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 éves alapiskola (1–6. osztály). Bevezetik a franciát 3. osztálytól, angolt 5. osztálytól.", tip: "A jegyek 1–6-ig mennek, ahol 6 a legjobb — fordítva mint Magyarországon!" },
      { name: "Sekundarschule", nameDe: "Sek A / B / C", emoji: "🏫", ages: "12–15 év", years: 3, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "3 párhuzamos szint: A (gimnáziumi előkészítő), B (közepes), C (szakmai irány). Az átjárás lehetséges.", tracks: ["Sek A → Gimnázium / Fachmittelschule", "Sek B → Berufslehre (szakmunkás)", "Sek C → Berufslehre alapszint"], tip: "A szint nem végleges! 1–2 év után átjárás lehetséges teljesítmény alapján." },
      { name: "Weiterführende Schulen", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Két fő út: Gimnázium (Matura) → Universität, vagy Berufslehre (Lehrstelle) → duális képzés + munka.", tracks: ["Gymnasium (4 év) → Universität / ETH", "Berufslehre (3–4 év) → Beruf + Berufsschule", "Fachmittelschule → Fachhochschule"] },
    ],
  },
  BE: {
    name: "Bern",
    lang: "de",
    flag: "🔴⚫",
    note: "Kétnyelvű kanton (német/francia). A struktúra ZH-hoz hasonló, de az Oberstufe elnevezés más.",
    levels: [
      { name: "Kindergarten", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "2 kötelező év. Játékalapú tanulás, helyi dialektus." },
      { name: "Primarschule", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 év (1–6. osztály). Francia 3. osztálytól, angol 5. osztálytól.", tip: "Bernben a francia régióban (Biel/Bienne) az iskola franciául megy — fontos a lakcím megválasztása!" },
      { name: "Sekundarstufe I", nameDe: "Sek / Real", emoji: "🏫", ages: "12–15 év", years: 3, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "2 szint: Sekundar (emelt) és Real (alap). Mindkettőből nyílik út Berufslehre-re.", tracks: ["Sekundar → Gymnasium lehetséges", "Real → Berufslehre"] },
      { name: "Weiterführende Schulen", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Gymnasium (Matura) vagy Berufslehre duális képzés.", tracks: ["Gymnasium → Universität Bern", "Berufslehre → Berufsschule + Meister"] },
    ],
  },
  GE: {
    name: "Genève",
    lang: "fr",
    flag: "🔴💛",
    note: "Frankofón kanton — az egész iskolarendszer franciául működik. A struktúra eltér a német kantonoktól.",
    levels: [
      { name: "École enfantine", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "Kétéves óvoda, kötelező. Franciában zajlik. Genf multikulturális — sok külföldi gyerek." },
      { name: "École primaire", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 év alapiskola. Angolt 5. osztálytól tanítják. Nincs officiális osztályozás az első 2 évben.", tip: "Genf a legdrágább kanton — az iskola INGYENES, de az iskolai ebéd (cantine) plusz 15–25 CHF/nap." },
      { name: "Cycle d'orientation", emoji: "🏫", ages: "12–15 év", years: 3, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "3 éves kötelező középfok. Nem szintre bontott — minden diák ugyanoda jár, de belső differenciálással.", tracks: ["Regroupement 1 (emelt)", "Regroupement 2 (alap)"] },
      { name: "Post-obligatoire", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Lycée (Matura) vagy Formation professionnelle (szakképzés).", tracks: ["Lycée → Université de Genève", "Formation prof. → CFC (Certificat fédéral de capacité)"] },
    ],
  },
  VD: {
    name: "Vaud",
    lang: "fr",
    flag: "🟢⚪",
    note: "Frankofón kanton Lausanne-nal. A HarmoS-reform alapján egységes 11 éves kötelező oktatás.",
    levels: [
      { name: "École enfantine", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "2 év kötelező óvoda. Játékalapú, francianyelvű." },
      { name: "École primaire", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 éves alapiskola. Angolt 5. osztálytól." },
      { name: "École Secondaire I (OCOM)", emoji: "🏫", ages: "12–15 év", years: 3, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "VD-ben 'OCOM' rendszer: részben differenciált osztályok matematikából és franciából.", tracks: ["Voie Prégymnasiale → Gymnase", "Voie Générale → CFC"] },
      { name: "Gymnase / Formation prof.", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Gymnase (Matura) vagy Formation professionnelle.", tracks: ["Gymnase → UNIL / EPFL", "CFC → Haute école spécialisée (HES)"] },
    ],
  },
  BS: {
    name: "Basel-Stadt",
    lang: "de",
    flag: "⚫🔴",
    note: "Városállam-kanton — kompakt, de egyedi 4+5 éves felosztással a Primarschulán belül.",
    levels: [
      { name: "Kindergarten", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "2 év kötelező. Soknemzetiségű (Baselt nagyon sok expat-család választja).", tip: "Baselban sok iskola Deutsch + Englisch kétnyelvű programot kínál (International Baccalaureate)." },
      { name: "Primarschule (1–4)", emoji: "📚", ages: "6–10 év", years: 4, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "BS-ben a Primarschule 4 éves — rövidebb mint máshol!" },
      { name: "Weiterbildungsschule (5–9)", emoji: "🏫", ages: "10–15 év", years: 5, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "2+3 éves belső bontással. E-Zug (emelt) és A-Zug (alap) pályák belül.", tracks: ["E-Zug → Gymnasium", "A-Zug → Berufslehre"] },
      { name: "Gymnasium / Berufslehre", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Klasszikus svájci kettős út. Basel-Stadt kiemelkedő gimnáziumi hálózattal rendelkezik.", tracks: ["Gymnasium → Universität Basel", "Berufslehre → Beruf + Berufsmaturität"] },
    ],
  },
  LU: {
    name: "Luzern",
    lang: "de",
    flag: "⚪🔵",
    note: "Tipikus közép-svájci kanton, nagyon hasonló ZH-hoz. A Sekundarschule 2 szintre tagolódik.",
    levels: [
      { name: "Kindergarten", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "2 kötelező év. Helyi svájcidialektus — Zürichtől kicsit eltérő kiejtés." },
      { name: "Primarschule", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 év. Francia 3. osztálytól. Evangéliumi tartalmak is jelen vannak (vallási kanton)." },
      { name: "Sekundarstufe I", nameDe: "Sek A / B", emoji: "🏫", ages: "12–15 év", years: 3, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "2 szint: A (emelt, gimnáziumra készít) és B (alap, Berufslehre).", tracks: ["Sek A → Kantonsschule (Gymnasium)", "Sek B → Berufslehre"] },
      { name: "Weiterführende Schulen", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Kantonsschule (Matura) vagy Berufslehre.", tracks: ["Kantonsschule → Universität Luzern", "Berufslehre → Beruf + Berufsschule"] },
    ],
  },
  AG: {
    name: "Aargau",
    lang: "de",
    flag: "⚫🔴",
    note: "Zürich melletti iparosodott kanton. Háromszintű Sekundar: E/B/P tagozatokkal.",
    levels: [
      { name: "Kindergarten", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "2 kötelező év." },
      { name: "Primarschule", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 év. Francia 3. osztálytól, angol 5. osztálytól." },
      { name: "Oberstufe", nameDe: "Sek E / B / P", emoji: "🏫", ages: "12–15 év", years: 3, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "3 szint: E (Erweitert, emelt), B (Berufsvorbereitend, szakmai), P (Progymnasial, gimnáziumi). AG specifikus!", tracks: ["P szint → Kantonsschule közvetlen belépő", "E szint → Berufslehre / Fachmittelschule", "B szint → Berufslehre alapszint"] },
      { name: "Gymnasium / Berufslehre", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "P-szintesek egyenesen gimnáziumba. E-szinteseknek felvételi kell.", tracks: ["Kantonsschule → Universitäten", "Berufslehre → Beruf + Berufsmaturität"] },
    ],
  },
  SG: {
    name: "St. Gallen",
    lang: "de",
    flag: "🟢⚪",
    note: "Keleti Svájc legnagyobb kantona. Az Oberstufe G/E/A szintre tagolódik.",
    levels: [
      { name: "Kindergarten", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "2 kötelező év. Erősen dialektusos — St. Galler Mundart." },
      { name: "Primarschule", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 év. Francia 3. osztálytól, angol 5. osztálytól." },
      { name: "Oberstufe", nameDe: "Sek G / E / A", emoji: "🏫", ages: "12–15 év", years: 3, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "3 szint: G (Grundansprüche, alap), E (Erweiterte, emelt), A (Aufbau, gimnáziumi előkészítő).", tracks: ["Sek A → Kantonsschule", "Sek E → Fachmittelschule / Berufslehre", "Sek G → Berufslehre"] },
      { name: "Weiterführende Schulen", emoji: "🎓", ages: "15–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Klassikus svájci bifurkáció.", tracks: ["Kantonsschule St. Gallen → Universität", "Berufslehre → Beruf"] },
    ],
  },
  TI: {
    name: "Ticino",
    lang: "it",
    flag: "🔴⚪",
    note: "Olasz nyelvű kanton — az egész iskolarendszer olaszul működik. A struktúra inkább az olasz modellt követi.",
    levels: [
      { name: "Scuola dell'infanzia", emoji: "🎨", ages: "4–6 év", years: 2, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "2 éves óvoda olaszul. Kevesebb a dialektus, mint a német kantonokban." },
      { name: "Scuola elementare", emoji: "📚", ages: "6–12 év", years: 6, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "6 éves alapiskola olaszul. Franciát és németet tanítják 2. évtől.", tip: "Ticinóban sokkal könnyebb az integráció olasz anyanyelvű gyerekeknek — sok olasz-svájci határon ingázó él itt." },
      { name: "Scuola media", emoji: "🏫", ages: "12–15 év", years: 4, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "TI-ben 4 éves középfok — hosszabb mint más kantonokban! Differenciált tantárgycsoportokkal.", tracks: ["Livello A (emelt)", "Livello B (alap)"] },
      { name: "Liceo / Formazione professionale", emoji: "🎓", ages: "16–19 év", years: "3–4", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Liceo (Matura) vagy CFC (Certificato federale di capacità — svájci szakmai bizonyítvány).", tracks: ["Liceo → USI (Università della Svizzera italiana)", "CFC → Lavoro + SUPSI"] },
    ],
  },
};

const CANTON_LIST = Object.entries(CANTONS).map(([code, data]) => ({ code: code as CantonCode, name: data.name, lang: data.lang }));

// ── Ausztria: NEMZETI iskolarendszer (nem tartományonként eltérő, mint a svájci kantonok). ──
const AT_NOTE = "Ausztriában az iskolarendszer szövetségi (nemzeti) — a struktúra egész Ausztriában nagyrészt azonos. 9 év a tankötelezettség (6–15 éves kor). Az osztályzás 1–5-ig megy, ahol az 1 a legjobb (5 = megbukott).";
const AT_LEVELS: SchoolLevel[] = [
  { name: "Kindergarten", emoji: "🎨", ages: "3–6 év", years: 3, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]", description: "Óvoda; az UTOLSÓ év (5 éves kortól) KÖTELEZŐ és ingyenes. Játékos fejlesztés + németre felkészítés.", tip: "Ha a gyerek nem tud németül, az óvoda Sprachförderung-gal (nyelvi felzárkóztatás) segít." },
  { name: "Volksschule", emoji: "📚", ages: "6–10 év", years: 4, color: "text-[#10b981]", bg: "bg-[#d1fae5]", description: "4 éves általános alapiskola (1–4. osztály). A 4. osztály végén dől el a továbbtanulás iránya.", tip: "Az osztályzás 1–5-ig (1 a legjobb) — fordítva, mint a svájci 6-os rendszer!" },
  { name: "Sekundarstufe I", nameDe: "MS / AHS-Unterstufe", emoji: "🏫", ages: "10–14 év", years: 4, color: "text-[#6366f1]", bg: "bg-[#ede9fe]", description: "Két út: Mittelschule (MS) vagy a gimnázium alsó tagozata (AHS-Unterstufe). Az átjárás lehetséges.", tracks: ["AHS-Unterstufe → Gymnasium felső → Matura", "Mittelschule (MS) → BHS / BMS / Lehre"], tip: "A jó eredményű MS-diákok később is válthatnak gimnáziumra vagy BHS-re." },
  { name: "Sekundarstufe II", emoji: "🎓", ages: "14–18/19 év", years: "1–5", color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]", description: "Több út a tankötelezettség után: érettségi (Matura) vagy duális szakképzés (Lehre).", tracks: ["AHS-Oberstufe (4 év) → Matura → Universität", "BHS — HTL / HAK / HLW (5 év) → Matura + szakma", "BMS (3–4 év) → szakmai bizonyítvány", "Lehre (duális, 3–4 év) → Lehrabschluss (+ »Lehre mit Matura«)", "Polytechnische Schule (1 év) → szakma-előkészítő"] },
];
const AT_TIPS = [
  { icon: "📝", text: "Beiratkozáshoz: útlevél/igazolvány, Meldezettel, e-card, és az előző iskola bizonyítványa (lehetőleg hitelesített fordítással)." },
  { icon: "🗣️", text: "Ha a gyerek nem tud németül: »Deutschförderklasse« / Deutschförderkurs segíti a felzárkózást — ingyenes." },
  { icon: "🎓", text: "A Matura (Reifeprüfung) az érettségi — ez az egyetemi felvétel feltétele. A »Lehre mit Matura« a szakmával párhuzamosan is megszerezhető, ingyen." },
  { icon: "🍱", text: "Az állami iskola ingyenes; a délutáni felügyelet (Nachmittagsbetreuung) és az ebéd külön fizethető." },
  { icon: "📅", text: "A Semesterferien (félévi szünet) Ausztriában tartományonként 2 hullámban van (kelet/nyugat); a nyári szünet országosan egységes." },
  { icon: "🔄", text: "Az iskolatípusok közti átjárás lehetséges — a gyerek nincs véglegesen »beskatulyázva«." },
];

export function SchoolSystem() {
  const [prefCountry] = usePreferredCountry();
  const isAT = (prefCountry ?? DEFAULT_COUNTRY) === "AT";
  const [selected, setSelected] = useState<CantonCode>("ZH");
  const canton = CANTONS[selected];
  const levels = isAT ? AT_LEVELS : canton.levels;
  const regionTitle = isAT ? "Ausztria" : canton.name;

  const langLabel: Record<string, string> = { de: "🇩🇪 Német", fr: "🇫🇷 Francia", it: "🇮🇹 Olasz" };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">🏫</span>
          <div>
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">{isAT ? "Osztrák Iskolarendszer" : "Svájci Iskolarendszer"}</h1>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
              {isAT
                ? "Az osztrák iskolarendszer szintjei kiköltöző szülőknek — a Kindergartentől a Maturáig és a Lehréig."
                : "Kantononként eltérő szintek vizuális ábrázolása kiköltöző szülőknek. Válaszd ki a kanton ahol laksz!"}
            </p>
          </div>
        </div>
      </section>

      {/* Régió-választó — csak CH (Ausztria nemzeti rendszer, nincs választó). */}
      {!isAT && (
      <div className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
        <label className="block text-[12px] font-bold uppercase tracking-wide text-ink-muted">Válaszd ki a kantont</label>
        <div className="grid grid-cols-3 gap-2">
          {CANTON_LIST.map(({ code, name, lang }) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelected(code)}
              className={cn(
                "rounded-[12px] border px-2 py-2.5 text-[12px] font-bold text-center transition-all active:scale-95",
                selected === code
                  ? "border-primary bg-primary text-white shadow-md"
                  : "border-line bg-surface-alt text-ink hover:bg-surface"
              )}
            >
              <span className="block text-[16px] mb-0.5">{lang === "de" ? "🇩🇪" : lang === "fr" ? "🇫🇷" : "🇮🇹"}</span>
              {name}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Régió info */}
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[14px] font-extrabold text-ink">{isAT ? "Ausztria" : canton.name}</span>
          <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-[11px] font-bold text-ink-muted">
            {isAT ? "🇩🇪 Német nyelvű" : `${langLabel[canton.lang]} nyelvű`}
          </span>
        </div>
        <p className="text-[12.5px] leading-snug text-ink-muted">{isAT ? AT_NOTE : canton.note}</p>
      </div>

      {/* Vizuális szintlépők */}
      <div className="space-y-3">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">Iskolai szintek — {regionTitle}</h2>
        {levels.map((level, idx) => (
          <div key={idx} className={cn("rounded-card border-2 p-4 shadow-card", level.bg, "border-transparent")}>
            {/* Fejléc */}
            <div className="flex items-start gap-3">
              {/* Kor-sáv */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-2xl">{level.emoji}</span>
                <div className={cn("mt-1 rounded-pill px-2 py-0.5 text-[11px] font-black", level.color, "bg-white/60")}>
                  {level.ages}
                </div>
                <div className="text-[11px] font-semibold text-ink-muted mt-0.5">{level.years} év</div>
              </div>

              {/* Tartalom */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className={cn("text-[15px] font-extrabold tracking-tight", level.color)}>{level.name}</h3>
                  {level.nameDe && (
                    <span className="text-[11px] font-bold text-ink-muted">({level.nameDe})</span>
                  )}
                </div>
                <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">{level.description}</p>

                {level.tracks && (
                  <div className="mt-2 space-y-1">
                    {level.tracks.map((track, ti) => (
                      <div key={ti} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", level.color.replace("text-", "bg-"))} />
                        {track}
                      </div>
                    ))}
                  </div>
                )}

                {level.tip && (
                  <div className="mt-2 rounded-[10px] bg-white/70 px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-muted">
                    💡 {level.tip}
                  </div>
                )}
              </div>
            </div>

            {/* Szintek összekötője */}
            {idx < levels.length - 1 && (
              <div className="flex justify-center mt-2">
                <span className="text-ink-muted text-lg">↓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Általános tippek */}
      <div className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
        <h2 className="text-[13px] font-extrabold text-ink">📌 Amit minden szülőnek tudni kell</h2>
        {(isAT ? AT_TIPS : [
          { icon: "📝", text: "Beiratkozáshoz: útlevél, tartózkodási engedély, és az előző iskola bizonyítványa (lehetőleg hitelesített fordítással)." },
          { icon: "🗣️", text: "Ha a gyerek nem tud svájcin / franciául / olaszul: a legtöbb kanton ingyenes INTENSIVKURS-t (felzárkóztató tanfolyamot) biztosít." },
          { icon: "🚌", text: "Az iskolabusz (Schulbus) sok helyen ingyenes — a körzet határolja meg. A lakcím megválasztása kulcsfontosságú." },
          { icon: "🍱", text: "Az iskolai ebéd (Mittagessen / cantine) külön fizethető — nem kötelező. Ára kb. 8–25 CHF/nap kantontól függően." },
          { icon: "📅", text: "Svájcban az iskolai szünetek KANTONONKÉNT ELTÉRNEK. Nincs egységes nyári szünet kezdet!" },
          { icon: "🔄", text: "Átjárás a szintek között lehetséges — félévente újraértékelik a diák helyzetét. Nem véglegesen 'skatulyázzák be' a gyereket." },
        ]).map((tip, i) => (
          <div key={i} className="flex gap-2.5 text-[12.5px] leading-snug text-ink-muted">
            <span className="shrink-0 text-base">{tip.icon}</span>
            <span>{tip.text}</span>
          </div>
        ))}
      </div>

      <LegalDisclaimer
        toolName="iskolarendszer útmutató"
        variant="info"
        notAdviceFor="jogi vagy oktatási hatósági"
        extraWarning={isAT
          ? "Az osztrák iskolarendszer szabályai tartományonként kis eltéréssel és évente változhatnak. Beiratkozás előtt ellenőrizd a lakhely szerinti tartományi oktatási igazgatóság (Bildungsdirektion) aktuális tájékoztatóját."
          : "A svájci iskolarendszer szabályai kantononként és évente változhatnak. Mindig ellenőrizd a lakhely szerinti kanton oktatási hivatal (Volksschulamt / Service de l'enseignement) aktuális tájékoztatóját beiratkozás előtt."}
        officialSources={isAT ? [
          { label: "oesterreich.gv.at — Schule & Bildung", url: "https://www.oesterreich.gv.at/themen/bildung_und_neue_medien.html" },
          { label: "BMBWF — Oktatási Minisztérium", url: "https://www.bmbwf.gv.at/" },
        ] : [
          { label: "ch.ch — Iskolarendszer", url: "https://www.ch.ch/de/bildung/" },
          { label: "EDK — Svájci Oktatási Konferencia", url: "https://www.edk.ch/" },
        ]}
      />
    </div>
  );
}
