import type { IconName } from "@/components/ui/icons";

/** Kinek releváns egy feladat: család-specifikus, csak EU-s, csak nem-EU-s. */
export type RelocationAudience = "family" | "eu" | "noneu";

export type RoadmapTask = {
  id: string;
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
  linkIcon?: IconName;
  /** Feltételes feladat — csak a profilhoz illő esetben jelenik meg. Üres = mindenkinek. */
  tags?: RelocationAudience[];
};

export type RoadmapPhase = {
  id: string;
  title: string;
  icon: IconName;
  tasks: RoadmapTask[];
};

/** A személyre szabó wizard válaszai (localStorage: kinti_relocation_profile). */
export interface RelocationProfile {
  family: boolean; // családdal/gyerekkel költözik
  eu: boolean;     // EU/EFTA-állampolgár (szabad mozgás)
}

/** Egy feladat látszik-e az adott profilnál (feltétel-szűrés). */
export function taskVisible(task: RoadmapTask, p: RelocationProfile): boolean {
  if (!task.tags || task.tags.length === 0) return true;
  if (task.tags.includes("family") && !p.family) return false;
  if (task.tags.includes("eu") && !p.eu) return false;
  if (task.tags.includes("noneu") && p.eu) return false;
  return true;
}

export const PHASES_CH: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "cv", title: "Svájci önéletrajz (CV) elkészítése", description: "A svájci munkáltatók specifikus formátumot várnak el.", linkHref: "/tudasbazis", linkLabel: "Tudásbázis", linkIcon: "bookmark" },
      { id: "ber", title: "Bérszint ellenőrzése", description: "Nézd meg a célkantonod átlagos fizetéseit.", linkHref: "/iranytu", linkLabel: "Bérkalkulátor", linkIcon: "trending" },
      { id: "megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj legalább 3 havi kaucióval és 2 hónapnyi megélhetéssel.", linkHref: "/tudasbazis", linkLabel: "Kiköltözési cikkek", linkIcon: "bookmark" },
      { id: "ch-permit", title: "Munkavállalási / tartózkodási engedély", description: "Nem EU/EFTA-állampolgárként a munkáltatód intézi a B-engedélyt (kvótás, hosszabb átfutás) — kezdd korán. EU/EFTA-soknak elég a helyi bejelentkezés.", tags: ["noneu"], linkHref: "/tudasbazis/vizum", linkLabel: "Engedély-varázsló", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "kreisburo", title: "Lakcím bejelentés (Kreisbüro)", description: "Az érkezéstől számított 14 napon belül.", linkHref: "/ugyintezes", linkLabel: "Hivatalos ügyek", linkIcon: "bookmark" },
      { id: "sim", title: "Svájci SIM kártya vásárlása", description: "Szinte mindenhez szükséged lesz egy svájci számra.", linkHref: "/szolgaltato-valto", linkLabel: "Szolgáltatók", linkIcon: "phone" },
      { id: "bank", title: "Bankszámlanyitás", description: "A fizetésed fogadásához elengedhetetlen.", linkHref: "/szolgaltato-valto", linkLabel: "Bankszámlák", linkIcon: "globe" },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "krankenkasse", title: "Betegbiztosítás (Krankenkasse)", description: "Kötelező megkötni 3 hónapon belül.", linkHref: "/szolgaltato-valto", linkLabel: "Krankenkasse", linkIcon: "heart" },
      { id: "lakas", title: "Albérlet keresés és Kaució", description: "Állandó lakás keresése — nézd meg a kinti magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "ado", title: "Adózás (Quellensteuer)", description: "Külföldiként forrásadót vonnak a fizetésedből.", linkHref: "/szaknevsor", linkLabel: "Könyvelők", linkIcon: "users" },
      { id: "ch-iskola", title: "Iskola / óvoda beíratás", description: "A gyerekeket a lakóhely szerinti köriskolába kell beíratni; az óvoda (Kita/Kindergarten) helyenként várólistás — intézd korán.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "ch-csaladi", title: "Családi pótlék (Familienzulagen)", description: "Gyerek után járó támogatás — a munkáltatón/kantonon keresztül igényelhető.", tags: ["family"] },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "kozosseg", title: "Magyar közösség megtalálása", description: "Keress magyar szervezeteket, egyesületeket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "nyelv", title: "Nyelvtanfolyam", description: "A beilleszkedés kulcsa a helyi nyelv.", linkHref: "/tudasbazis", linkLabel: "Nyelvtanulás", linkIcon: "magic" },
    ],
  },
];

/** Ausztria — osztrák valósághoz igazított roadmap (Meldezettel 3 nap, e-card automatikus, Lohnsteuer, Deutschkurs). */
export const PHASES_AT: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "at-cv", title: "Osztrák önéletrajz (Lebenslauf)", description: "Az osztrák munkáltatók fényképes, részletes Lebenslaufot várnak. Töltsd fel a CV-d az állás-profilodhoz.", linkHref: "/allasok/profil", linkLabel: "CV-profil", linkIcon: "user" },
      { id: "at-ber", title: "Bérszint tájékozódás", description: "Nézd meg a szakmád kollektív szerződés (Kollektivvertrag) szerinti minimálbérét, és a hirdetett béreket.", linkHref: "/allasok", linkLabel: "Állások", linkIcon: "briefcase" },
      { id: "at-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (jellemzően 3 havi bruttó lakbér), esetleg ingatlanos jutalékkal (Provision) és 2 hónap megélhetéssel.", linkHref: "/utalas", linkLabel: "Árfolyam", linkIcon: "trending" },
      { id: "at-permit", title: "Tartózkodási engedély (nem EU)", description: "Nem EU-állampolgárként Rot-Weiß-Rot Karte / Aufenthaltstitel kell — kezdd korán. EU-soknak elég a Meldezettel + Anmeldebescheinigung.", tags: ["noneu"], linkHref: "/tudasbazis/vizum", linkLabel: "Engedély-varázsló", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "at-meldezettel", title: "Lakcímbejelentés (Meldezettel)", description: "A beköltözéstől számított 3 NAPON BELÜL kötelező a Meldeamtban/Magistratban! (Szigorúbb, mint Svájcban.)" },
      { id: "at-sim", title: "Osztrák SIM kártya", description: "A1, Magenta vagy Drei — szükséged lesz osztrák számra a hivatali ügyekhez." },
      { id: "at-bank", title: "Bankszámlanyitás", description: "Erste Bank/Sparkasse, Bank Austria vagy BAWAG — a fizetésed fogadásához. A Meldezettel kelleni fog hozzá." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "at-ecard", title: "e-card / egészségbiztosítás", description: "A munkaviszonnyal AUTOMATIKUSAN biztosított leszel (ÖGK). Az e-card már csak FÉNYKÉPPEL készül — magyar állampolgárként a fotódat személyesen kell regisztráltatnod (chipkarte.at/foto), utána postán jön a kártya." },
      { id: "at-lakas", title: "Albérlet és bérleti szerződés", description: "Hauptmietvertrag, Kaution, esetleg Provision. Figyelj a Betriebskostenre (rezsi) a lakbéren felül — és nézd meg a kinti magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "at-ado", title: "Adózás (Lohnsteuer)", description: "A bérből automatikusan vonják a Lohnsteuert és a társadalombiztosítást. Év végén az Arbeitnehmerveranlagás (adóbevallás) gyakran visszatérítést hoz!", linkHref: "/szaknevsor", linkLabel: "Könyvelők", linkIcon: "users" },
      { id: "at-iskola", title: "Iskola / óvoda (Kindergarten)", description: "Gyerek beíratása a lakóhely szerinti iskolába/óvodába.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "at-familienbeihilfe", title: "Familienbeihilfe (családi pótlék)", description: "Gyerek után járó osztrák családi támogatás — a Finanzamtnál igényelhető (visszamenőleg is).", tags: ["family"], linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "at-kozosseg", title: "Magyar közösség megtalálása", description: "Keresd az osztrák magyar egyesületeket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "at-nyelv", title: "Németkurzus (Deutschkurs)", description: "ÖIF-elismert kurzus a beilleszkedéshez — és gyakorolj a Kinti Osztrák Német leckékkel.", linkHref: "/nyelvlecke", linkLabel: "Osztrák Német", linkIcon: "magic" },
    ],
  },
];

/** Németország — német valósághoz igazított roadmap (Anmeldung 14 nap, GKV-pénztár,
 *  Steuer-ID automatikus, Kindergeld, Deutschkurs). */
export const PHASES_DE: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "de-cv", title: "Német önéletrajz (Lebenslauf)", description: "A német munkáltatók tabellás, gyakran fényképes Lebenslaufot várnak. Töltsd fel a CV-d az állás-profilodhoz.", linkHref: "/allasok/profil", linkLabel: "CV-profil", linkIcon: "user" },
      { id: "de-ber", title: "Bérszint tájékozódás", description: "Nézd meg a szakmád szokásos bruttó éves bérét a célországban.", linkHref: "/iranytu", linkLabel: "Iránytű", linkIcon: "trending" },
      { id: "de-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (max 3 havi Kaltmiete), esetleg ingatlanos jutalékkal és 2-3 hónap megélhetéssel.", linkHref: "/piacter?tab=kalkulator", linkLabel: "Lakbér-kalkulátor", linkIcon: "bookmark" },
      { id: "de-permit", title: "Tartózkodási / munkavállalási engedély (nem EU)", description: "Nem EU-állampolgárként Aufenthaltstitel / munkavízum (pl. Blaue Karte EU) kell — kezdd korán. EU-soknak szabad mozgás (Freizügigkeit), nincs engedély.", tags: ["noneu"], linkHref: "/tudasbazis/vizum", linkLabel: "Engedély-varázsló", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "de-anmeldung", title: "Lakcímbejelentés (Anmeldung)", description: "A beköltözéstől 14 napon belül a Bürgeramtnál. Kell hozzá a Wohnungsgeberbestätigung (főbérlői igazolás). Időpontot foglalj korán!", linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
      { id: "de-sim", title: "Német SIM kártya", description: "Telekom, Vodafone, O2 vagy olcsóbb (Aldi Talk) — német szám kell a hivatali ügyekhez." },
      { id: "de-bank", title: "Bankszámla (Girokonto)", description: "Sparkasse, Commerzbank, DKB vagy online (N26, ING). Anmeldung + útlevél kell hozzá." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "de-krankenversicherung", title: "Egészségbiztosítás (Krankenkasse)", description: "Kötelező! Válassz törvényes pénztárat (TK, AOK, Barmer). A munkáltató bejelent, a járulékot a bérből vonják.", linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "heart" },
      { id: "de-steuerid", title: "Steuer-ID (adóazonosító)", description: "Az Anmeldung után automatikusan postán jön (~2-3 hét). A munkáltatódnak kell a bérszámfejtéshez." },
      { id: "de-lakas", title: "Állandó lakás és Mietvertrag", description: "Hosszú távú lakás keresése; figyelj a Nebenkostenre (rezsi) a Kaltmieten felül — és nézd meg a kinti magyarok albérlet-börzéjét is.", linkHref: "/piacter", linkLabel: "Albérlet-börze", linkIcon: "key" },
      { id: "de-iskola", title: "Kita / iskola beíratás", description: "Gyerek beíratása óvodába (Kita — gyakran várólistás, intézd korán) vagy iskolába a lakóhely szerint.", tags: ["family"], linkHref: "/tudasbazis/iskolarendszer", linkLabel: "Iskolarendszer", linkIcon: "bookmark" },
      { id: "de-kindergeld", title: "Kindergeld (családi pótlék)", description: "Havi 250 €/gyerek — a Familienkasse-nál igényelhető. Kell a szülő és a gyerek Steuer-ID-je.", tags: ["family"], linkHref: "/ugyintezes", linkLabel: "Ügyintézés", linkIcon: "bookmark" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "de-kozosseg", title: "Magyar közösség megtalálása", description: "Keresd a németországi magyar egyesületeket a Szaknévsorban.", linkHref: "/szaknevsor", linkLabel: "Szaknévsor", linkIcon: "list" },
      { id: "de-nyelv", title: "Németkurzus (Deutschkurs)", description: "Integrationskurs / VHS a beilleszkedéshez — és gyakorolj a Kinti Német (Hochdeutsch) leckékkel.", linkHref: "/nyelvlecke", linkLabel: "Német nyelvlecke", linkIcon: "magic" },
    ],
  },
];

/** A választott ország roadmapje (default CH). */
export function getPhases(country: string | null | undefined): RoadmapPhase[] {
  if (country === "AT") return PHASES_AT;
  if (country === "DE") return PHASES_DE;
  return PHASES_CH;
}

export const TASK_DEADLINES: Record<string, { days: number; hard?: boolean }> = {
  // CH
  cv: { days: -60 },
  ber: { days: -60 },
  megtakaritas: { days: -45 },
  kreisburo: { days: 14, hard: true },
  sim: { days: 7 },
  bank: { days: 7 },
  krankenkasse: { days: 90, hard: true },
  lakas: { days: 30 },
  ado: { days: 60 },
  kozosseg: { days: 90 },
  nyelv: { days: 120 },
  // AT
  "at-cv": { days: -60 },
  "at-ber": { days: -60 },
  "at-megtakaritas": { days: -45 },
  "at-meldezettel": { days: 3, hard: true },
  "at-sim": { days: 7 },
  "at-bank": { days: 7 },
  "at-ecard": { days: 30 },
  "at-lakas": { days: 30 },
  "at-ado": { days: 60 },
  "at-kozosseg": { days: 90 },
  "at-nyelv": { days: 120 },
  // CH/AT feltételes
  "ch-permit": { days: -90 }, "ch-iskola": { days: 30 }, "ch-csaladi": { days: 60 },
  "at-permit": { days: -90 }, "at-iskola": { days: 30 }, "at-familienbeihilfe": { days: 60 },
  // DE
  "de-cv": { days: -60 }, "de-ber": { days: -60 }, "de-megtakaritas": { days: -45 }, "de-permit": { days: -90 },
  "de-anmeldung": { days: 14, hard: true }, "de-sim": { days: 7 }, "de-bank": { days: 7 },
  "de-krankenversicherung": { days: 14, hard: true }, "de-steuerid": { days: 21 }, "de-lakas": { days: 30 },
  "de-iskola": { days: 30 }, "de-kindergeld": { days: 60 }, "de-kozosseg": { days: 90 }, "de-nyelv": { days: 120 },
};

export function parseYMD(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function startOfDay(d: Date): number {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r.getTime();
}

export function daysFromToday(target: Date): number {
  return Math.round((startOfDay(target) - startOfDay(new Date())) / 86_400_000);
}

export function taskDeadline(taskId: string, moveDateObj: Date | null): { date: Date; days: number; hard: boolean } | null {
  const def = TASK_DEADLINES[taskId];
  if (!def || !moveDateObj) return null;
  const date = new Date(moveDateObj);
  date.setDate(date.getDate() + def.days);
  return { date, days: daysFromToday(date), hard: !!def.hard };
}

/**
 * Természetes nyelvű címke a költözés dátumához KÉPESTI eltolásra (idővonal-nézet).
 * A nyers T-eltolás (TASK_DEADLINES[id].days) → olvasható magyar mondat.
 * Szándékosan NEM „T-30" jelölés (érthetőség a szintaxis-tipp helyett).
 */
export function moveOffsetLabel(offsetDays: number): string {
  if (offsetDays === 0) return "A költözés napján";
  if (offsetDays < 0) return `${Math.abs(offsetDays)} nappal a költözés előtt`;
  return `${offsetDays} nappal a költözés után`;
}

/** Az idővonal-nézet szakaszába sorolás a költözéshez képesti eltolás alapján. */
export function moveBucket(offsetDays: number): { id: string; title: string } {
  if (offsetDays < 0) return { id: "before", title: "A költözés előtt" };
  if (offsetDays <= 7) return { id: "arrival", title: "Az érkezés hete" };
  if (offsetDays <= 30) return { id: "first-month", title: "Az első hónap" };
  if (offsetDays <= 90) return { id: "settle", title: "1–3 hónap" };
  return { id: "later", title: "Később" };
}

export function relLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} napja lejárt`;
  if (days === 0) return "ma esedékes";
  if (days === 1) return "holnap";
  if (days < 14) return `${days} nap múlva`;
  if (days < 60) return `${Math.round(days / 7)} hét múlva`;
  return `${Math.round(days / 30)} hónap múlva`;
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}
