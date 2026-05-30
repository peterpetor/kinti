import { NextResponse, type NextRequest } from "next/server";
import {
  submitSalaryBenchmark,
  submitRentBenchmark,
  getSalaryStats,
  getRentStats,
  getUserSubmissionStatus,
} from "@/lib/benchmark";
import { hashIp } from "@/lib/bulletin";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET: Aggregált statisztikák — per-típus adatfallal.
 * - salary adatok csak ha a user küldött be salary adatot
 * - rent adatok csak ha a user küldött be rent adatot
 * Query params: canton, period (3m|6m|12m|all)
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";

  const { searchParams } = new URL(req.url);
  const cantonCode = searchParams.get("canton") || "all";
  const period = searchParams.get("period") || "12m";

  const status = await getUserSubmissionStatus(ipHash);

  const [salary, rent] = await Promise.all([
    status.salary ? getSalaryStats(cantonCode, period) : Promise.resolve(null),
    status.rent   ? getRentStats(cantonCode, period)   : Promise.resolve(null),
  ]);

  return NextResponse.json(
    {
      locked: { salary: !status.salary, rent: !status.rent },
      salary,
      rent,
    },
    { headers: { "cache-control": "no-store" } }
  );
}

/**
 * POST: Bér vagy lakbér beküldése.
 * Újra-küldés ugyanattól az IP-től megengedett (frissítés).
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // Turnstile CAPTCHA védelem
  const captcha = await verifyTurnstile(body.turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen. Próbáld újra." },
      { status: 400 }
    );
  }

  if (body.type === "salary") {
    if (!body.cantonCode || !body.industry || typeof body.yearsExperience !== "number" || typeof body.grossSalaryChf !== "number") {
      return NextResponse.json({ error: "Hiányzó vagy hibás bér adatok." }, { status: 400 });
    }
    if (body.grossSalaryChf < 20000 || body.grossSalaryChf > 300000) {
      return NextResponse.json(
        { error: "Érvényes bruttó éves béradatot adj meg (20.000–300.000 CHF között)." },
        { status: 400 }
      );
    }
    await submitSalaryBenchmark({
      cantonCode: body.cantonCode,
      industry: body.industry,
      yearsExperience: body.yearsExperience,
      grossSalaryChf: body.grossSalaryChf,
      ipHash,
    });
    return NextResponse.json({ ok: true, type: "salary" });

  } else if (body.type === "rent") {
    if (!body.cantonCode || typeof body.rooms !== "number" || typeof body.rentChf !== "number") {
      return NextResponse.json({ error: "Hiányzó vagy hibás lakbér adatok." }, { status: 400 });
    }
    if (body.rentChf < 300 || body.rentChf > 10000) {
      return NextResponse.json(
        { error: "Érvényes havi lakbér adatot adj meg (300–10.000 CHF között)." },
        { status: 400 }
      );
    }
    await submitRentBenchmark({
      cantonCode: body.cantonCode,
      rooms: body.rooms,
      rentChf: body.rentChf,
      ipHash,
    });
    return NextResponse.json({ ok: true, type: "rent" });
  }

  return NextResponse.json({ error: "Ismeretlen beküldési típus." }, { status: 400 });
}
