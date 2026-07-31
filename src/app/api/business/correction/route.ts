import { NextResponse } from "next/server";
import { getBusinessById } from "@/lib/repo";
import { createCorrection, countRecentCorrections } from "@/lib/repo-corrections";
import { isCorrectionField, needsSuggestion } from "@/lib/correction-fields";
import { hashIp } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/business/correction — „Javíts rajta" adatjavítási javaslat.
 * Body: { businessId, field, suggestion?, note?, turnstileToken }
 *
 * ⚠️ MIÉRT KÜLÖN A BEJELENTÉSTŐL: a `/api/report` AZONNAL ELREJTI a tartalmat
 * (DSA Art. 16). Ez helyes egy jogsértő adatra, de aránytalan egy elgépelt
 * telefonszámra — aki csak javítana, eddig vagy hallgatott, vagy indokolatlanul
 * levetetett egy működő céget. Ez a végpont NEM rejt el semmit: a javaslat
 * sorba áll, admin dönt.
 *
 * ⚠️ A javaslat SOSEM írja felül automatikusan a publikus adatot — egy nyílt,
 * közvetlenül a szaknévsorba író űrlap triviális rongálási felület lenne.
 */
const CORRECTIONS_PER_HOUR = 10;
const MAX_LEN = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      businessId?: string;
      field?: string;
      suggestion?: string;
      note?: string;
      turnstileToken?: string;
    };

    const businessId = typeof body.businessId === "string" ? body.businessId.trim() : "";
    const field = body.field;
    if (!businessId || !isCorrectionField(field)) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    // Bot-védelem — ugyanaz a fail-closed elv, mint a bejelentésnél: hiányzó
    // kulcsnál is elutasít. A javítás nem sürgős művelet, van e-mailes út is.
    const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for");
    const captcha = await verifyTurnstile(
      typeof body.turnstileToken === "string" ? body.turnstileToken : null,
      ip,
    );
    if (!captcha.ok) {
      return NextResponse.json(
        {
          error:
            "A robot-ellenőrzés sikertelen. Próbáld újra — ha nem megy, írj az info@kinti.app címre.",
        },
        { status: 400 },
      );
    }

    const ipHash = await hashIp(ip);
    const recent = await countRecentCorrections(ipHash);
    if (recent >= CORRECTIONS_PER_HOUR) {
      return NextResponse.json(
        { error: "Túl sok javaslat egy órán belül. Próbáld később." },
        { status: 429 },
      );
    }

    // Létező, látható vállalkozásra lehet csak javaslatot tenni.
    const biz = await getBusinessById(businessId);
    if (!biz) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const suggestion =
      typeof body.suggestion === "string" && body.suggestion.trim()
        ? body.suggestion.trim().slice(0, MAX_LEN)
        : null;
    const note =
      typeof body.note === "string" && body.note.trim()
        ? body.note.trim().slice(0, MAX_LEN)
        : null;

    // A „closed" jelzésnél nincs javasolt érték, ott a puszta jelzés az információ.
    if (needsSuggestion(field) && !suggestion) {
      return NextResponse.json({ error: "missing_suggestion" }, { status: 400 });
    }

    await createCorrection({
      id: crypto.randomUUID(),
      businessId,
      field,
      suggestion,
      note,
      reporterIpHash: ipHash,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("business/correction", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
