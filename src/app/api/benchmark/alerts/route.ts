import { NextResponse, type NextRequest } from "next/server";
import { subscribeToAlert } from "@/lib/benchmark";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/benchmark/alerts
 * Feliratkozás email értesítésre, ha az átlagbér ±10%-ot változik.
 */
interface AlertBody {
  email?: unknown;
  pushEndpoint?: unknown;
  industry?: unknown;
  turnstileToken?: string;
  cantonCode?: string;
  expBucket?: string;
  currentAvg?: number;
}

export async function POST(req: NextRequest) {
  let body: AlertBody;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  if (!body.industry || typeof body.industry !== "string") {
    return NextResponse.json({ error: "Az iparág megadása kötelező." }, { status: 400 });
  }

  const pushEndpoint = typeof body.pushEndpoint === "string" ? body.pushEndpoint.trim() : "";
  const usePush = /^https:\/\//.test(pushEndpoint);

  // Email-ágnál Turnstile + email-validáció; push-ágnál a böngésző push-endpointja
  // maga a bizonyíték (nem kell email/captcha).
  let email: string | null = null;
  if (!usePush) {
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Érvénytelen email-cím." }, { status: 400 });
    }
    const ip = req.headers.get("cf-connecting-ip") ?? null;
    const captcha = await verifyTurnstile(body.turnstileToken, ip);
    if (!captcha.ok) {
      return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });
    }
  }

  const result = await subscribeToAlert({
    email,
    pushEndpoint: usePush ? pushEndpoint : null,
    industry: body.industry,
    cantonCode: body.cantonCode || "all",
    expBucket: body.expBucket || "all",
    currentAvg: typeof body.currentAvg === "number" ? body.currentAvg : null,
  });

  return NextResponse.json({
    ok: true,
    status: result, // 'created' | 'updated'
    message: result === "created"
      ? (usePush
          ? "Push-értesítés bekapcsolva! Szólunk, ha az átlagbér ±10%-ot változik."
          : "Sikeresen feliratkoztál! Értesítünk, ha az átlagbér ±10%-ot változik.")
      : "Feliratkozásod frissítettük.",
  });
}
