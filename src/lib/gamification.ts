/**
 * Kliensoldali gamifikáció — privacy-by-design.
 *
 * NINCS szerver-oldali adat és NINCS per-user azonosító: a szint, az XP és a
 * kitűzők kizárólag a böngésző localStorage-jában tárolt saját posztokból
 * ([[my-posts]]) számolódnak, futásidőben. A szerver semmit nem tud a
 * felhasználó "eredményeiről" — ugyanaz a GDPR-minta, mint a manage-tokeneknél.
 *
 * Következmény: az eredmények eszközhöz kötöttek és törölhetők (cache-ürítés,
 * másik eszköz). Ezt a UX-ben vállaljuk — ez "soft", személyes gamifikáció,
 * nem szerver-hitelesített ranglista.
 */

import type { MyPostEntry, PostType } from "./my-posts";

/** Egy adott típusú saját poszt mennyi XP-t ér. */
const XP_BY_TYPE: Record<PostType, number> = {
  business: 50, // vállalkozás regisztrálása — a legnagyobb hozzájárulás
  review: 20, // vélemény írása
  event: 10, // esemény szervezése
};

/** Egy kitűző mércéje: poszt-számláló, összpont, streak, kvíz, kedvencek stb. */
export type BadgeMetric =
  | "total" | "review" | "event" | "business" | "points"
  | "streak" | "quizPerfect" | "quizDays" | "appInstalled" | "favorites" | "referrals";

export interface BadgeDef {
  id: string;
  label: string;
  icon: string;
  /** Hány elem kell a megszerzéshez (a `countOf` mérce szerint). */
  threshold: number;
  /** Melyik mérce alapján mérünk. */
  countOf: BadgeMetric;
  /** Ritka/különleges kitűző — kiemelt megjelenítés. */
  rare?: boolean;
}

/** Poszton túli jelek a kitűzőkhöz (mind kliensoldali localStorage / PWA). */
export interface GamificationExtras {
  /** Leghosszabb napi belépési sorozat (lib/streak). */
  streakLongest?: number;
  /** Valaha elért legjobb napi kvíz-eredmény (0-3). */
  quizBest?: number;
  /** Hány napon játszott kvízt. */
  quizDays?: number;
  /** Telepítve van-e PWA-ként (standalone). */
  appInstalled?: boolean;
  /** Mentett kedvenc vállalkozások száma. */
  favorites?: number;
  /** Hány magyart hívtál be (a meghívó-kódod szerver-oldali, anonim konverziószáma). */
  referrals?: number;
}

/** A kitűzők definíciói. A sorrend a megjelenítési sorrend is. */
export const BADGES: BadgeDef[] = [
  // Közösségi hozzájárulás
  { id: "early_adopter", label: "Úttörő", icon: "🚀", threshold: 1, countOf: "total" },
  { id: "first_voice", label: "Első szó", icon: "⭐", threshold: 1, countOf: "review" },
  { id: "host", label: "Házigazda", icon: "📅", threshold: 1, countOf: "event" },
  { id: "entrepreneur", label: "Vállalkozó", icon: "🏪", threshold: 1, countOf: "business" },
  { id: "event_master", label: "Programszervező", icon: "🎉", threshold: 5, countOf: "event" },
  { id: "business_booster", label: "Cégépítő", icon: "🏗️", threshold: 3, countOf: "business" },
  { id: "pro_reviewer", label: "Profi véleményező", icon: "🏆", threshold: 5, countOf: "review" },
  { id: "super_contributor", label: "Oszlop", icon: "💎", threshold: 10, countOf: "total" },
  { id: "critic", label: "Kritikus", icon: "📝", threshold: 15, countOf: "review", rare: true },
  { id: "veteran", label: "Veterán", icon: "🎖️", threshold: 25, countOf: "total", rare: true },
  // Napi sorozat (streak)
  { id: "streak_3", label: "Lendületben", icon: "🔥", threshold: 3, countOf: "streak" },
  { id: "streak_7", label: "Heti hős", icon: "🗓️", threshold: 7, countOf: "streak" },
  { id: "streak_30", label: "Hűséges", icon: "💞", threshold: 30, countOf: "streak", rare: true },
  // Kvíz
  { id: "quiz_first", label: "Kvíz-újonc", icon: "🧠", threshold: 1, countOf: "quizDays" },
  { id: "quiz_perfect", label: "Telitalálat", icon: "🎯", threshold: 1, countOf: "quizPerfect" },
  { id: "quiz_master", label: "Kvíz-mester", icon: "🦉", threshold: 30, countOf: "quizDays", rare: true },
  // Elköteleződés
  { id: "installed", label: "Bennfentes", icon: "📲", threshold: 1, countOf: "appInstalled" },
  { id: "collector", label: "Gyűjtögető", icon: "💛", threshold: 5, countOf: "favorites" },
  { id: "curator", label: "Kurátor", icon: "📌", threshold: 15, countOf: "favorites", rare: true },
  { id: "xp_champ", label: "XP-bajnok", icon: "👑", threshold: 500, countOf: "points", rare: true },
  // Referral — „Küldj egy magyart" (a legpresztízsesebb: társas, ritka)
  { id: "referrer", label: "Küldtem egy magyart", icon: "🤝", threshold: 1, countOf: "referrals", rare: true },
  { id: "connector", label: "Összekötő", icon: "🧲", threshold: 3, countOf: "referrals", rare: true },
  { id: "ambassador", label: "Nagykövet", icon: "🎗️", threshold: 5, countOf: "referrals", rare: true },
];

export interface BadgeState extends BadgeDef {
  earned: boolean;
  /** Jelenlegi állapot a küszöbhöz (megszerzetlennél a haladáshoz). */
  progress: number;
}

export interface GamificationStats {
  points: number;
  level: number;
  /** A jelenlegi szint kezdő-küszöbe (összpont). */
  levelBase: number;
  /** A következő szint küszöbe (összpont). */
  nextLevelAt: number;
  /** 0..1 haladás a jelenlegi szinten belül a következő felé. */
  levelProgress: number;
  countsByType: Record<PostType, number>;
  total: number;
  badges: BadgeState[];
  earnedBadgeCount: number;
}

/**
 * Az `L` szint eléréséhez szükséges összpontszám.
 * L=1 → 0, L=2 → 60, L=3 → 140, L=4 → 240 …
 * Képlet: (L-1)*50 + (L-1)^2*10.
 */
export function levelThreshold(level: number): number {
  const n = Math.max(0, level - 1);
  return n * 50 + n * n * 10;
}

/** Hány pontból hányadik szinten áll a felhasználó. */
export function calculateLevel(points: number): number {
  let level = 1;
  while (points >= levelThreshold(level + 1)) {
    level++;
  }
  return level;
}

/** Egy kitűző-mérce aktuális értéke a kontextusból. */
function metricValue(
  metric: BadgeMetric,
  ctx: { countsByType: Record<PostType, number>; total: number; points: number; extras: GamificationExtras },
): number {
  switch (metric) {
    case "total": return ctx.total;
    case "review":
    case "event":
    case "business": return ctx.countsByType[metric];
    case "points": return ctx.points;
    case "streak": return ctx.extras.streakLongest ?? 0;
    case "quizPerfect": return (ctx.extras.quizBest ?? 0) >= 3 ? 1 : 0;
    case "quizDays": return ctx.extras.quizDays ?? 0;
    case "appInstalled": return ctx.extras.appInstalled ? 1 : 0;
    case "favorites": return ctx.extras.favorites ?? 0;
    case "referrals": return ctx.extras.referrals ?? 0;
  }
}

/**
 * A teljes statisztika kiszámítása a saját posztok listájából.
 * `bonusXp` (opcionális): külső, monoton XP-forrás (pl. napi streak — lib/streak),
 * ami beleszámít a pontba/szintbe, de nem poszt-alapú.
 * `extras` (opcionális): poszton túli jelek a kitűzőkhöz (streak, kvíz, PWA, kedvencek).
 */
export function computeGamification(
  posts: MyPostEntry[],
  bonusXp = 0,
  extras: GamificationExtras = {},
): GamificationStats {
  const countsByType: Record<PostType, number> = { event: 0, review: 0, business: 0 };
  let points = Math.max(0, Math.round(bonusXp));
  for (const p of posts) {
    if (p.type in countsByType) {
      countsByType[p.type]++;
      points += XP_BY_TYPE[p.type];
    }
  }
  const total = posts.length;

  const level = calculateLevel(points);
  const levelBase = levelThreshold(level);
  const nextLevelAt = levelThreshold(level + 1);
  const span = nextLevelAt - levelBase;
  const levelProgress = span > 0 ? Math.min(1, Math.max(0, (points - levelBase) / span)) : 1;

  const ctx = { countsByType, total, points, extras };
  const badges: BadgeState[] = BADGES.map((b) => {
    const current = metricValue(b.countOf, ctx);
    return {
      ...b,
      earned: current >= b.threshold,
      progress: Math.min(1, current / b.threshold),
    };
  });

  return {
    points,
    level,
    levelBase,
    nextLevelAt,
    levelProgress,
    countsByType,
    total,
    badges,
    earnedBadgeCount: badges.filter((b) => b.earned).length,
  };
}

export interface GamificationGain {
  /** Mennyi XP-vel nőtt a pontszám (≤0, ha nem változott — pl. duplikált beküldés). */
  xpGained: number;
  /** Lépett-e szintet. */
  leveledUp: boolean;
  /** Az új (aktuális) szint. */
  newLevel: number;
  /** A most feloldott kitűzők (amik korábban nem voltak meg). */
  unlockedBadges: BadgeState[];
}

/**
 * Két állapot különbsége — a beküldés utáni pozitív visszajelzéshez
 * ("+20 XP, Úttörő kitűző feloldva!"). Duplikált beküldésnél xpGained = 0.
 */
export function gamificationGain(before: GamificationStats, after: GamificationStats): GamificationGain {
  const beforeEarned = new Set(before.badges.filter((b) => b.earned).map((b) => b.id));
  return {
    xpGained: after.points - before.points,
    leveledUp: after.level > before.level,
    newLevel: after.level,
    unlockedBadges: after.badges.filter((b) => b.earned && !beforeEarned.has(b.id)),
  };
}
