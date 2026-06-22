import type { IconName } from "@/components/ui/icons";

export type RoadmapTask = {
  id: string;
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
  linkIcon?: IconName;
};

export type RoadmapPhase = {
  id: string;
  title: string;
  icon: IconName;
  tasks: RoadmapTask[];
};

export const PHASES_CH: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Tervezés (-3 hónap)",
    icon: "map",
    tasks: [
      { id: "cv", title: "Svájci önéletrajz (CV) elkészítése", description: "A svájci munkáltatók specifikus formátumot várnak el.", linkHref: "/tudasbazis", linkLabel: "Tudásbázis", linkIcon: "bookmark" },
      { id: "ber", title: "Bérszint ellenőrzése", description: "Nézd meg a célkantonod átlagos fizetéseit.", linkHref: "/iranytu", linkLabel: "Bérkalkulátor", linkIcon: "trending" },
      { id: "megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj legalább 3 havi kaucióval és 2 hónapnyi megélhetéssel.", linkHref: "/tudasbazis", linkLabel: "Kiköltözési cikkek", linkIcon: "bookmark" },
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
      { id: "lakas", title: "Albérlet keresés és Kaució", description: "Állandó lakás keresése.", linkHref: "/tudasbazis", linkLabel: "Tudásbázis: Albérlet", linkIcon: "bookmark" },
      { id: "ado", title: "Adózás (Quellensteuer)", description: "Külföldiként forrásadót vonnak a fizetésedből.", linkHref: "/szaknevsor", linkLabel: "Könyvelők", linkIcon: "users" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "kozosseg", title: "Magyar közösség megtalálása", description: "Csatlakozz eseményekhez.", linkHref: "/kozosseg", linkLabel: "Közösség", linkIcon: "users" },
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
      { id: "at-megtakaritas", title: "Megtakarítás kalkuláció", description: "Számolj kaucióval (jellemzően 3 havi bruttó lakbér), esetleg ingatlanos jutalékkal (Provision) és 2 hónap megélhetéssel.", linkHref: "/arfolyam", linkLabel: "Árfolyam", linkIcon: "trending" },
    ],
  },
  {
    id: "phase-2",
    title: "Érkezés (1. hét)",
    icon: "flag",
    tasks: [
      { id: "at-meldezettel", title: "Lakcímbejelentés (Meldezettel)", description: "A beköltözéstől számított 3 NAPON BELÜL kötelező a Meldeamtban/Magistratban! (Szigorúbb, mint Svájcban.)" },
      { id: "at-sim", title: "Osztrák SIM kártya", description: "A1, Magenta vagy Drei — szükséged lesz osztrák számra a hivatali ügyekhez." },
      { id: "at-bank", title: "Bankszámlanyitás", description: "Erste, Bank Austria vagy BAWAG — a fizetésed fogadásához. A Meldezettel kelleni fog hozzá." },
    ],
  },
  {
    id: "phase-3",
    title: "Berendezkedés (1. hónap)",
    icon: "home",
    tasks: [
      { id: "at-ecard", title: "e-card / egészségbiztosítás", description: "A munkaviszonnyal AUTOMATIKUSAN biztosított leszel (ÖGK); az e-card postán érkezik. Itt NEM kell pénztárt választani, mint Svájcban." },
      { id: "at-lakas", title: "Albérlet és bérleti szerződés", description: "Hauptmietvertrag, Kaution, esetleg Provision. Figyelj a Betriebskostenre (rezsi) a lakbéren felül.", linkHref: "/szaknevsor", linkLabel: "Szakemberek", linkIcon: "users" },
      { id: "at-ado", title: "Adózás (Lohnsteuer)", description: "A bérből automatikusan vonják a Lohnsteuert és a társadalombiztosítást. Év végén az Arbeitnehmerveranlagás (adóbevallás) gyakran visszatérítést hoz!", linkHref: "/szaknevsor", linkLabel: "Könyvelők", linkIcon: "users" },
    ],
  },
  {
    id: "phase-4",
    title: "Integráció (3-6 hónap)",
    icon: "users",
    tasks: [
      { id: "at-kozosseg", title: "Magyar közösség megtalálása", description: "Csatlakozz osztrák magyar egyesületekhez, eseményekhez.", linkHref: "/kozosseg", linkLabel: "Közösség", linkIcon: "users" },
      { id: "at-nyelv", title: "Németkurzus (Deutschkurs)", description: "ÖIF-elismert kurzus a beilleszkedéshez — és gyakorolj a Kinti Osztrák Német leckékkel.", linkHref: "/nyelvlecke", linkLabel: "Osztrák Német", linkIcon: "magic" },
    ],
  },
];

/** A választott ország roadmapje (default CH). */
export function getPhases(country: string | null | undefined): RoadmapPhase[] {
  return country === "AT" ? PHASES_AT : PHASES_CH;
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
