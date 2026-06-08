/**
 * Iránytű — saját adat pozicionálása az eloszlásban (tiszta, tesztelhető logika).
 *
 * A bér-hisztogram 10.000 CHF-es sávokból áll (bucket_k = a sáv alsó határa
 * ezer CHF-ben, lásd getSalaryHistogram). Ebből számoljuk ki, hol áll a
 * felhasználó saját bére a közösségi eloszlásban — ez a „Hol állsz?" insight.
 */

export interface HistogramBucket {
  /** A 10k-s sáv alsó határa ezer CHF-ben (pl. 80 = 80.000–89.999 CHF). */
  bucket_k: number;
  entry_count: number;
}

export interface SalaryStanding {
  /** Az eloszlás összes beküldése. */
  total: number;
  /** Percentilis rang 0–100: a beküldők kb. hány %-a keres a felhasználónál kevesebbet. */
  percentile: number;
}

/**
 * A felhasználó bérének percentilis rangja a megadott (iparág+kanton) eloszlásban.
 * Mid-bucket konvenció: a saját 10k-s sáv felét beleszámítjuk a „lent van" arányba,
 * így a sávon belüli pozíció nem ugrik. `null`, ha nincs adat.
 */
export function salaryStanding(histogram: HistogramBucket[], salaryChf: number): SalaryStanding | null {
  const total = histogram.reduce((s, b) => s + b.entry_count, 0);
  if (total <= 0 || !Number.isFinite(salaryChf) || salaryChf <= 0) return null;

  const userBucketK = Math.floor(salaryChf / 10000) * 10;
  let below = 0;
  let own = 0;
  for (const b of histogram) {
    if (b.bucket_k < userBucketK) below += b.entry_count;
    else if (b.bucket_k === userBucketK) own += b.entry_count;
  }

  const percentile = Math.round(((below + own / 2) / total) * 100);
  return { total, percentile: Math.min(100, Math.max(0, percentile)) };
}
