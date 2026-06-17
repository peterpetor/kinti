/**
 * streak.ts — napi belépési sorozat (streak) + bónusz XP. Kliensoldali
 * (localStorage), a privacy-modellnek megfelelően (nincs szerver-tracking).
 *
 * Minden új naptári napon, amikor a felhasználó megnyitja az appot, +DAILY_XP-t
 * kap; ha az előző nap is belépett, a sorozat nő, és mérföldköveknél bónusz jár.
 * Az `xpEarned` MONOTON (sorozat-megszakadáskor sem csökken), így a gamification
 * összpontszáma sosem esik vissza.
 */
const KEY = "kinti.streak";

export const DAILY_XP = 5;
/** Sorozat-mérföldkövek → egyszeri bónusz XP az adott napon. */
export const STREAK_MILESTONES: Record<number, number> = {
  3: 15,
  7: 40,
  14: 80,
  30: 200,
  100: 500,
};

export interface StreakState {
  /** Aktuális sorozat (egymást követő napok). */
  current: number;
  /** Valaha elért leghosszabb sorozat. */
  longest: number;
  /** Utolsó beszámított nap (YYYY-MM-DD, helyi idő). */
  lastDate: string;
  /** Monoton gyűjtött streak-XP (sosem csökken). */
  xpEarned: number;
}

export interface VisitResult {
  state: StreakState;
  /** Most kapott XP (0, ha ma már beszámítottuk). */
  awardedXp: number;
  /** Ebből a mérföldkő-bónusz (0, ha nem volt). */
  milestoneBonus: number;
  /** Nőtt-e ma a sorozat (új nap). */
  incremented: boolean;
}

const EMPTY: StreakState = { current: 0, longest: 0, lastDate: "", xpEarned: 0 };

export function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prevDateStr(today: string): string {
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return dateStr(dt);
}

/**
 * Tiszta (tesztelhető) sorozat-léptetés. Ugyanaznapi ismételt hívás → nincs
 * változás; tegnaphoz kapcsolódva → +1 sorozat; egyébként → újraindul 1-ről.
 */
export function advanceStreak(prev: StreakState, today: string): VisitResult {
  if (prev.lastDate === today) {
    return { state: prev, awardedXp: 0, milestoneBonus: 0, incremented: false };
  }
  const continuing = prev.lastDate === prevDateStr(today);
  const current = continuing ? prev.current + 1 : 1;
  const milestoneBonus = STREAK_MILESTONES[current] ?? 0;
  const awardedXp = DAILY_XP + milestoneBonus;
  const next: StreakState = {
    current,
    longest: Math.max(prev.longest, current),
    lastDate: today,
    xpEarned: prev.xpEarned + awardedXp,
  };
  return { state: next, awardedXp, milestoneBonus, incremented: true };
}

function read(): StreakState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<StreakState>;
    return {
      current: Number(p.current) || 0,
      longest: Number(p.longest) || 0,
      lastDate: typeof p.lastDate === "string" ? p.lastDate : "",
      xpEarned: Number(p.xpEarned) || 0,
    };
  } catch {
    return EMPTY;
  }
}

/** Aktuális állapot olvasása (mutáció nélkül). */
export function getStreak(): StreakState {
  return read();
}

/** A gamification-be folyó monoton streak-XP. */
export function streakXp(): number {
  return read().xpEarned;
}

/** Napi belépés beszámítása (app-megnyitáskor, naponta egyszer számít). */
export function recordVisit(): VisitResult {
  const result = advanceStreak(read(), dateStr(new Date()));
  if (result.incremented && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(result.state));
    } catch {
      /* tárhely tele / tiltott — figyelmen kívül hagyjuk */
    }
  }
  return result;
}
