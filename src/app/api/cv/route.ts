import { NextResponse } from "next/server";
import { createCvSubmission } from "@/lib/repo";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NAME_MIN = 2;
const NAME_MAX = 120;
const FIELD_MAX = 200;
const PAYLOAD_MAX = 20000; // a teljes CV JSON felső határa

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function strOrNull(v: unknown, max: number): string | null {
  const s = str(v).slice(0, max);
  return s.length > 0 ? s : null;
}

/**
 * POST /api/cv — a Német Önéletrajz Készítő OPCIONÁLIS profil-mentése.
 *
 * KIZÁRÓLAG akkor hívódik, ha a felhasználó bepipálta a közvetítési opt-int
 * (GDPR 6(1)a). A `consent:true` kötelező — enélkül 400. A PDF ettől függetlenül
 * a böngészőben készül, tehát a funkció mentés nélkül is teljes értékű.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // Honeypot — botok kitöltik, emberek nem.
    if (typeof body._hp === "string" && body._hp.length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Explicit hozzájárulás nélkül NEM mentünk (a hívó UI garantálja, de itt is védünk).
    if (body.consent !== true) {
      return NextResponse.json({ error: "Hozzájárulás szükséges a mentéshez." }, { status: 400 });
    }

    const ipHash = await hashIp(req.headers.get("cf-connecting-ip") ?? null);
    const rl = await checkAiRateLimit("cv-submit", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Túl sok mentés rövid idő alatt. Próbáld később." },
        { status: 429 },
      );
    }

    const fullName = str(body.fullName).slice(0, NAME_MAX);
    if (fullName.length < NAME_MIN) {
      return NextResponse.json({ error: "Kérjük add meg a neved." }, { status: 400 });
    }

    const email = strOrNull(body.email, FIELD_MAX);
    // Legalább egy elérhetőség kell, hogy a közvetítés értelmes legyen.
    const phone = strOrNull(body.phone, FIELD_MAX);
    if (!email && !phone) {
      return NextResponse.json(
        { error: "Adj meg legalább egy elérhetőséget (e-mail vagy telefon), hogy megkereshessenek." },
        { status: 400 },
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });
    }

    const payloadRaw = typeof body.payload === "string" ? body.payload : JSON.stringify(body.payload ?? {});
    if (payloadRaw.length > PAYLOAD_MAX) {
      return NextResponse.json({ error: "A profil túl nagy." }, { status: 400 });
    }

    const yearsRaw = Number(body.yearsExperience);
    const yearsExperience = Number.isFinite(yearsRaw) ? Math.max(0, Math.min(60, Math.round(yearsRaw))) : null;

    const manageToken = crypto.randomUUID().replace(/-/g, "");
    await createCvSubmission({
      fullName,
      email,
      phone,
      city: strOrNull(body.city, FIELD_MAX),
      category: strOrNull(body.category, 64),
      professionDe: strOrNull(body.professionDe, FIELD_MAX),
      yearsExperience,
      summary: strOrNull(body.summary, 2000),
      payload: payloadRaw,
      manageToken,
    });

    await logAiRateLimit("cv-submit", ipHash);

    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/cv POST", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}
