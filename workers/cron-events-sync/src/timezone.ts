/**
 * Időzóna-segédek a Workers edge runtime-ban (csak Intl-re támaszkodva,
 * tzdata behúzása nélkül).
 *
 * A trükk: az `Intl.DateTimeFormat({timeZone})` adott UTC-pillanat helyi
 * formázását adja vissza. Ebből kiszámolható a TZ adott pillanat-béli
 * eltolása UTC-hez képest (CET +60, CEST +120). Ezzel egy „helyi" időt
 * (pl. „2026-11-14 19:00 Europe/Zurich") át tudunk fordítani UTC-re egy
 * iterációval — DST-átállás éjszakáin a „fold" ambig pillanatokat
 * konzisztensen, az UTC-vetítés szerint kezeljük.
 */

/**
 * Hány perccel jár előtte a `tz` helyi ideje az UTC-nek `date` UTC-pillanatban?
 * Pl. Europe/Zurich → 60 (CET) vagy 120 (CEST). Negative → mögötte (nincs Zürichben).
 */
export function tzOffsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value]),
  );
  const localAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((localAsUtc - date.getTime()) / 60000);
}

/**
 * Egy helyi (TZ-szerinti) dátum/idő → UTC Date. DST-érzékeny.
 * Pl. `zonedLocalToUtc(2026, 6, 15, 19, 0, 0, "Europe/Zurich")` → UTC 17:00.
 */
export function zonedLocalToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  second: number,
  tz: string,
): Date {
  // Első közelítés: a helyi időt UTC-ként kezeljük (mintha offset=0 lenne).
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  // Az igazi UTC ettől OFFSET perccel hátrébb van.
  const offset = tzOffsetMinutes(guess, tz);
  return new Date(guess.getTime() - offset * 60_000);
}
