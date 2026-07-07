/**
 * review-prompt.ts — a hívás-utáni vélemény-kérő hurok kliens-oldali logikája.
 *
 * A szaknévsor legnagyobb hitelesség-hiánya, hogy a cégek zöme értékelés
 * nélküli („Új"). A meglévő vélemény-nudge EMAIL csak az ajánlatkérés-útra
 * megy (review-nudge.ts, 3 nap) — a jóval gyakoribb HÍVÁS-út után viszont
 * semmi nem kér értékelést, és email-cím híján nem is lehetne. Ezt zárja ez
 * a hurok: a „Hívás" gomb koppintását kliens-oldalon naplózzuk (localStorage,
 * a [[privacy-no-server-identity]] elv szerint SEMMI nem megy szerverre), és
 * a KÖVETKEZŐ látogatáskor — ha a hívás óta eltelt pár óra — egy finom kártya
 * kérdezi meg: „Milyen volt? Értékeld." → a meglévő ?ertekeles=1#ertekeles
 * mélylinkre visz (a vélemény-nudge email is ezt használja).
 *
 * A döntési logika környezet-független (tiszta függvények) → unit-tesztelhető;
 * a localStorage-olvasás/írás külön, védett helper-ekben él.
 */

export interface CallEntry {
  /** businesses.id */
  id: string;
  /** A cég neve a kártya-szöveghez (a naplózáskor ismert érték). */
  name: string;
  /** A hívás-koppintás időbélyege (ms). */
  ts: number;
}

const CALLS_KEY = "kinti.reviewPrompt.calls";
const DISMISSED_KEY = "kinti.reviewPrompt.dismissed";
const MAX_CALLS = 5;
const MAX_DISMISSED = 30;

/** Ennyi idő teljen el a hívás után, mielőtt kérdezünk (a munka jellemzően nem azonnali). */
export const PROMPT_MIN_AGE_MS = 2 * 60 * 60 * 1000; // 2 óra
/** Ennél régebbi hívásról már nem kérdezünk (halott emlék). */
export const PROMPT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 nap

/**
 * A megkérdezendő hívás kiválasztása — TISZTA függvény.
 * Szabályok: a [2 óra … 14 nap] ablakban lévő, még el-nem-utasított hívások
 * közül a LEGFRISSEBB. Nincs jelölt → null.
 */
export function pickReviewPrompt(
  calls: CallEntry[],
  dismissedIds: string[],
  now: number,
): CallEntry | null {
  const dismissed = new Set(dismissedIds);
  let best: CallEntry | null = null;
  for (const c of calls) {
    if (!c || typeof c.id !== "string" || typeof c.ts !== "number") continue;
    if (dismissed.has(c.id)) continue;
    const age = now - c.ts;
    if (age < PROMPT_MIN_AGE_MS || age > PROMPT_MAX_AGE_MS) continue;
    if (!best || c.ts > best.ts) best = c;
  }
  return best;
}

// --- localStorage réteg (böngésző-oldal, hibára néma) ------------------------

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function readCalls(): CallEntry[] {
  return readJson<CallEntry[]>(CALLS_KEY, []);
}

export function readDismissed(): string[] {
  return readJson<string[]>(DISMISSED_KEY, []);
}

/**
 * Hívás-koppintás naplózása (a TelLink hívja). Cégenként a legutóbbi időbélyeg
 * él (dedup id-re), a napló rövid (max 5) és a 14 napnál öregebb sorok kihullanak.
 */
export function recordCallForReview(id: string, name: string): void {
  try {
    const now = Date.now();
    const next: CallEntry[] = [
      { id, name, ts: now },
      ...readCalls().filter((c) => c && c.id !== id && now - c.ts <= PROMPT_MAX_AGE_MS),
    ].slice(0, MAX_CALLS);
    localStorage.setItem(CALLS_KEY, JSON.stringify(next));
  } catch {
    /* private mode → a hurok egyszerűen nem működik */
  }
}

/** Egy cég vélemény-kérőjének végleges elrejtése (X vagy a CTA megnyomása után). */
export function dismissReviewPrompt(id: string): void {
  try {
    const next = [id, ...readDismissed().filter((d) => d !== id)].slice(0, MAX_DISMISSED);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
