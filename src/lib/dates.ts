/**
 * dates.ts — SQLite-dátumok BIZTONSÁGOS értelmezése.
 *
 * Az SQLite a `datetime('now')`-ot UTC-ben, „YYYY-MM-DD HH:MM:SS" formátumban
 * tárolja — Z (zóna) NÉLKÜL. A `new Date("2026-06-29 23:13:48")` ezt a SZERVER
 * helyi zónája szerint olvasná → a relatív idő ("2 órája") elcsúszik a zóna-
 * eltolással. Ezért a szóközös, zóna nélküli formátumot explicit UTC-ként
 * értelmezzük. A már ISO-formátumú (Z-vel/eltolással) értékeket érintetlenül hagyjuk.
 */
export function parseDbDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  let s = value.trim();
  if (!s) return null;
  // „YYYY-MM-DD HH:MM:SS" → „YYYY-MM-DDTHH:MM:SS"
  if (s.includes(" ") && !s.includes("T")) s = s.replace(" ", "T");
  // Nincs zóna-jelölés (Z vagy ±hh:mm) → UTC-nek vesszük.
  if (!/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) s += "Z";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** SQLite/ISO dátum → „YYYY-MM-DD" (UTC szerinti dátum-rész), vagy üres string. */
export function dbDateOnly(value: string | null | undefined): string {
  const d = parseDbDate(value);
  return d ? d.toISOString().slice(0, 10) : "";
}
