/**
 * Lakásbérlés "Rejtett Költség" Kalkulátor — CH / AT / DE / NL szabályok.
 *
 * FONTOS: tájékoztató jellegű becslés. A pontos kaució-szabály országonként
 * eltér (CH: OR 257e §; DE: §551 BGB; NL: Wet goed verhuurderschap). A rezsi-
 * tételek (Nebenkosten / Betriebskosten / Servicekosten) a szerződésben.
 *
 * Forrás: ch.ch, mv.ch, OR 257e § · gesetze-im-internet.de (BGB/BetrKV) ·
 * mieterbund.de · huurcommissie.nl · rijksoverheid.nl.
 */

export type FlatSize = "studio" | "1-room" | "2-room" | "3-room" | "4-room" | "5plus-room";
export type HeatingType = "gas" | "oil" | "district" | "heatpump" | "pellet" | "unknown";
export type RentCountry = "CH" | "AT" | "DE" | "NL";
export type Region =
  | "city-zh" | "city-ge" | "city-bs" | "city-bern" | "suburb" | "rural"
  | "at-wien" | "at-graz" | "at-linz" | "at-salzburg" | "at-suburb" | "at-rural"
  | "de-munchen" | "de-berlin" | "de-frankfurt" | "de-hamburg" | "de-suburb" | "de-rural"
  | "nl-amsterdam" | "nl-rotterdam" | "nl-denhaag" | "nl-utrecht" | "nl-suburb" | "nl-rural";

export interface FlatSizeInfo {
  id: FlatSize;
  label: string;
  emoji: string;
  /** Tipikus négyzetméter-tartomány. */
  m2Min: number;
  m2Max: number;
}

export const FLAT_SIZES: FlatSizeInfo[] = [
  { id: "studio",      label: "Studio",    emoji: "🏚️", m2Min: 18, m2Max: 35 },
  { id: "1-room",      label: "1 szoba",   emoji: "🛏️", m2Min: 25, m2Max: 50 },
  { id: "2-room",      label: "2 szoba",   emoji: "🏠", m2Min: 40, m2Max: 75 },
  { id: "3-room",      label: "3 szoba",   emoji: "🏡", m2Min: 60, m2Max: 100 },
  { id: "4-room",      label: "4 szoba",   emoji: "🏘️", m2Min: 80, m2Max: 130 },
  { id: "5plus-room",  label: "5+ szoba",  emoji: "🏰", m2Min: 100, m2Max: 200 },
];

export const HEATING_TYPES: { id: HeatingType; label: string; emoji: string; costMod: number }[] = [
  { id: "gas",       label: "Gáz",          emoji: "🔥", costMod: 1.0 },
  { id: "oil",       label: "Olaj",         emoji: "🛢️", costMod: 1.15 },
  { id: "district",  label: "Távfűtés",     emoji: "♨️", costMod: 0.95 },
  { id: "heatpump",  label: "Hőszivattyú",  emoji: "⚡", costMod: 0.75 },
  { id: "pellet",    label: "Pellet",       emoji: "🪵", costMod: 0.85 },
  { id: "unknown",   label: "Nem tudom",    emoji: "❓", costMod: 1.0 },
];

export const REGIONS: { id: Region; label: string; emoji: string; nebenkostenMod: number; country: RentCountry }[] = [
  { id: "city-zh",   label: "Zürich város", emoji: "🏙️", nebenkostenMod: 1.25, country: "CH" },
  { id: "city-ge",   label: "Genf város",   emoji: "🏙️", nebenkostenMod: 1.20, country: "CH" },
  { id: "city-bs",   label: "Basel város",  emoji: "🏙️", nebenkostenMod: 1.15, country: "CH" },
  { id: "city-bern", label: "Bern város",   emoji: "🏙️", nebenkostenMod: 1.10, country: "CH" },
  { id: "suburb",    label: "Agglomeráció", emoji: "🏘️", nebenkostenMod: 1.00, country: "CH" },
  { id: "rural",     label: "Vidék",        emoji: "🌳", nebenkostenMod: 0.85, country: "CH" },
  // Ausztria
  { id: "at-wien",     label: "Bécs",        emoji: "🏙️", nebenkostenMod: 1.15, country: "AT" },
  { id: "at-graz",     label: "Graz",        emoji: "🏙️", nebenkostenMod: 1.05, country: "AT" },
  { id: "at-linz",     label: "Linz",        emoji: "🏙️", nebenkostenMod: 1.05, country: "AT" },
  { id: "at-salzburg", label: "Salzburg",    emoji: "🏙️", nebenkostenMod: 1.10, country: "AT" },
  { id: "at-suburb",   label: "Agglomeráció", emoji: "🏘️", nebenkostenMod: 1.00, country: "AT" },
  { id: "at-rural",    label: "Vidék",       emoji: "🌳", nebenkostenMod: 0.85, country: "AT" },
  // Németország
  { id: "de-munchen",   label: "München",     emoji: "🏙️", nebenkostenMod: 1.20, country: "DE" },
  { id: "de-berlin",    label: "Berlin",      emoji: "🏙️", nebenkostenMod: 1.05, country: "DE" },
  { id: "de-frankfurt", label: "Frankfurt",   emoji: "🏙️", nebenkostenMod: 1.15, country: "DE" },
  { id: "de-hamburg",   label: "Hamburg",     emoji: "🏙️", nebenkostenMod: 1.10, country: "DE" },
  { id: "de-suburb",    label: "Agglomeráció", emoji: "🏘️", nebenkostenMod: 1.00, country: "DE" },
  { id: "de-rural",     label: "Vidék",       emoji: "🌳", nebenkostenMod: 0.85, country: "DE" },
  // Hollandia
  { id: "nl-amsterdam", label: "Amszterdam",  emoji: "🏙️", nebenkostenMod: 1.20, country: "NL" },
  { id: "nl-rotterdam", label: "Rotterdam",   emoji: "🏙️", nebenkostenMod: 1.05, country: "NL" },
  { id: "nl-denhaag",   label: "Hága",        emoji: "🏙️", nebenkostenMod: 1.10, country: "NL" },
  { id: "nl-utrecht",   label: "Utrecht",     emoji: "🏙️", nebenkostenMod: 1.10, country: "NL" },
  { id: "nl-suburb",    label: "Agglomeráció", emoji: "🏘️", nebenkostenMod: 1.00, country: "NL" },
  { id: "nl-rural",     label: "Vidék",       emoji: "🌳", nebenkostenMod: 0.85, country: "NL" },
];

/** A választott ország régiói (a régió-választóhoz). Ismeretlen ország → CH. */
export function regionsFor(country: string): { id: Region; label: string; emoji: string; nebenkostenMod: number }[] {
  const c: RentCountry = country === "AT" || country === "DE" || country === "NL" ? country : "CH";
  return REGIONS.filter((r) => r.country === c);
}

/**
 * Svájci szabály (OR 257e §): a kaució max 3 havi nettó bérleti díj.
 */
export const MAX_KAUTION_MONTHS = 3;

/**
 * Tipikus Mietkautionsversicherung éves díj (a kaúció-összegre).
 * 4-6% évente — átlag 5%.
 */
export const KAUTION_INSURANCE_RATE = 0.05;

/**
 * Tipikus opportunity cost: a kötött kaúciós-számlán a kamat kb. 0%,
 * miközben egy 3a-piller vagy ETF kb. 4-6%-ot hozhatna.
 */
export const OPPORTUNITY_COST_RATE = 0.04;

export interface RentCalcInput {
  /** Havi nettó bérleti díj (a helyi pénznemben), Nebenkosten nélkül. */
  monthlyRentChf: number;
  /** Lakás méret. */
  size: FlatSize;
  /** Fűtés-típus. */
  heating: HeatingType;
  /** Régió. */
  region: Region;
  /** Akontó rezsi (havi, ahogy a szerződésben szerepel). */
  acontoNebenkostenChf: number;
  /** Hány évre kalkulálunk (1-10). */
  yearsToCalculate: number;
  /** Kaució hónapok száma (CH/AT/DE: 3, NL: 2). Default 3. */
  depositMonths?: number;
  /** Rezsi-alapráta a helyi pénznemben, /m²/év (CH 32, AT 26, DE 30, NL 24). Default 32. */
  baseNebenkostenPerM2?: number;
}

export interface RentCalcResult {
  // === KAUCIÓ ===
  kautionAmount: number;
  /** A kötött pénz éves opportunity-vesztesége. */
  kautionOpportunityCostPerYear: number;
  /** Mietkautionsversicherung éves díja, ha készpénz helyett azt választod. */
  insurancePremiumPerYear: number;

  // === NEBENKOSTEN ===
  /** Becslés a tényleges éves Nebenkosten-re. */
  estimatedActualNebenkostenPerYear: number;
  /** Akontó éves összege (12 hónap). */
  acontoNebenkostenPerYear: number;
  /** A különbség: pozitív = utánfizetés, negatív = visszatérítés. */
  nebenkostenSettlementPerYear: number;
  /** Várt forgatókönyv. */
  settlementDirection: "underpaid" | "overpaid" | "balanced";

  // === ÖSSZESÍTÉS ===
  /** Éves teljes lakhatási költség (bér + akontó + kaúció-opportunity). */
  firstYearTotalCost: number;
  /** A teljes "rejtett" költség (opportunity + utánfizetés-kockázat) az időszakra. */
  totalHiddenCostOverPeriod: number;
}

export function calculateRentCost(input: RentCalcInput): RentCalcResult {
  // === KAUCIÓ ===
  const depositMonths = input.depositMonths ?? MAX_KAUTION_MONTHS;
  const kautionAmount = input.monthlyRentChf * depositMonths;
  const kautionOpportunityCostPerYear = kautionAmount * OPPORTUNITY_COST_RATE;
  const insurancePremiumPerYear = kautionAmount * KAUTION_INSURANCE_RATE;

  // === REZSI BECSLÉS ===
  // Alapérték: kb. pénznem/m²/év a méret, fűtés, régió szerint
  const size = FLAT_SIZES.find((s) => s.id === input.size)!;
  const heating = HEATING_TYPES.find((h) => h.id === input.heating)!;
  const region = REGIONS.find((r) => r.id === input.region) ?? REGIONS[0];

  // Átlagos m² (méret kategória közepe)
  const avgM2 = (size.m2Min + size.m2Max) / 2;

  // Tipikus rezsi-alapráta /m²/év (ország szerint: CH 32, AT 26, DE 30, NL 24)
  const baseNebenkostenPerM2 = input.baseNebenkostenPerM2 ?? 32;
  const estimatedActualNebenkostenPerYear = Math.round(
    avgM2 * baseNebenkostenPerM2 * heating.costMod * region.nebenkostenMod,
  );

  const acontoNebenkostenPerYear = input.acontoNebenkostenChf * 12;
  const diff = estimatedActualNebenkostenPerYear - acontoNebenkostenPerYear;
  const settlementDirection: "underpaid" | "overpaid" | "balanced" =
    diff > 200 ? "underpaid" : diff < -200 ? "overpaid" : "balanced";

  // === ÖSSZESÍTÉS ===
  const yearlyRentTotal = input.monthlyRentChf * 12;
  const firstYearTotalCost =
    yearlyRentTotal + acontoNebenkostenPerYear + Math.max(0, diff) + kautionOpportunityCostPerYear;

  const totalHiddenCostOverPeriod =
    (kautionOpportunityCostPerYear + Math.max(0, diff)) * input.yearsToCalculate;

  return {
    kautionAmount,
    kautionOpportunityCostPerYear,
    insurancePremiumPerYear,
    estimatedActualNebenkostenPerYear,
    acontoNebenkostenPerYear,
    nebenkostenSettlementPerYear: diff,
    settlementDirection,
    firstYearTotalCost,
    totalHiddenCostOverPeriod,
  };
}

/* ═══════════════════════════ PER-ORSZÁG KONFIGURÁCIÓ ═══════════════════════════
 * Minden ország-specifikus szöveg és paraméter EGY helyen — a komponensek ebből
 * olvasnak (nincs `isAT ? ... : ...` binárisozás, ami DE/NL-t a svájci ágra ejtené).
 */
export interface RentCountryConfig {
  currency: "CHF" | "EUR";
  /** Kaució hónapok (CH/AT/DE: 3, NL: 2). */
  depositMonths: number;
  /** Rezsi-alapráta /m²/év a becsléshez. */
  baseNkPerM2: number;
  /** Kaució főnév (hero + kártya). */
  depositNoun: string;
  /** Rezsi főnév (Nebenkosten / Betriebskosten / Servicekosten). */
  nkNoun: string;
  /** Rezsi rövidítés a kompakt összevetéshez (NK / BK / SK). */
  nkShort: string;
  /** Kaució-kártya kis fejléc. */
  depositEyebrow: string;
  /** Kaució-kártya cím. */
  depositHeadline: string;
  /** A kaúció-számla leírása (a „Kaúció összege" sor alá). */
  depositAccountSub: string;
  /** Melyik második sor a kaúció-kártyán: biztosítás / ingatlanos-jutalék / semmi. */
  depositExtra: "insurance" | "provision" | "none";
  /** Opcionális extra jegyzet a kaúció alatt (pl. DE részletfizetés, NL 2-havi plafon). */
  depositNote?: string;
  /** Tipp-doboz a kaúció-kártyán. */
  depositTip: string;
  /** Tipp-doboz a rezsi-kártyán. */
  nkTip: string;
  /** „Mit kérdezz a bérléskor?" pontok. */
  questions: { bold: string; rest: string }[];
  /** LegalDisclaimer figyelmeztetés. */
  disclaimerWarning: string;
  /** LegalDisclaimer hivatalos források. */
  officialSources: { label: string; url: string }[];
}

export const RENT_CONFIG: Record<RentCountry, RentCountryConfig> = {
  CH: {
    currency: "CHF",
    depositMonths: 3,
    baseNkPerM2: 32,
    depositNoun: "Mietkaution",
    nkNoun: "Nebenkosten",
    nkShort: "NK",
    depositEyebrow: "Mietkaution (kaúció) — OR 257e §",
    depositHeadline: "Max 3 havi nettó bérleti díj",
    depositAccountSub: "kötött Mietkautionskonto (a te nevedre)",
    depositExtra: "insurance",
    depositTip:
      "ha hosszú távra (5+ év) maradnál, a készpénz-kaúció jobb (visszakapod). Rövid távra (1-2 év) vagy ha nincs likviditásod, a Mietkautionsversicherung megoldás lehet — de az éves díj „elveszett” pénz.",
    nkTip:
      "a bérleti szerződésben mindig kérd a Nebenkosten-tételek részletes bontását (Heizung, Warmwasser, Hauswart, Allgemeinstrom stb.). Túl alacsony akontó = nagy utánfizetés-meglepetés; túl magas akontó = a pénzed nem kamatozik egész évben.",
    questions: [
      { bold: "Mietkautionskonto neve:", rest: "melyik banknál vezeti? (A te nevedre kell, nem a bérbeadóéra.)" },
      { bold: "NK-tételek részletes bontása", rest: "a szerződésben. Ha csak „NK 180 CHF” áll, kérd a részletezést." },
      { bold: "Mietzinsreduktion", rest: "a hivatalos referencia-kamatláb csökkenésekor — a bérlő kérheti." },
      { bold: "Kiköltözéskor:", rest: "a kaúciót a bérbeadó max 30-60 nap múlva köteles felszabadítani, a végszámla után. Ha vita van: Mieterverband segít." },
    ],
    disclaimerWarning:
      "A Nebenkosten-becslés átlagos svájci adatokat használ (32 CHF/m²/év alaprátával) — a TE konkrét lakásod tényleges költsége jelentősen eltérhet a fűtés-állapottól, lakói szokásoktól, télies időjárástól. Az 'opportunity cost' számítás feltételezett 4% éves hozam alapján — befektetési tanácsnak NEM minősül. Bérleti vita vagy elszámolás-kifogás esetén fordulj a kantoni Mieterverband-hoz vagy szakképzett bérleti-jogászhoz.",
    officialSources: [
      { label: "Mieterverband (mv.ch)", url: "https://www.mieterverband.ch/" },
      { label: "ch.ch — Bérlés", url: "https://www.ch.ch/de/wohnen/" },
      { label: "OR 257e § (kaúció)", url: "https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_257_e" },
    ],
  },
  AT: {
    currency: "EUR",
    depositMonths: 3,
    baseNkPerM2: 26,
    depositNoun: "Kaution",
    nkNoun: "Betriebskosten",
    nkShort: "BK",
    depositEyebrow: "Kaution (kaúció)",
    depositHeadline: "Általában 3 havi bruttó bérleti díj",
    depositAccountSub: "Sparbuch / kamatozó letéti számla",
    depositExtra: "provision",
    depositTip:
      "a kaúciót a bérbeadó köteles kamatozó számlán (Sparbuch) tartani, és kiköltözéskor kamatostul visszaadni. Keress provisionsfrei (jutalékmentes) hirdetést — így megspórolod a 2 havi Provisiont.",
    nkTip:
      "a bérleti szerződésben mindig kérd a Betriebskosten-tételek részletes bontását. Túl alacsony akontó = nagy utánfizetés az éves elszámolásnál; túl magas akontó = a pénzed nem kamatozik egész évben.",
    questions: [
      { bold: "Kaution-számla (Sparbuch):", rest: "a kaúciót a bérbeadó köteles a TE nevedre, kamatozó számlán tartani — kiköltözéskor kamatostul jár vissza." },
      { bold: "Betriebskosten-tételek bontása", rest: "a szerződésben. Ha csak „BK 180 EUR” áll, kérd a részletezést." },
      { bold: "Provisionsfrei (jutalékmentes)", rest: "hirdetést keress — így megspórolod a max 2 havi ingatlanos-jutalékot (Provision)." },
      { bold: "Richtwert / Mietzinsobergrenze:", rest: "régi (Altbau) lakásnál törvényi felső díjhatár lehet. Vita esetén: Arbeiterkammer (AK) vagy Mietervereinigung." },
    ],
    disclaimerWarning:
      "A Betriebskosten-becslés átlagos adatokat használ — a TE konkrét lakásod tényleges költsége jelentősen eltérhet a fűtés-állapottól és szokásoktól. Az 'opportunity cost' feltételezett 4% éves hozam alapján — befektetési tanácsnak NEM minősül. A Provision/Kaution/Richtwert szabályok időben változnak; bérleti vita esetén fordulj az Arbeiterkammer-hez (AK) vagy a Mietervereinigung-hoz.",
    officialSources: [
      { label: "Arbeiterkammer (AK) — Wohnen/Miete", url: "https://www.arbeiterkammer.at/" },
      { label: "Mietervereinigung", url: "https://mietervereinigung.at/" },
      { label: "oesterreich.gv.at — Wohnen", url: "https://www.oesterreich.gv.at/themen/bauen_wohnen_und_umwelt.html" },
    ],
  },
  DE: {
    currency: "EUR",
    depositMonths: 3,
    baseNkPerM2: 30,
    depositNoun: "Kaution",
    nkNoun: "Nebenkosten",
    nkShort: "NK",
    depositEyebrow: "Kaution (kaúció) — §551 BGB",
    depositHeadline: "Max 3 havi nettó (kalt) bérleti díj",
    depositAccountSub: "elkülönített, kamatozó letéti számla (a te javadra)",
    depositExtra: "insurance",
    depositNote:
      "A kaúciót 3 részletben is fizetheted (§551 BGB). Bérlőként általában NEM fizetsz ingatlanos-jutalékot — a 2015-ös Bestellerprinzip szerint a megrendelő (általában a bérbeadó) fizeti a Maklert.",
    depositTip:
      "a Kaution a te javadra, a bérbeadó vagyonától elkülönített kamatozó számlán áll (§551 BGB) — kiköltözéskor kamatostul jár vissza. Alternatíva a Kautionsbürgschaft (kaúció-biztosítás), de annak éves díja elveszett pénz.",
    nkTip:
      "a bérleti szerződésben mindig kérd a Nebenkosten/Betriebskosten-tételek bontását (a BetrKV szerint elszámolható tételek). A bérbeadó évente köteles Nebenkostenabrechnung-ot adni (max 12 hónapon belül).",
    questions: [
      { bold: "Kaution-számla:", rest: "a bérbeadó köteles a kaúciót a saját vagyonától elkülönítve, kamatozó számlán tartani (§551 BGB)." },
      { bold: "Betriebskosten-bontás:", rest: "csak a BetrKV szerint elszámolható tételek háríthatók át. Ha csak „NK 180 EUR” áll, kérd a részletezést." },
      { bold: "Nebenkostenabrechnung:", rest: "a bérbeadó évente, max 12 hónapon belül köteles elszámolni; utólagos követelés csak határidőn belül." },
      { bold: "Vita esetén:", rest: "Deutscher Mieterbund (helyi Mieterverein) — tagdíjas jogsegéllyel." },
    ],
    disclaimerWarning:
      "A Nebenkosten-becslés átlagos német adatokat használ (~30 EUR/m²/év alaprátával) — a TE konkrét lakásod tényleges költsége jelentősen eltérhet. Az 'opportunity cost' feltételezett 4% éves hozam alapján — befektetési tanácsnak NEM minősül. Bérleti vita vagy Nebenkostenabrechnung-kifogás esetén fordulj a Deutscher Mieterbund helyi Mietervereinjéhez vagy szakképzett bérleti-jogászhoz.",
    officialSources: [
      { label: "Deutscher Mieterbund", url: "https://www.mieterbund.de/" },
      { label: "Betriebskostenverordnung (BetrKV)", url: "https://www.gesetze-im-internet.de/betrkv/" },
      { label: "§551 BGB (Kaution)", url: "https://www.gesetze-im-internet.de/bgb/__551.html" },
    ],
  },
  NL: {
    currency: "EUR",
    depositMonths: 2,
    baseNkPerM2: 24,
    depositNoun: "Waarborgsom",
    nkNoun: "Servicekosten",
    nkShort: "SK",
    depositEyebrow: "Waarborgsom (kaúció) — Wet goed verhuurderschap",
    depositHeadline: "Max 2 havi bérleti díj (2023 óta)",
    depositAccountSub: "a bérbeadónál letétben (max 2 havi díj)",
    depositExtra: "none",
    depositNote:
      "2023 (Wet goed verhuurderschap) óta a waarborgsom max 2 havi (kale huur) bérleti díj lehet, és a kiköltözés után max 14 napon belül vissza kell adni. Bérlőként általában NEM fizetsz bemiddelingskosten-t (2015 óta tilos ráhárítani, ha az ügynök a bérbeadónak dolgozik).",
    depositTip:
      "a waarborgsom max 2 havi díj lehet, és kiköltözéskor max 14 nap alatt jár vissza (levonva az esetleges károkat/tartozást). Ha nem adják vissza időben: Huurcommissie vagy kantonrechter.",
    nkTip:
      "a servicekosten (fűtés/warmte, közös áram, huismeester stb.) elszámolását a bérbeadó évente köteles adni (jaarlijkse afrekening). A kale huur (csupasz bér) felett külön szerepel — kérd a tételek bontását.",
    questions: [
      { bold: "Waarborgsom-plafon:", rest: "max 2 havi bér (2023 óta), és max 14 nap alatt vissza a kiköltözés után." },
      { bold: "Servicekosten-bontás:", rest: "a bérbeadó évente köteles elszámolni (jaarlijkse afrekening). Kérd a tételek listáját." },
      { bold: "Huurprijscheck (puntensysteem / WWS):", rest: "a maximális bér a lakás pontszáma alapján számolható — a Huurcommissie ellenőrzi." },
      { bold: "Vita esetén:", rest: "Huurcommissie (huurcommissie.nl); Amszterdamban a !Woon, jogi kérdésben a Juridisch Loket." },
    ],
    disclaimerWarning:
      "A Servicekosten-becslés átlagos holland adatokat használ (~24 EUR/m²/év alaprátával) — a TE konkrét lakásod tényleges költsége jelentősen eltérhet. Az 'opportunity cost' feltételezett 4% éves hozam alapján — befektetési tanácsnak NEM minősül. Bérleti vita vagy túl magas bér gyanúja esetén fordulj a Huurcommissie-hez vagy a Juridisch Loket-hez.",
    officialSources: [
      { label: "Huurcommissie", url: "https://www.huurcommissie.nl/" },
      { label: "Rijksoverheid — Huurwoning", url: "https://www.rijksoverheid.nl/onderwerpen/huurwoning" },
      { label: "Het Juridisch Loket", url: "https://www.juridischloket.nl/" },
    ],
  },
};

/** Ország → rent-konfig (ismeretlen ország → CH). */
export function getRentConfig(country: string | null | undefined): RentCountryConfig {
  if (country === "AT" || country === "DE" || country === "NL") return RENT_CONFIG[country];
  return RENT_CONFIG.CH;
}
