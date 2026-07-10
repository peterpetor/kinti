/**
 * relative-time.ts — KÖZÖS magyar relatív-idő formázó.
 *
 * A kódbázisban korábban 7 párhuzamos, apró eltérésekkel duplikált helper élt
 * (fmtAgo ×5 az adminban, getRelativeTime a profilban, fmtAgo a keresek-view-ban)
 * — új kód EZT használja, a régiek fokozatosan állnak át.
 */

/** Relatív idő epoch-ms-ből, röviden: „most", „5 perce", „3 órája", „2 napja", „1 hónapja". */
export function relTimeFromMs(ms: number): string {
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return "most";
  if (min < 60) return `${min} perce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} órája`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} napja`;
  return `${Math.floor(d / 30)} hónapja`;
}

/**
 * Relatív idő SQLite-stílusú ISO-ból ("YYYY-MM-DD HH:MM:SS", UTC-nek értelmezve
 * — a D1 datetime('now') formátuma). Érvénytelen/None → "nemrég".
 */
export function relTimeFromIso(iso: string | null | undefined): string {
  if (!iso) return "nemrég";
  const normalized = iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`;
  const t = new Date(normalized).getTime();
  if (Number.isNaN(t)) return "nemrég";
  return relTimeFromMs(t);
}
