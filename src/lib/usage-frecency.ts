/**
 * Helyi (privacy-first) használat-számláló a „Gyakran használt" felületekhez.
 *
 * localStorage-ban él, szerverre SOSEM megy — user-szintű személyre szabás
 * kizárólag kliensoldalon történhet (nincs szerveroldali per-user azonosító).
 * Azonosítóként a cél-útvonal (href) szolgál, így a menü és a kezdőlapi
 * modul-rács ugyanabba a számlálóba írnak.
 *
 * Pontozás: használat-szám × frissesség-súly (30 naponta feleződik) — aki
 * fél éve nyomkodta a kvízt, de ma már csak a bérkalkulátort nyitja, annál
 * a friss szokás nyer.
 */

const KEY = "kinti.usage.v1";
const MAX_ENTRIES = 60;
const HALF_LIFE_MS = 30 * 24 * 60 * 60 * 1000;

interface UsageEntry {
  /** Használatok száma. */
  c: number;
  /** Utolsó használat (epoch ms). */
  t: number;
}

type UsageMap = Record<string, UsageEntry>;

function read(): UsageMap {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const out: UsageMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        typeof v === "object" && v !== null &&
        typeof (v as UsageEntry).c === "number" &&
        typeof (v as UsageEntry).t === "number"
      ) {
        out[k] = { c: (v as UsageEntry).c, t: (v as UsageEntry).t };
      }
    }
    return out;
  } catch {
    return {};
  }
}

function write(map: UsageMap): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* privát mód / betelt tároló — a számláló ilyenkor egyszerűen nem tanul */
  }
}

/** Egy használat rögzítése (pl. menüpont- vagy csempe-kattintás). */
export function recordUse(id: string, now = Date.now()): void {
  if (!id) return;
  const map = read();
  const prev = map[id];
  map[id] = { c: (prev?.c ?? 0) + 1, t: now };
  // Kordában tartás: ha túl sok kulcs gyűlt fel, a leggyengébb pontszámúak esnek ki.
  const keys = Object.keys(map);
  if (keys.length > MAX_ENTRIES) {
    keys
      .sort((a, b) => score(map[a], now) - score(map[b], now))
      .slice(0, keys.length - MAX_ENTRIES)
      .forEach((k) => delete map[k]);
  }
  write(map);
}

function score(e: UsageEntry, now: number): number {
  const age = Math.max(0, now - e.t);
  return e.c * Math.pow(0.5, age / HALF_LIFE_MS);
}

/**
 * A legtöbbet használt azonosítók, pontszám szerint csökkenő sorrendben.
 * `minCount`: az egyszeri, véletlen kattintás még nem „szokás" — alapból
 * legalább 2 használat kell a megjelenéshez.
 */
export function getTopUsed(limit: number, minCount = 2, now = Date.now()): string[] {
  const map = read();
  return Object.entries(map)
    .filter(([, e]) => e.c >= minCount)
    .sort(([, a], [, b]) => score(b, now) - score(a, now))
    .slice(0, limit)
    .map(([k]) => k);
}
