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

export const PHASES: RoadmapPhase[] = [
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

export const TASK_DEADLINES: Record<string, { days: number; hard?: boolean }> = {
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
