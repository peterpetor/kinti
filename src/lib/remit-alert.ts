/**
 * remit-alert.ts — az „árfolyam-riasztás" (hazautalás) TISZTA logikája.
 *
 * A push CSAK a FRISS „fölfelé keresztezés" napján megy ki: ma a 30-napos átlag
 * + küszöb FÖLÖTT vagyunk, TEGNAP még nem. Ez két dolgot ad ingyen:
 *   • nincs szükség állapot-tárolásra (nincs „last_sent" tábla/KV),
 *   • nem spamel: amíg az árfolyam tartósan magas marad, NEM küld újra —
 *     csak akkor, ha visszaesik és újra átlépi a szintet.
 *
 * Szándékosan tiszta függvények (nincs fetch/DB) → unit-tesztelhető; a
 * hálózat + a push-kiküldés a cronban van.
 */

/** Egy napi pont a frankfurter idősorból (CHF-bázisú lekérés). */
export interface RatePoint {
  date: string;
  /** 1 CHF = huf Ft */
  huf: number;
  /** 1 CHF = eur EUR */
  eur: number;
}

export interface CrossingResult {
  /** Ma lépte át FELFELÉ a küszöböt (tegnap még alatta volt). */
  crossed: boolean;
  /** Mai árfolyam (bázis → HUF). */
  today: number;
  /** Az ablak átlaga. */
  avg: number;
  /** A mai eltérés az átlagtól, százalékban. */
  pct: number;
}

/**
 * A napi „1 bázis = X Ft" sorozat.
 * EUR-bázis: a CHF-bázisú adatból kereszt-árfolyammal (huf / eur).
 * CHF-bázis: közvetlenül a huf.
 */
export function baseToHufSeries(series: RatePoint[], base: "EUR" | "CHF"): number[] {
  return series
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => (base === "EUR" ? (p.eur > 0 ? p.huf / p.eur : 0) : p.huf));
}

/**
 * Friss, FELFELÉ irányuló keresztezés az `avg * (1 + thresholdPct/100)` vonalon.
 * `null`, ha kevés az adat (nem küldünk bizonytalan jelzésre).
 */
export function detectUpwardCrossing(values: number[], thresholdPct = 1.5): CrossingResult | null {
  const vals = values.filter((v) => Number.isFinite(v) && v > 0);
  // Legalább ~2 hét adat kell, hogy az „átlag" jelentsen valamit.
  if (vals.length < 10) return null;

  const today = vals[vals.length - 1];
  const prev = vals[vals.length - 2];
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (!(avg > 0)) return null;

  const line = avg * (1 + thresholdPct / 100);
  return {
    crossed: today > line && prev <= line,
    today,
    avg,
    pct: ((today - avg) / avg) * 100,
  };
}
