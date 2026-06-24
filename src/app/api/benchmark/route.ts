import { NextResponse, type NextRequest } from "next/server";
import {
  submitSalaryBenchmark, submitRentBenchmark,
  updateSalaryBenchmark, updateRentBenchmark,
  getSalaryStats, getSalaryStatsByExp, getRentStats,
  getUserSubmissionStatus, getUserSubmissions,
} from "@/lib/benchmark";
import { hashIp } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface BenchmarkBody {
  turnstileToken?: string;
  type?: string;
  country?: string;     // 'CH' | 'AT'
  cantonCode?: string;
  industry?: string;
  yearsExperience?: number;
  grossSalaryChf?: number; // a helyi pénznem összege (CH: CHF, AT: EUR)
  rooms?: number;
  rentChf?: number;
}

/**
 * GET: Aggregált statisztikák + tapasztalat-sávok + saját adat
 * Query: canton, period (3m|6m|12m|all)
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";
  const { searchParams } = new URL(req.url);
  const canton = searchParams.get("canton") || "all";
  const period = searchParams.get("period") || "12m";
  const cGet = searchParams.get("country");
  const country = cGet === "AT" || cGet === "DE" ? cGet : "CH";

  const [status, myData] = await Promise.all([
    getUserSubmissionStatus(ipHash, country),
    getUserSubmissions(ipHash, country),
  ]);

  const [salary, salaryByExp, rent] = await Promise.all([
    status.salary ? getSalaryStats(country, canton, period) : Promise.resolve(null),
    status.salary ? getSalaryStatsByExp(country, canton, period) : Promise.resolve(null),
    status.rent   ? getRentStats(country, canton, period)    : Promise.resolve(null),
  ]);

  return NextResponse.json(
    { locked: { salary: !status.salary, rent: !status.rent }, myData, salary, salaryByExp, rent },
    { headers: { "cache-control": "no-store" } }
  );
}

/** POST: Első beküldés */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";
  let body: BenchmarkBody;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }
  const captcha = await verifyTurnstile(body.turnstileToken, ip);
  if (!captcha.ok) return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });
  return handleUpsert("insert", body, ipHash);
}

/** PUT: Módosítás */
export async function PUT(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";
  let body: BenchmarkBody;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }
  const captcha = await verifyTurnstile(body.turnstileToken, ip);
  if (!captcha.ok) return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });
  return handleUpsert("update", body, ipHash);
}

async function handleUpsert(mode: "insert" | "update", body: BenchmarkBody, ipHash: string) {
  const country = body.country === "AT" || body.country === "DE" ? body.country : "CH";
  const cur = country !== "CH" ? "EUR" : "CHF";
  if (body.type === "salary") {
    if (!body.cantonCode || !body.industry || typeof body.yearsExperience !== "number" || typeof body.grossSalaryChf !== "number")
      return NextResponse.json({ error: "Hiányzó bér adatok." }, { status: 400 });
    const minS = country !== "CH" ? 15000 : 20000;
    const maxS = country !== "CH" ? 250000 : 300000;
    if (body.grossSalaryChf < minS || body.grossSalaryChf > maxS)
      return NextResponse.json({ error: `Érvényes bruttó éves béradatot adj meg (${minS.toLocaleString("hu-HU")}–${maxS.toLocaleString("hu-HU")} ${cur} között).` }, { status: 400 });
    const input = { country, cantonCode: body.cantonCode, industry: body.industry, yearsExperience: body.yearsExperience, grossSalaryChf: body.grossSalaryChf, ipHash };
    mode === "update" ? await updateSalaryBenchmark(input) : await submitSalaryBenchmark(input);
    return NextResponse.json({ ok: true, type: "salary" });
  }
  if (body.type === "rent") {
    if (!body.cantonCode || typeof body.rooms !== "number" || typeof body.rentChf !== "number")
      return NextResponse.json({ error: "Hiányzó lakbér adatok." }, { status: 400 });
    const maxR = country !== "CH" ? 6000 : 10000;
    if (body.rentChf < 300 || body.rentChf > maxR)
      return NextResponse.json({ error: `Érvényes havi lakbér adatot adj meg (300–${maxR.toLocaleString("hu-HU")} ${cur} között).` }, { status: 400 });
    const input = { country, cantonCode: body.cantonCode, rooms: body.rooms, rentChf: body.rentChf, ipHash };
    mode === "update" ? await updateRentBenchmark(input) : await submitRentBenchmark(input);
    return NextResponse.json({ ok: true, type: "rent" });
  }
  return NextResponse.json({ error: "Ismeretlen típus." }, { status: 400 });
}
