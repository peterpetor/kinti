/**
 * Svájci (Europe/Zurich) helyi idő → UTC konverzió, külső TZ-könyvtár nélkül.
 *
 * Svájc az EU nyári-időszámítást követi: CET (UTC+1) télen, CEST (UTC+2) nyáron.
 * Az átállás a március utolsó vasárnapja 01:00 UTC és október utolsó vasárnapja
 * 01:00 UTC között van. Ez egy reminder-időpont kiszámításához bőven elég pontos.
 */

/** Az Europe/Zurich UTC-eltolása percben (CET=60, CEST=120) egy adott UTC-pillanatra. */
export function zurichOffsetMinutes(utc: Date): number {
  const year = utc.getUTCFullYear();
  // Egy hónap utolsó vasárnapjának 01:00 UTC pillanata. month: 0-alapú.
  const lastSunday01Utc = (month: number): number => {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)); // a hónap utolsó napja
    const date = lastDay.getUTCDate() - lastDay.getUTCDay(); // visszalépés vasárnapra
    return Date.UTC(year, month, date, 1, 0, 0);
  };
  const dstStart = lastSunday01Utc(2); // március
  const dstEnd = lastSunday01Utc(9); // október
  const t = utc.getTime();
  return t >= dstStart && t < dstEnd ? 120 : 60;
}

/**
 * Egy svájci helyi fal-óra ("YYYY-MM-DD" + "HH:MM") UTC `Date`-té alakítása.
 * Érvénytelen dátumnál `null`. Hiányzó időnél a megadott `defaultTime`-ot veszi.
 */
export function swissLocalToUtc(
  dateStr: string | null,
  timeStr: string | null,
  defaultTime = "19:00",
): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const [hh, mm] = (timeStr || defaultTime).split(":").map((n) => parseInt(n, 10));
  const hour = Number.isFinite(hh) ? hh : 19;
  const minute = Number.isFinite(mm) ? mm : 0;
  // Naiv UTC a fal-órából, majd levonjuk a tényleges svájci eltolást.
  const naiveUtc = new Date(Date.UTC(y, m - 1, d, hour, minute));
  const offset = zurichOffsetMinutes(naiveUtc);
  return new Date(naiveUtc.getTime() - offset * 60_000);
}
