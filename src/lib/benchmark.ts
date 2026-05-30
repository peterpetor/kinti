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

export async function submitSalaryBenchmark(input: SalaryBenchmarkInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO salary_benchmarks (id, canton_code, industry, years_experience, gross_salary_chf, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?)`
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
      `INSERT INTO rent_benchmarks (id, canton_code, rooms, rent_chf, ip_hash)
       VALUES (?, ?, ?, ?, ?)`
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

export async function getSalaryStats(cantonCode?: string | null): Promise<SalaryStatsRow[]> {
  let sql = `
    SELECT 
      industry, 
      ROUND(AVG(gross_salary_chf)) as avg_salary, 
      MIN(gross_salary_chf) as min_salary, 
      MAX(gross_salary_chf) as max_salary, 
      COUNT(*) as entry_count 
    FROM salary_benchmarks
  `;
  const binds: unknown[] = [];
  
  if (cantonCode && cantonCode !== "all") {
    sql += " WHERE canton_code = ?";
    binds.push(cantonCode);
  }
  
  sql += " GROUP BY industry ORDER BY entry_count DESC, avg_salary DESC";

  const { results } = await getDB().prepare(sql).bind(...binds).all<SalaryStatsRow>();
  return results;
}

export async function getRentStats(cantonCode?: string | null): Promise<RentStatsRow[]> {
  let sql = `
    SELECT 
      rooms, 
      ROUND(AVG(rent_chf)) as avg_rent, 
      MIN(rent_chf) as min_rent, 
      MAX(rent_chf) as max_rent, 
      COUNT(*) as entry_count 
    FROM rent_benchmarks
  `;
  const binds: unknown[] = [];
  
  if (cantonCode && cantonCode !== "all") {
    sql += " WHERE canton_code = ?";
    binds.push(cantonCode);
  }
  
  sql += " GROUP BY rooms ORDER BY rooms ASC";

  const { results } = await getDB().prepare(sql).bind(...binds).all<RentStatsRow>();
  return results;
}

export async function hasUserSubmittedBenchmark(ipHash: string): Promise<boolean> {
  const salaryRow = await getDB().prepare("SELECT 1 FROM salary_benchmarks WHERE ip_hash = ? LIMIT 1").bind(ipHash).first();
  const rentRow = await getDB().prepare("SELECT 1 FROM rent_benchmarks WHERE ip_hash = ? LIMIT 1").bind(ipHash).first();
  return !!salaryRow || !!rentRow;
}
