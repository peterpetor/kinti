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
  } | null;
  rent: {
    cantonCode: string;
    rooms: number;
    rentChf: number;
  } | null;
}

export interface SalaryStatsRow {
  industry: string;
  avg_salary: number;
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
      .prepare(`SELECT canton_code, industry, years_experience, gross_salary_chf FROM salary_benchmarks WHERE ip_hash = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(ipHash)
      .first<{ canton_code: string; industry: string; years_experience: number; gross_salary_chf: number }>(),
    getDB()
      .prepare(`SELECT canton_code, rooms, rent_chf FROM rent_benchmarks WHERE ip_hash = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(ipHash)
      .first<{ canton_code: string; rooms: number; rent_chf: number }>(),
  ]);
  return {
    salary: salaryRow
      ? { cantonCode: salaryRow.canton_code, industry: salaryRow.industry, yearsExperience: salaryRow.years_experience, grossSalaryChf: salaryRow.gross_salary_chf }
      : null,
    rent: rentRow
      ? { cantonCode: rentRow.canton_code, rooms: rentRow.rooms, rentChf: rentRow.rent_chf }
      : null,
  };
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

  const sql = `
    SELECT
      industry,
      ROUND(AVG(gross_salary_chf)) as avg_salary,
      MIN(gross_salary_chf) as min_salary,
      MAX(gross_salary_chf) as max_salary,
      COUNT(*) as entry_count
    FROM salary_benchmarks ${where}
    GROUP BY industry
    HAVING entry_count >= 1
    ORDER BY entry_count DESC, avg_salary DESC
    LIMIT 50
  `;
  const { results } = await getDB().prepare(sql).bind(...binds).all<SalaryStatsRow>();
  return results;
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
    SELECT rooms, ROUND(AVG(rent_chf)) as avg_rent, MIN(rent_chf) as min_rent,
           MAX(rent_chf) as max_rent, COUNT(*) as entry_count
    FROM rent_benchmarks ${where}
    GROUP BY rooms ORDER BY rooms ASC LIMIT 50
  `;
  const { results } = await getDB().prepare(sql).bind(...binds).all<RentStatsRow>();
  return results;
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
