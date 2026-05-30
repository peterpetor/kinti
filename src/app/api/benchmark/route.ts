import { NextResponse, type NextRequest } from "next/server";
import {
  submitSalaryBenchmark,
  submitRentBenchmark,
  getSalaryStats,
  getRentStats,
  hasUserSubmittedBenchmark
} from "@/lib/benchmark";
import { hashIp } from "@/lib/bulletin";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET: Lekéri az aggregált statisztikákat, DE CSAK ha a felhasználó már küldött be adatot
export async function GET(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";
  
  const hasSubmitted = await hasUserSubmittedBenchmark(ipHash);
  const { searchParams } = new URL(req.url);
  const cantonCode = searchParams.get("canton") || "all";
  
  if (!hasSubmitted) {
    return NextResponse.json(
      { locked: true, message: "Kérlek, küldd be a saját (anonim) adatodat, hogy láthasd a közösségi statisztikákat!" },
      { headers: { "cache-control": "no-store" } }
    );
  }

  const [salary, rent] = await Promise.all([
    getSalaryStats(cantonCode),
    getRentStats(cantonCode)
  ]);

  return NextResponse.json(
    { locked: false, salary, rent },
    { headers: { "cache-control": "no-store" } }
  );
}

// POST: Beküldi az adatot (Fizetés vagy Lakbér)
export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const ipHash = (await hashIp(ip)) || "unknown-ip";
  
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // Turnstile CAPTCHA védelem a botok ellen
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
    // Sanity check
    if (body.grossSalaryChf < 20000 || body.grossSalaryChf > 300000) {
      return NextResponse.json({ error: "Kérjük, érvényes bruttó éves béradatot adj meg (20.000 és 300.000 CHF között)." }, { status: 400 });
    }
    
    await submitSalaryBenchmark({
      cantonCode: body.cantonCode,
      industry: body.industry,
      yearsExperience: body.yearsExperience,
      grossSalaryChf: body.grossSalaryChf,
      ipHash
    });
    
    return NextResponse.json({ ok: true });
    
  } else if (body.type === "rent") {
    if (!body.cantonCode || typeof body.rooms !== "number" || typeof body.rentChf !== "number") {
      return NextResponse.json({ error: "Hiányzó vagy hibás lakbér adatok." }, { status: 400 });
    }
    // Sanity check
    if (body.rentChf < 300 || body.rentChf > 10000) {
       return NextResponse.json({ error: "Kérjük, érvényes havi lakbér adatot adj meg (300 és 10000 CHF között)." }, { status: 400 });
    }
    
    await submitRentBenchmark({
      cantonCode: body.cantonCode,
      rooms: body.rooms,
      rentChf: body.rentChf,
      ipHash
    });
    
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ismeretlen beküldési típus." }, { status: 400 });
}
