import { getDB } from "./cloudflare";

export interface SalaryBenchmarkInput {
  cantonCode: string;
  industry: string;
  yearsExperience: number;
  grossSalaryChf: number;
  ipHash: string;
}

export interface RentBenchmarkInput {
  cantonCode: string;
  rooms: number;
  rentChf: number;
  ipHash: string;
}

export interface UserSubmissions {
  salary: {
    cantonCode: string;
    industry: string;
    yearsExperience: number;
    grossSalaryChf: number;
    /** ISO-timestamp az utolsó frissítésről (created_at). */
    lastUpdatedAt: string | null;
  } | null;
  rent: {
    cantonCode: string;
    rooms: number;
    rentChf: number;
    lastUpdatedAt: string | null;
  } | null;
}

export interface SalaryStatsRow {
  industry: string;
  avg_salary: number;
  median_salary: number;
  min_salary: number;
  max_salary: number;
  entry_count: number;
}

/** Tapasztalat-sáv szerinti bontás egy iparágon belül */
export interface SalaryExpRow {
  industry: string;
  exp_bucket: string; // '0–2 év' | '3–5 év' | '5+ év'
  avg_salary: number;
  entry_count: number;
}

/** Havi trend sor (12 hónapos ablak) */
export interface SalaryTrendRow {
  month: string;       // 'YYYY-MM'
  avg_salary: number;
  entry_count: number;
}

export interface RentStatsRow {
  rooms: number;
  avg_rent: number;
  median_rent: number;
  min_rent: number;
  max_rent: number;
  entry_count: number;
}

export interface AlertSubscription {
  email: string;
  industry: string;
  cantonCode: string;
  expBucket: string;
  currentAvg: number | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Időszűrőhöz számított datetime határérték (SQLite TEXT formátum) */
function periodThreshold(period: string): string | null {
  const MAP: Record<string, number> = {
    "3m":  90,
    "6m":  180,
    "12m": 365,
    "all": 0,
  };
  const days = MAP[period] ?? 365;
  if (days === 0) return null;
  const d = new Date(Date.now() - days * 24 * 3600 * 1000);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

// ─── INSERT ────────────────────────────────────────────────────────────────

export async function submitSalaryBenchmark(input: SalaryBenchmarkInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO salary_benchmarks (id, canton_code, industry, years_experience, gross_salary_chf, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(crypto.randomUUID(), input.cantonCode, input.industry, input.yearsExperience, input.grossSalaryChf, input.ipHash)
    .run();
}

export async function submitRentBenchmark(input: RentBenchmarkInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO rent_benchmarks (id, canton_code, rooms, rent_chf, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(crypto.randomUUID(), input.cantonCode, input.rooms, input.rentChf, input.ipHash)
    .run();
}

// ─── UPDATE ────────────────────────────────────────────────────────────────

export async function updateSalaryBenchmark(input: SalaryBenchmarkInput): Promise<void> {
  await getDB()
    .prepare(
      `UPDATE salary_benchmarks
       SET canton_code = ?, industry = ?, years_experience = ?, gross_salary_chf = ?, created_at = datetime('now')
       WHERE ip_hash = ?`
    )
    .bind(input.cantonCode, input.industry, input.yearsExperience, input.grossSalaryChf, input.ipHash)
    .run();
}

export async function updateRentBenchmark(input: RentBenchmarkInput): Promise<void> {
  await getDB()
    .prepare(
      `UPDATE rent_benchmarks
       SET canton_code = ?, rooms = ?, rent_chf = ?, created_at = datetime('now')
       WHERE ip_hash = ?`
    )
    .bind(input.cantonCode, input.rooms, input.rentChf, input.ipHash)
    .run();
}

// ─── USER OWN DATA ────────────────────────────────────────────────────────

export async function getUserSubmissions(ipHash: string): Promise<UserSubmissions> {
  const [salaryRow, rentRow] = await Promise.all([
    getDB()
      .prepare(`SELECT canton_code, industry, years_experience, gross_salary_chf, created_at FROM salary_benchmarks WHERE ip_hash = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(ipHash)
      .first<{ canton_code: string; industry: string; years_experience: number; gross_salary_chf: number; created_at: string }>(),
    getDB()
      .prepare(`SELECT canton_code, rooms, rent_chf, created_at FROM rent_benchmarks WHERE ip_hash = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(ipHash)
      .first<{ canton_code: string; rooms: number; rent_chf: number; created_at: string }>(),
  ]);
  return {
    salary: salaryRow
      ? {
          cantonCode: salaryRow.canton_code,
          industry: salaryRow.industry,
          yearsExperience: salaryRow.years_experience,
          grossSalaryChf: salaryRow.gross_salary_chf,
          lastUpdatedAt: salaryRow.created_at ?? null,
        }
      : null,
    rent: rentRow
      ? {
          cantonCode: rentRow.canton_code,
          rooms: rentRow.rooms,
          rentChf: rentRow.rent_chf,
          lastUpdatedAt: rentRow.created_at ?? null,
        }
      : null,
  };
}

/** Helper: medián JS-szel (D1-ben nincs PERCENTILE). */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export async function getUserSubmissionStatus(ipHash: string): Promise<{ salary: boolean; rent: boolean }> {
  const [s, r] = await Promise.all([
    getDB().prepare("SELECT 1 FROM salary_benchmarks WHERE ip_hash = ? LIMIT 1").bind(ipHash).first(),
    getDB().prepare("SELECT 1 FROM rent_benchmarks WHERE ip_hash = ? LIMIT 1").bind(ipHash).first(),
  ]);
  return { salary: !!s, rent: !!r };
}

export async function hasUserSubmittedBenchmark(ipHash: string): Promise<boolean> {
  const s = await getUserSubmissionStatus(ipHash);
  return s.salary || s.rent;
}

// ─── STATS (aggregált, outlier-szűrt) ────────────────────────────────────

export async function getSalaryStats(
  cantonCode?: string | null,
  period: string = "12m"
): Promise<SalaryStatsRow[]> {
  const threshold = periodThreshold(period);
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (cantonCode && cantonCode !== "all") { conditions.push("canton_code = ?"); binds.push(cantonCode); }
  if (threshold) { conditions.push("created_at >= ?"); binds.push(threshold); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  // Raw értékek iparáganként; átlag + valódi MEDIÁN JS-szel (D1 nem támogat
  // PERCENTILE-t). 2.5σ outlier szűrés a min/max/átlag/medián értékekre,
  // de az entry_count a NYERS rekord-szám (a frontend min-3 küszöbéhez).
  const sql = `
    SELECT industry, gross_salary_chf
    FROM salary_benchmarks ${where}
    ORDER BY industry ASC
    LIMIT 50000
  `;
  const { results } = await getDB()
    .prepare(sql)
    .bind(...binds)
    .all<{ industry: string; gross_salary_chf: number }>();

  const byIndustry = new Map<string, number[]>();
  for (const r of results) {
    if (!byIndustry.has(r.industry)) byIndustry.set(r.industry, []);
    byIndustry.get(r.industry)!.push(r.gross_salary_chf);
  }

  const out: SalaryStatsRow[] = [];
  for (const [industry, values] of byIndustry) {
    if (values.length === 0) continue;
    let filtered = values;
    if (values.length >= 3) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
      const stddev = Math.sqrt(variance);
      const lo = mean - 2.5 * stddev;
      const hi = mean + 2.5 * stddev;
      filtered = values.filter((v) => v >= lo && v <= hi);
      if (filtered.length === 0) filtered = values;
    }
    out.push({
      industry,
      avg_salary: Math.round(
        filtered.reduce((a, b) => a + b, 0) / filtered.length,
      ),
      median_salary: median(filtered),
      min_salary: Math.min(...filtered),
      max_salary: Math.max(...filtered),
      entry_count: values.length,
    });
  }
  out.sort((a, b) =>
    b.entry_count - a.entry_count !== 0
      ? b.entry_count - a.entry_count
      : b.avg_salary - a.avg_salary,
  );
  return out.slice(0, 50);
}

/**
 * Tapasztalat-sávok szerinti bontás — minden iparágon belül 3 sor:
 * '0–2 év', '3–5 év', '5+ év'
 */
export async function getSalaryStatsByExp(
  cantonCode?: string | null,
  period: string = "12m"
): Promise<SalaryExpRow[]> {
  const threshold = periodThreshold(period);
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (cantonCode && cantonCode !== "all") { conditions.push("canton_code = ?"); binds.push(cantonCode); }
  if (threshold) { conditions.push("created_at >= ?"); binds.push(threshold); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const sql = `
    SELECT
      industry,
      CASE
        WHEN years_experience <= 2 THEN '0–2 év'
        WHEN years_experience <= 5 THEN '3–5 év'
        ELSE '5+ év'
      END as exp_bucket,
      ROUND(AVG(gross_salary_chf)) as avg_salary,
      COUNT(*) as entry_count
    FROM salary_benchmarks ${where}
    GROUP BY industry, exp_bucket
    ORDER BY industry,
      CASE exp_bucket WHEN '0–2 év' THEN 1 WHEN '3–5 év' THEN 2 ELSE 3 END ASC
    LIMIT 150
  `;
  const { results } = await getDB().prepare(sql).bind(...binds).all<SalaryExpRow>();
  return results;
}

/**
 * Havi trend — az elmúlt 12 hónap átlagbér változása egy iparágban.
 * Kantonra is szűrhető.
 */
export async function getSalaryTrend(
  industry: string,
  cantonCode?: string | null
): Promise<SalaryTrendRow[]> {
  const conditions: string[] = [
    "industry = ?",
    "created_at >= datetime('now', '-12 months')",
  ];
  const binds: unknown[] = [industry];

  if (cantonCode && cantonCode !== "all") {
    conditions.push("canton_code = ?");
    binds.push(cantonCode);
  }

  const where = "WHERE " + conditions.join(" AND ");

  const sql = `
    SELECT
      strftime('%Y-%m', created_at) as month,
      ROUND(AVG(gross_salary_chf)) as avg_salary,
      COUNT(*) as entry_count
    FROM salary_benchmarks ${where}
    GROUP BY month
    ORDER BY month ASC
    LIMIT 12
  `;
  const { results } = await getDB().prepare(sql).bind(...binds).all<SalaryTrendRow>();
  return results;
}

/**
 * Bérsáv-hisztogram (10k-s sávokban) egy adott iparágban.
 */
export async function getSalaryHistogram(
  industry: string,
  cantonCode?: string | null
): Promise<{ bucket_k: number; entry_count: number }[]> {
  const conditions: string[] = ["industry = ?"];
  const binds: unknown[] = [industry];

  if (cantonCode && cantonCode !== "all") {
    conditions.push("canton_code = ?");
    binds.push(cantonCode);
  }

  const where = "WHERE " + conditions.join(" AND ");

  const sql = `
    SELECT
      CAST(gross_salary_chf / 10000 AS INTEGER) * 10 as bucket_k,
      COUNT(*) as entry_count
    FROM salary_benchmarks ${where}
    GROUP BY bucket_k
    ORDER BY bucket_k ASC
  `;
  const { results } = await getDB().prepare(sql).bind(...binds).all<{ bucket_k: number; entry_count: number }>();
  return results;
}

/**
 * Lakbér-hisztogram adott szobaszámra (és opcionálisan kantonra), 200 CHF-es
 * sávokban. A szobaszám-szűrés azért kell, mert a lakbér erősen szobaszám-függő.
 */
export async function getRentHistogram(
  rooms: number,
  cantonCode?: string | null
): Promise<{ bucket_chf: number; entry_count: number }[]> {
  const conditions: string[] = ["rooms = ?"];
  const binds: unknown[] = [rooms];

  if (cantonCode && cantonCode !== "all") {
    conditions.push("canton_code = ?");
    binds.push(cantonCode);
  }

  const where = "WHERE " + conditions.join(" AND ");

  const sql = `
    SELECT
      CAST(rent_chf / 200 AS INTEGER) * 200 as bucket_chf,
      COUNT(*) as entry_count
    FROM rent_benchmarks ${where}
    GROUP BY bucket_chf
    ORDER BY bucket_chf ASC
  `;
  const { results } = await getDB().prepare(sql).bind(...binds).all<{ bucket_chf: number; entry_count: number }>();
  return results;
}

/**
 * Kiszámolja a lakbér/fizetés arány közösségi átlagát (azok alapján, akik mindkettőt beküldték).
 */
export async function getRentToSalaryRatio(cantonCode: string = "all"): Promise<{ avg_ratio: number | null; entry_count: number }> {
  const binds: unknown[] = [];
  let where = "";
  
  if (cantonCode !== "all") {
    where = "AND s.canton_code = ?";
    binds.push(cantonCode);
  }

  const sql = `
    SELECT
      ROUND(AVG((r.rent_chf * 12.0) / s.gross_salary_chf * 100)) as avg_ratio,
      COUNT(*) as entry_count
    FROM salary_benchmarks s
    JOIN rent_benchmarks r ON s.ip_hash = r.ip_hash
    WHERE s.gross_salary_chf > 0 AND r.rent_chf > 0 ${where}
  `;
  const row = await getDB().prepare(sql).bind(...binds).first<{ avg_ratio: number | null; entry_count: number }>();
  return row ?? { avg_ratio: null, entry_count: 0 };
}

/**
 * Hőtérkép lekérdezése — átlagbér kantononként egy adott iparágban.
 */
export async function getSalaryHeatmap(
  industry: string,
  period: string = "12m"
): Promise<{ canton_code: string; avg_salary: number; entry_count: number }[]> {
  const threshold = periodThreshold(period);
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (industry !== "all") {
    conditions.push("industry = ?");
    binds.push(industry);
  }
  if (threshold) {
    conditions.push("created_at >= ?");
    binds.push(threshold);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const sql = `
    SELECT
      canton_code,
      ROUND(AVG(gross_salary_chf)) as avg_salary,
      COUNT(*) as entry_count
    FROM salary_benchmarks ${where}
    GROUP BY canton_code
  `;
  const { results } = await getDB().prepare(sql).bind(...binds).all<any>();
  return results;
}

export async function getRentStats(
  cantonCode?: string | null,
  period: string = "12m"
): Promise<RentStatsRow[]> {
  const threshold = periodThreshold(period);
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (cantonCode && cantonCode !== "all") { conditions.push("canton_code = ?"); binds.push(cantonCode); }
  if (threshold) { conditions.push("created_at >= ?"); binds.push(threshold); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const sql = `
    SELECT rooms, rent_chf
    FROM rent_benchmarks ${where}
    ORDER BY rooms ASC
    LIMIT 50000
  `;
  const { results } = await getDB()
    .prepare(sql)
    .bind(...binds)
    .all<{ rooms: number; rent_chf: number }>();

  const byRooms = new Map<number, number[]>();
  for (const r of results) {
    if (!byRooms.has(r.rooms)) byRooms.set(r.rooms, []);
    byRooms.get(r.rooms)!.push(r.rent_chf);
  }

  const out: RentStatsRow[] = [];
  for (const [rooms, values] of byRooms) {
    if (values.length === 0) continue;
    let filtered = values;
    if (values.length >= 3) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
      const stddev = Math.sqrt(variance);
      const lo = mean - 2.5 * stddev;
      const hi = mean + 2.5 * stddev;
      filtered = values.filter((v) => v >= lo && v <= hi);
      if (filtered.length === 0) filtered = values;
    }
    out.push({
      rooms,
      avg_rent: Math.round(
        filtered.reduce((a, b) => a + b, 0) / filtered.length,
      ),
      median_rent: median(filtered),
      min_rent: Math.min(...filtered),
      max_rent: Math.max(...filtered),
      entry_count: values.length,
    });
  }
  out.sort((a, b) => a.rooms - b.rooms);
  return out.slice(0, 50);
}

// ─── EMAIL ALERTS ────────────────────────────────────────────────────────

export async function subscribeToAlert(input: AlertSubscription): Promise<"created" | "updated"> {
  const existing = await getDB()
    .prepare("SELECT id FROM benchmark_alerts WHERE email = ? AND industry = ? AND canton_code = ? LIMIT 1")
    .bind(input.email, input.industry, input.cantonCode)
    .first<{ id: string }>();

  if (existing) {
    await getDB()
      .prepare(`UPDATE benchmark_alerts SET exp_bucket = ?, last_avg_chf = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(input.expBucket, input.currentAvg, existing.id)
      .run();
    return "updated";
  }

  await getDB()
    .prepare(`INSERT INTO benchmark_alerts (id, email, industry, canton_code, exp_bucket, last_avg_chf, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
    .bind(crypto.randomUUID(), input.email, input.industry, input.cantonCode, input.expBucket, input.currentAvg)
    .run();
  return "created";
}

/** Lekéri azokat a feliratkozókat, akiknél az átlag ±10%-ot változott (radar trigger hívja). */
export async function getAlertsToFire(): Promise<Array<{
  id: string; email: string; industry: string; canton_code: string;
  exp_bucket: string; last_avg_chf: number; new_avg: number;
}>> {
  const { results: subscribers } = await getDB()
    .prepare("SELECT id, email, industry, canton_code, exp_bucket, last_avg_chf FROM benchmark_alerts WHERE last_avg_chf IS NOT NULL")
    .all<{ id: string; email: string; industry: string; canton_code: string; exp_bucket: string; last_avg_chf: number }>();

  const toFire: Array<{ id: string; email: string; industry: string; canton_code: string; exp_bucket: string; last_avg_chf: number; new_avg: number }> = [];

  for (const sub of subscribers) {
    const row = await getDB()
      .prepare(`
        SELECT ROUND(AVG(gross_salary_chf)) as avg FROM salary_benchmarks
        WHERE industry = ? AND (? = 'all' OR canton_code = ?)
          AND created_at >= datetime('now', '-3 months')
      `)
      .bind(sub.industry, sub.canton_code, sub.canton_code)
      .first<{ avg: number | null }>();

    if (!row?.avg) continue;
    const change = Math.abs(row.avg - sub.last_avg_chf) / sub.last_avg_chf;
    if (change >= 0.10) {
      toFire.push({ ...sub, new_avg: row.avg });
    }
  }

  return toFire;
}

export async function markAlertFired(id: string, newAvg: number): Promise<void> {
  await getDB()
    .prepare(`UPDATE benchmark_alerts SET last_avg_chf = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(newAvg, id)
    .run();
}
