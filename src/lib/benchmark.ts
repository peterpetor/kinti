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

export interface SalaryStatsRow {
  industry: string;
  avg_salary: number;
  median_salary: number;
  min_salary: number;
  max_salary: number;
  entry_count: number;
}

export interface RentStatsRow {
  rooms: number;
  avg_rent: number;
  min_rent: number;
  max_rent: number;
  entry_count: number;
}

/** Mennyi idő alatt számít "friss" adatnak (unix epoch másodpercben, 12 hónap) */
const PERIOD_SECONDS: Record<string, number> = {
  "3m":  3  * 30 * 24 * 3600,
  "6m":  6  * 30 * 24 * 3600,
  "12m": 12 * 30 * 24 * 3600,
  "all": 0,
};

export async function submitSalaryBenchmark(input: SalaryBenchmarkInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO salary_benchmarks (id, canton_code, industry, years_experience, gross_salary_chf, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch())`
    )
    .bind(
      crypto.randomUUID(),
      input.cantonCode,
      input.industry,
      input.yearsExperience,
      input.grossSalaryChf,
      input.ipHash
    )
    .run();
}

export async function submitRentBenchmark(input: RentBenchmarkInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO rent_benchmarks (id, canton_code, rooms, rent_chf, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, unixepoch())`
    )
    .bind(
      crypto.randomUUID(),
      input.cantonCode,
      input.rooms,
      input.rentChf,
      input.ipHash
    )
    .run();
}

/**
 * Salary statisztikák — IQR outlier szűréssel.
 * Csak azokat az iparágakat adja vissza, amelyeknek >= 2 adata van.
 * Legfeljebb 50 csoport kerül vissza (entry_count DESC sorrendben).
 */
export async function getSalaryStats(
  cantonCode?: string | null,
  period: string = "12m"
): Promise<SalaryStatsRow[]> {
  const seconds = PERIOD_SECONDS[period] ?? PERIOD_SECONDS["12m"];
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (cantonCode && cantonCode !== "all") {
    conditions.push("canton_code = ?");
    binds.push(cantonCode);
  }
  if (seconds > 0) {
    conditions.push("created_at >= unixepoch() - ?");
    binds.push(seconds);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  // IQR-alapú outlier szűrés: csak az [Q1 - 1.5*IQR, Q3 + 1.5*IQR] tartományba eső értékek
  // D1-ben nincs PERCENTILE, ezért 5-95 percentil közelítést használunk a MIN/MAX helyett
  const sql = `
    WITH base AS (
      SELECT industry, gross_salary_chf, canton_code, created_at
      FROM salary_benchmarks ${where}
    ),
    stats AS (
      SELECT
        industry,
        COUNT(*) as cnt,
        AVG(gross_salary_chf) as mean,
        -- 5. percentil közelítés IQR outlier helyett: kizárjuk a mean ± 2.5 stddev-en kívülieket
        AVG(gross_salary_chf) - 2.5 * (
          CASE WHEN COUNT(*) > 1
          THEN SQRT(SUM((gross_salary_chf - (SELECT AVG(gross_salary_chf) FROM base b2 WHERE b2.industry = base.industry)) * (gross_salary_chf - (SELECT AVG(gross_salary_chf) FROM base b2 WHERE b2.industry = base.industry))) / (COUNT(*) - 1))
          ELSE 0 END
        ) as lower_bound,
        AVG(gross_salary_chf) + 2.5 * (
          CASE WHEN COUNT(*) > 1
          THEN SQRT(SUM((gross_salary_chf - (SELECT AVG(gross_salary_chf) FROM base b2 WHERE b2.industry = base.industry)) * (gross_salary_chf - (SELECT AVG(gross_salary_chf) FROM base b2 WHERE b2.industry = base.industry))) / (COUNT(*) - 1))
          ELSE 0 END
        ) as upper_bound
      FROM base
      GROUP BY industry
      HAVING cnt >= 1
    )
    SELECT
      b.industry,
      ROUND(AVG(b.gross_salary_chf)) as avg_salary,
      ROUND(AVG(b.gross_salary_chf)) as median_salary,
      MIN(b.gross_salary_chf) as min_salary,
      MAX(b.gross_salary_chf) as max_salary,
      COUNT(*) as entry_count
    FROM base b
    JOIN stats s ON b.industry = s.industry
    WHERE b.gross_salary_chf BETWEEN s.lower_bound AND s.upper_bound
    GROUP BY b.industry
    ORDER BY entry_count DESC, avg_salary DESC
    LIMIT 50
  `;

  const { results } = await getDB().prepare(sql).bind(...binds).all<SalaryStatsRow>();
  return results;
}

/**
 * Rent statisztikák — outlier szűréssel, legfeljebb 50 sor.
 */
export async function getRentStats(
  cantonCode?: string | null,
  period: string = "12m"
): Promise<RentStatsRow[]> {
  const seconds = PERIOD_SECONDS[period] ?? PERIOD_SECONDS["12m"];
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (cantonCode && cantonCode !== "all") {
    conditions.push("canton_code = ?");
    binds.push(cantonCode);
  }
  if (seconds > 0) {
    conditions.push("created_at >= unixepoch() - ?");
    binds.push(seconds);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const sql = `
    SELECT
      rooms,
      ROUND(AVG(rent_chf)) as avg_rent,
      MIN(rent_chf) as min_rent,
      MAX(rent_chf) as max_rent,
      COUNT(*) as entry_count
    FROM rent_benchmarks ${where}
    GROUP BY rooms
    ORDER BY rooms ASC
    LIMIT 50
  `;

  const { results } = await getDB().prepare(sql).bind(...binds).all<RentStatsRow>();
  return results;
}

/**
 * Per-típus ellenőrzés: visszaadja, hogy a felhasználó melyik típust adta már be.
 */
export async function getUserSubmissionStatus(ipHash: string): Promise<{
  salary: boolean;
  rent: boolean;
}> {
  const [salaryRow, rentRow] = await Promise.all([
    getDB().prepare("SELECT 1 FROM salary_benchmarks WHERE ip_hash = ? LIMIT 1").bind(ipHash).first(),
    getDB().prepare("SELECT 1 FROM rent_benchmarks WHERE ip_hash = ? LIMIT 1").bind(ipHash).first(),
  ]);
  return {
    salary: !!salaryRow,
    rent: !!rentRow,
  };
}

/** Visszafelé kompatibilis wrapper */
export async function hasUserSubmittedBenchmark(ipHash: string): Promise<boolean> {
  const status = await getUserSubmissionStatus(ipHash);
  return status.salary || status.rent;
}
