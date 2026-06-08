/**
 * Iránytű — saját adat pozicionálása az eloszlásban (tiszta, tesztelhető logika).
 *
 * A bér-hisztogram 10.000 CHF-es, a lakbér-hisztogram 200 CHF-es sávokból áll
 * (lásd getSalaryHistogram / getRentHistogram). Ebből számoljuk ki, hol áll a
 * felhasználó saját bére / lakbére a közösségi eloszlásban — ez a „Hol állsz?"
 * insight. Bérnél a több, lakbérnél a kevesebb a kedvező (a framing a UI dolga).
 */

/** Lakbér-sáv szélessége CHF-ben (a getRentHistogram bucketelésével egyezik). */
export const RENT_BUCKET_WIDTH = 200;

export interface HistogramBucket {
  /** A 10k-s sáv alsó határa ezer CHF-ben (pl. 80 = 80.000–89.999 CHF). */
  bucket_k: number;
  entry_count: number;
}

export interface RentHistogramBucket {
  /** A sáv alsó határa CHF-ben (200-as bontás, pl. 1800 = 1800–1999 CHF). */
  bucket_chf: number;
  entry_count: number;
}

export interface SalaryStanding {
  /** Az eloszlás összes beküldése. */
  total: number;
  /** Percentilis rang 0–100: a beküldők kb. hány %-a van a felhasználó alatt (kevesebb érték). */
  percentile: number;
}

/**
 * Egy érték percentilis rangja egy sávos eloszlásban.
 * Mid-bucket konvenció: a saját sáv felét beleszámítjuk a „lent van" arányba,
 * így a sávon belüli pozíció nem ugrik. `null`, ha nincs adat / érvénytelen érték.
 *
 * @param buckets sávok az érték alsó határával (`lower`) az érték mértékegységében
 * @param bucketWidth a sávszélesség ugyanabban a mértékegységben
 */
function rankInDistribution(
  buckets: { lower: number; count: number }[],
  value: number,
  bucketWidth: number,
): SalaryStanding | null {
  const total = buckets.reduce((s, b) => s + b.count, 0);
  if (total <= 0 || !Number.isFinite(value) || value <= 0) return null;

  const userBucket = Math.floor(value / bucketWidth) * bucketWidth;
  let below = 0;
  let own = 0;
  for (const b of buckets) {
    if (b.lower < userBucket) below += b.count;
    else if (b.lower === userBucket) own += b.count;
  }

  const percentile = Math.round(((below + own / 2) / total) * 100);
  return { total, percentile: Math.min(100, Math.max(0, percentile)) };
}

/** A felhasználó bérének percentilis rangja a (iparág+kanton) eloszlásban. */
export function salaryStanding(histogram: HistogramBucket[], salaryChf: number): SalaryStanding | null {
  // bucket_k ezer CHF-ben → CHF-re hozzuk, 10.000-es sávszélesség.
  return rankInDistribution(
    histogram.map((b) => ({ lower: b.bucket_k * 1000, count: b.entry_count })),
    salaryChf,
    10000,
  );
}

/**
 * A felhasználó lakbérének percentilis rangja a (szobaszám+kanton) eloszlásban.
 * A `percentile` itt is „hány % fizet kevesebbet" — a UI fordítja kedvező
 * framingre (lakbérnél a kevesebb a jó).
 */
export function rentStanding(histogram: RentHistogramBucket[], rentChf: number): SalaryStanding | null {
  return rankInDistribution(
    histogram.map((b) => ({ lower: b.bucket_chf, count: b.entry_count })),
    rentChf,
    RENT_BUCKET_WIDTH,
  );
}
