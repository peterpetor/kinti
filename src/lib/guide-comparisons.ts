/**
 * Országos összehasonlító táblázatok a tudásbázis-cikkekhez (AEO — a
 * válaszgépek/featured-snippet a struktúrált összehasonlítást idézik a
 * „melyik országban jobb/könnyebb X?" kérdésekre; a magyar olvasónak pedig
 * a CH/AT/DE/NL közti választáshoz ad egy-pillantásos képet).
 *
 * FONTOS: minden cella a MEGLÉVŐ, hivatalos forrásokból írt guide-tartalom
 * (lib/guides.ts) tömörítése — NEM új tényállítás. A pontos, dátumozott
 * számokat a guide-ok szándékosan hedgelik („az aktuálisat a hivatalos
 * oldalon") — a táblázat ugyanezt a szintet tartja, alul figyelmeztetéssel.
 * A „—" azt jelenti: az adott ország cikke ezt a szempontot nem tárgyalja
 * (nem tippelünk értéket, ld. a precise-address / no-new-claim fegyelem).
 */

export interface ComparisonRow {
  label: string;
  ch: string;
  at: string;
  de: string;
  nl: string;
}

export interface GuideComparison {
  id: string;
  /** A táblázat címe (H2). */
  caption: string;
  /** Egy mondat kontextus a táblázat fölé. */
  intro: string;
  /** Országonkénti guide-slug — EZEKEN a lapokon jelenik meg a táblázat, és a
   *  reader országának oszlopa kiemelve. */
  slugs: { ch: string; at: string; de: string; nl: string };
  rows: ComparisonRow[];
}

export const GUIDE_COMPARISONS: GuideComparison[] = [
  {
    id: "egeszsegbiztositas",
    caption: "Egészségbiztosítás a 4 országban — egy pillantásra",
    intro:
      "A fő szerkezeti különbség: Svájcban és Hollandiában fix havi díjat fizetsz és biztosítót választasz, Ausztriában és Németországban a bérből vont járulék fedezi.",
    slugs: {
      ch: "egeszsegbiztositas-krankenkasse",
      at: "at-egeszsegbiztositas",
      de: "de-egeszsegbiztositas",
      nl: "nl-egeszsegbiztositas",
    },
    rows: [
      { label: "Rendszer", ch: "Alapbiztosítás (KVG/LAMal)", at: "ÖGK + e-card", de: "GKV (vagy PKV)", nl: "Basisverzekering" },
      { label: "Pénztárt te választod?", ch: "Igen, szabad választás", at: "Nem — automatikus ÖGK", de: "Igen (AOK, TK, Barmer…)", nl: "Igen" },
      { label: "Mikorra kell meglennie", ch: "3 hónap az érkezéstől", at: "A bejelentéssel automatikus", de: "A munkaviszonnyal indul", nl: "4 hónap a start-tól" },
      { label: "Havi teher", ch: "Fix díj (biztosítónként/kantononként eltér)", at: "Bérből vont járulék (nincs külön díj)", de: "~14,6% + Zusatzbeitrag, fele-fele a munkáltatóval", nl: "Fix díj ~140 €/hó + éves önrész (eigen risico)" },
      { label: "Első kontakt", ch: "Háziorvos", at: "Hausarzt", de: "Hausarzt", nl: "Huisarts (kapuőr a szakorvoshoz)" },
    ],
  },
  {
    id: "bejelentkezes",
    caption: "Bejelentkezés és tartózkodás — egy pillantásra",
    intro:
      "EU-állampolgárként mind a 4 országban szabadon letelepedhetsz — a határidők és a kapott azonosítók viszont eltérnek.",
    slugs: {
      ch: "bejelentkezes-letelepedes",
      at: "at-bejelentkezes",
      de: "de-bejelentkezes",
      nl: "nl-bejelentkezes",
    },
    rows: [
      { label: "Lakcím-bejelentés határideje", ch: "14 nap", at: "3 nap", de: "kb. 1–2 hét (városfüggő)", nl: "néhány nap (4+ hó tartózkodásnál)" },
      { label: "3 hónap feletti tartózkodás", ch: "Tartózkodási engedély (B/L)", at: "Anmeldebescheinigung (4 hón belül)", de: "Nincs külön engedély (Freizügigkeit)", nl: "Nincs (vrij verkeer)" },
      { label: "Amit elsőként kapsz", ch: "Engedély-kártya", at: "Meldezettel", de: "Meldebescheinigung + Steuer-ID", nl: "BSN (mindenhez kell)" },
      { label: "Állampolgárság (jellemzően)", ch: "—", at: "~10 év", de: "5 év", nl: "5 év + inburgering-vizsga" },
      { label: "Magyar állampolgárság megtartható?", ch: "—", at: "Nem — le kell mondani", de: "Igen (2024 óta engedélyezett)", nl: "Fő szabály: nem (kivételekkel)" },
    ],
  },
  {
    id: "munkavallalas",
    caption: "Munka és bér a 4 országban — egy pillantásra",
    intro:
      "EU-állampolgárként mindenhol engedély nélkül dolgozhatsz — a szabadság, a minimálbér és a 13.–14. havi juttatás viszont országonként más.",
    slugs: {
      ch: "munkavallalas",
      at: "at-munkavallalas",
      de: "de-munkavallalas",
      nl: "nl-munkavallalas",
    },
    rows: [
      { label: "Munkavállalási engedély", ch: "Nem kell (bejelentkezés után)", at: "Nem kell", de: "Nem kell", nl: "Nem kell (csak BSN)" },
      { label: "Törvényi munkaidő", ch: "max. 45 óra/hét", at: "40 óra/hét (sok KV 38,5)", de: "Szerződés / Tarifvertrag szerint", nl: "Szerződés szerint" },
      { label: "Fizetett szabadság minimum", ch: "4 hét", at: "5 hét (25 munkanap)", de: "min. 20 munkanap", nl: "~20 nap (4× heti óraszám)" },
      { label: "13.–14. havi fizetés", ch: "Nem jellemző", at: "Igen (14 havi bér szokásos)", de: "Nem törvényi", nl: "8% vakantiegeld (májusban)" },
      { label: "Minimálbér", ch: "Nincs országos (kantoni/GAV)", at: "Kollektívszerződés szerint", de: "~13,90 €/óra (2026)", nl: "~14 €/óra (2025)" },
    ],
  },
  {
    id: "munkanelkuli",
    caption: "Munkanélküli-ellátás — egy pillantásra",
    intro:
      "A hivatal és a jogosultsági minimum országonként más, de közös: a magyar biztosítási idők U1-igazolással mindenhol beszámíthatnak.",
    slugs: {
      ch: "munkanelkuli-biztositas",
      at: "at-munkanelkuli",
      de: "de-munkanelkuli",
      nl: "nl-munkanelkuli",
    },
    rows: [
      { label: "Hol igényled", ch: "RAV", at: "AMS", de: "Agentur für Arbeit", nl: "UWV" },
      { label: "Jogosultsági minimum", ch: "12 hó munka / 2 év", at: "52 hét / 2 év", de: "12 hó / 30 hó", nl: "26 hét / 36 hét" },
      { label: "Ellátás mértéke", ch: "—", at: "~55% nettó", de: "~60% nettó (gyerekkel 67%)", nl: "75%, majd 70%" },
      { label: "Mikor jelentkezz", ch: "Legkésőbb az 1. ellátásra jogosult napon", at: "Az utolsó munkanap másnapján", de: "A felmondás után max. 3 nap", nl: "Az utolsó munkanap utáni 1 hét" },
      { label: "Magyar évek beszámítása", ch: "Igen (U1)", at: "Igen (U1)", de: "Igen (U1)", nl: "Igen (U1)" },
    ],
  },
  {
    id: "csaladi-potlek",
    caption: "Családi pótlék — egy pillantásra",
    intro:
      "Ha a gyerek Magyarországon él, mind a 4 országban EU-koordináció szerint, különbözet-elszámolással jár az ellátás.",
    slugs: {
      ch: "csaladi-potlek",
      at: "at-csaladi-potlek",
      de: "de-csaladi-potlek",
      nl: "nl-csaladi-potlek",
    },
    rows: [
      { label: "Neve", ch: "Kinderzulage", at: "Familienbeihilfe", de: "Kindergeld", nl: "Kinderbijslag" },
      { label: "Hol igényled", ch: "Munkáltató / pénztár", at: "FinanzOnline (Beih 100)", de: "Familienkasse", nl: "SVB" },
      { label: "Kifizetés gyakorisága", ch: "Havonta", at: "Havonta", de: "Havonta", nl: "Negyedévente" },
      { label: "Ha a gyerek Magyarországon él", ch: "EU-koordináció, különbözet", at: "EU-koordináció, különbözet", de: "EU-koordináció, különbözet", nl: "EU-koordináció, különbözet" },
    ],
  },
  {
    id: "adozas",
    caption: "Adózás és adóbevallás — egy pillantásra",
    intro:
      "A bérből mindenhol vonják az adót — a különbség, hogy az éves bevallás mikor kötelező, és hol jár vissza gyakran pénz.",
    slugs: {
      ch: "adozas-quellensteuer",
      at: "at-adozas",
      de: "de-adozas",
      nl: "nl-adozas",
    },
    rows: [
      { label: "Bérből vont adó", ch: "Forrásadó (Quellensteuer) — B/L engedéllyel", at: "Lohnsteuer", de: "Lohnsteuer", nl: "Loonheffing" },
      { label: "Éves adóbevallás", ch: "C engedéllyel (B/L-nél a forrásadó fedez)", at: "Önkéntes — gyakran visszajár", de: "Gyakran önkéntes — gyakran visszajár", nl: "Jellemzően kötelező (határidő: máj. 1.)" },
      { label: "Online portál", ch: "Kantoni adóhivatal", at: "FinanzOnline", de: "ELSTER", nl: "Mijn Belastingdienst (DigiD)" },
    ],
  },
];

/** Slug → a hozzá tartozó összehasonlítás (bármelyik ország cikke a kulcs). */
const BY_SLUG: Map<string, GuideComparison> = (() => {
  const m = new Map<string, GuideComparison>();
  for (const c of GUIDE_COMPARISONS) {
    for (const slug of Object.values(c.slugs)) m.set(slug, c);
  }
  return m;
})();

export function comparisonForSlug(slug: string): GuideComparison | undefined {
  return BY_SLUG.get(slug);
}
