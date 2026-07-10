import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getB2bAccess, createB2bProject, closeB2bProject } from "@/lib/repo";
import { isValidCountry } from "@/lib/countries";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { hashIp } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const TITLE_MIN = 6;
const TITLE_MAX = 120;
const DESC_MIN = 20;
const DESC_MAX = 2000;
// Az opcionális mezők szerveroldali sapkái — a kliens maxLength megkerülhető,
// a sapkátlan mező DB-t hizlalna és minden tag feed-payloadját duzzasztaná.
const CITY_MAX = 80;
const PHONE_MAX = 40;
// A szakma-id a categories(id) slug-formátuma; más formátum = kézzel gyártott kérés.
const CATEGORY_ID_RE = /^[a-z0-9_-]{1,64}$/;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function strOrNull(v: unknown): string | null {
  const s = str(v);
  return s.length > 0 ? s : null;
}

/**
 * POST /api/b2b/projects — új projekt kiírása.
 *
 * KRITIKUS biztonsági szabály: az első két ellenőrzés a bejelentkezés ÉS a
 * CÉG-szintű PRO (Szaknévsor PRO, featured=1). Nem-PRO user API-ból SEM tud
 * projektet kiírni (a paywall csak UI — ez a valódi kapu).
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
    }
    const { business, isPro, isApproved } = await getB2bAccess(userId);
    if (!business || !isPro) {
      return NextResponse.json(
        { error: "A B2B Hub csak Szaknévsor PRO cégeknek érhető el." },
        { status: 403 },
      );
    }
    // Moderációs kapu: a Paddle-fizetés azonnal featured=1-et ad, de a zárt
    // feedbe kiírni csak admin-jóváhagyott cég tud (a friss, még nem ellenőrzött
    // regisztráció ne tolhasson moderálatlan tartalmat a többi PRO tag elé).
    if (!isApproved) {
      return NextResponse.json(
        { error: "A projekt-kiíráshoz a cégprofilod admin-jóváhagyása szükséges (jellemzően 24 órán belül megtörténik)." },
        { status: 403 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // Honeypot — botok kitöltik, emberek nem (csendes elfogadás).
    if (typeof body._hp === "string" && body._hp.length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Anti-spam: max 10 kiírás / IP / óra (a modul már PRO-gated, ez runaway-guard).
    const ipHash = await hashIp(req.headers.get("cf-connecting-ip") ?? null);
    const rl = await checkAiRateLimit("b2b-create", ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Túl sok kiírás rövid idő alatt. Próbáld újra később." },
        { status: 429 },
      );
    }

    const title = str(body.title);
    const description = str(body.description);
    const targetCountry = str(body.targetCountry) || business.country || "CH";
    const targetCity = strOrNull(body.targetCity);
    const categoryNeeded = strOrNull(body.categoryNeeded);
    // A telefon a cég telefonjára esik vissza, ha a kiíró nem ad meg mást.
    const contactPhone = strOrNull(body.contactPhone) ?? business.phone ?? null;

    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      return NextResponse.json(
        { error: `A projekt címe ${TITLE_MIN}–${TITLE_MAX} karakter legyen.` },
        { status: 400 },
      );
    }
    if (description.length < DESC_MIN || description.length > DESC_MAX) {
      return NextResponse.json(
        { error: `A leírás ${DESC_MIN}–${DESC_MAX} karakter legyen.` },
        { status: 400 },
      );
    }
    if (!isValidCountry(targetCountry)) {
      return NextResponse.json({ error: "Érvénytelen célország." }, { status: 400 });
    }
    if (targetCity && targetCity.length > CITY_MAX) {
      return NextResponse.json({ error: `A város legfeljebb ${CITY_MAX} karakter lehet.` }, { status: 400 });
    }
    if (contactPhone && contactPhone.length > PHONE_MAX) {
      return NextResponse.json({ error: `A telefonszám legfeljebb ${PHONE_MAX} karakter lehet.` }, { status: 400 });
    }
    if (categoryNeeded && !CATEGORY_ID_RE.test(categoryNeeded)) {
      return NextResponse.json({ error: "Érvénytelen szakma-azonosító." }, { status: 400 });
    }

    const id = await createB2bProject({
      authorId: userId,
      businessId: business.id,
      title,
      description,
      targetCountry,
      targetCity,
      categoryNeeded,
      contactPhone,
    });

    await logAiRateLimit("b2b-create", ipHash);

    return NextResponse.json({ ok: true, id }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/b2b/projects POST", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}

/**
 * PATCH /api/b2b/projects — saját projekt lezárása ({ id }).
 * A szerzőség-ellenőrzés a repo WHERE author_id=? feltételében van (idegen
 * projektet nem lehet lezárni). PRO nem feltétel: a saját posztját bárki lezárhatja.
 */
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
    }
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const id = str(body.id);
    if (!id) {
      return NextResponse.json({ error: "Hiányzó projekt-azonosító." }, { status: 400 });
    }
    const ok = await closeB2bProject(id, userId);
    if (!ok) {
      return NextResponse.json(
        { error: "A projekt nem található, vagy nem a tiéd." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("api/b2b/projects PATCH", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}
