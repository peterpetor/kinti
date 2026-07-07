import { NextResponse } from "next/server";
import {
  deleteBusinessByManageToken,
  getBusinessByManageToken,
  updateBusinessByManageToken,
  logModerationStrike,
  type UpdateBusinessFields,
} from "@/lib/repo";
import { BUSINESS_LIMITS } from "@/lib/business";
import { isSwissAddress } from "@/lib/cantons";
import { validateSocialLinks, type SocialLinks } from "@/lib/social-url";
import { moderateText } from "@/lib/text-moderation";
import { applyOwnerResponse } from "@/lib/review-response";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /api/business/manage/<token>
 *
 * GET    — visszaadja a vállalkozás adatait a kezelő UI-nak.
 * PATCH  — módosítja a mezőket (név, leírás, cím, telefon, nyitvatartás, …).
 * DELETE — törli a vállalkozást (cascade: véleményekre).
 *
 * Auth nincs — a token MAGA a bizonyíték (122-bit entrópia, gyakorlatilag
 * brute-force-hatatlan). A confirmáló emailben kapja meg a feladó.
 */

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ business }, { headers: { "cache-control": "no-store" } });
}

/**
 * POST — akció-műveletek a kezelt vállalkozáson. Jelenleg:
 *   { action: "review-response", reviewId, response } — nyilvános tulajdonosi
 *   válasz egy véleményre (üres response = a válasz törlése).
 * (Korábban külön /review-response al-route volt — a deploy edge-route-plafon
 * miatt konszolidálva ide.)
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.action !== "review-response") {
    return NextResponse.json({ error: "Ismeretlen művelet." }, { status: 400 });
  }

  const result = await applyOwnerResponse(business.id, body.reviewId, body.response);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const fields: UpdateBusinessFields = {};
  const errors: { field: string; message: string }[] = [];

  const str = (v: unknown): string | null => {
    if (v === null) return null;
    if (typeof v !== "string") return undefined as never;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };

  if ("name" in body) {
    const n = str(body.name);
    if (!n || n.length < BUSINESS_LIMITS.nameMin || n.length > BUSINESS_LIMITS.nameMax) {
      errors.push({ field: "name", message: `A név ${BUSINESS_LIMITS.nameMin}–${BUSINESS_LIMITS.nameMax} karakter között.` });
    } else fields.name = n;
  }

  if ("categoryLabel" in body) {
    const v = str(body.categoryLabel);
    if (v && v.length > BUSINESS_LIMITS.labelMax) {
      errors.push({ field: "categoryLabel", message: `Legfeljebb ${BUSINESS_LIMITS.labelMax} karakter.` });
    } else fields.categoryLabel = v;
  }

  if ("address" in body) {
    const v = str(body.address);
    // A szigorú svájci cím-formátum csak CH-ban kötelező; AT/DE/NL: szabad szöveg.
    if (v && (v.length > BUSINESS_LIMITS.addressMax || (business.country === "CH" && !isSwissAddress(v)))) {
      errors.push({ field: "address", message: "Csak svájci cím adható meg (pl. 8001 Zürich)." });
    } else fields.address = v;
  }

  if ("phone" in body) {
    const v = str(body.phone);
    if (v && v.length > BUSINESS_LIMITS.phoneMax) {
      errors.push({ field: "phone", message: `Legfeljebb ${BUSINESS_LIMITS.phoneMax} karakter.` });
    } else fields.phone = v;
  }

  if ("blurb" in body) {
    const v = str(body.blurb);
    if (v && v.length > BUSINESS_LIMITS.blurbMax) {
      errors.push({ field: "blurb", message: `Legfeljebb ${BUSINESS_LIMITS.blurbMax} karakter.` });
    } else fields.blurb = v;
  }

  if ("openText" in body) fields.openText = str(body.openText);
  if ("workingHours" in body) {
    const wh = str(body.workingHours);
    // A tárolt string parse-olható JSON kell legyen, ésszerű hosszkorláttal —
    // különben a megjelenítő réteg (lib/hours) hibás alakon elhasalhatna. NULL =
    // törlés (vissza a default nyitvatartásra).
    if (wh === null) {
      fields.workingHours = null;
    } else if (wh.length > 2000) {
      errors.push({ field: "workingHours", message: "A nyitvatartási adatok túl hosszúak." });
    } else {
      try {
        JSON.parse(wh);
        fields.workingHours = wh;
      } catch {
        errors.push({ field: "workingHours", message: "Érvénytelen nyitvatartás-formátum." });
      }
    }
  }
  if ("socialLinks" in body) {
    const raw = str(body.socialLinks);
    if (raw === null) {
      fields.socialLinks = null;
    } else {
      try {
        const parsed = JSON.parse(raw) as Partial<SocialLinks>;
        const cleaned = validateSocialLinks(parsed);
        fields.socialLinks = cleaned ? JSON.stringify(cleaned) : null;
      } catch {
        errors.push({
          field: "socialLinks",
          message: "Érvénytelen közösségi linkek formátum.",
        });
      }
    }
  }

  if ("languages" in body) {
    const v = body.languages;
    if (v === null) fields.languages = null;
    else if (Array.isArray(v)) {
      const arr = v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
      fields.languages = arr;
    } else errors.push({ field: "languages", message: "A languages tömb kell legyen." });
  }

  if ("leadOptOut" in body) {
    fields.leadOptOut = body.leadOptOut === true || body.leadOptOut === 1;
  }

  // Kinti Pass (elfogadóhely + ajánlat) — Szaknévsor PRO funkció, SZERVER-oldali
  // gate: nem-PRO kliens hiába küldi, elutasítjuk (a UI paywall csak előnézet).
  if ("kintiPassActive" in body || "kintiPassOffer" in body) {
    if (!business.featured) {
      return NextResponse.json({ error: "pro_required" }, { status: 403 });
    }
    if ("kintiPassActive" in body) {
      fields.kintiPassActive = body.kintiPassActive === true || body.kintiPassActive === 1;
    }
    if ("kintiPassOffer" in body) {
      const v = str(body.kintiPassOffer);
      if (v && v.length > BUSINESS_LIMITS.passOfferMax) {
        errors.push({ field: "kintiPassOffer", message: `Legfeljebb ${BUSINESS_LIMITS.passOfferMax} karakter.` });
      } else fields.kintiPassOffer = v;
    }
    // Kikapcsolt Pass mellett ne maradjon árva ajánlat-szöveg a publikus felületen.
    if (fields.kintiPassActive === false && fields.kintiPassOffer === undefined) {
      fields.kintiPassOffer = null;
    }
  }

  if (errors.length) {
    return NextResponse.json({ error: "validation", details: errors }, { status: 400 });
  }

  // AI szöveg-moderáció a frissített tartalmon (fail-open):
  // a tulajdonos a profil-frissítés során is felülírhatná a leírást, ezért
  // ugyanúgy szűrjük mint a submit-en.
  const updatedTextParts: string[] = [];
  if (fields.name) updatedTextParts.push(fields.name);
  if (fields.blurb) updatedTextParts.push(fields.blurb);
  if (fields.kintiPassOffer) updatedTextParts.push(fields.kintiPassOffer);
  if (updatedTextParts.length > 0) {
    const textMod = await moderateText(updatedTextParts.join("\n"));
    if (textMod.action === "block") {
      const { hashIp } = await import("@/lib/security");
      const ip = req.headers.get("cf-connecting-ip") ?? null;
      const ipHash = await hashIp(ip);
      await logModerationStrike(ipHash, "Business edit text moderation failed: " + textMod.reason);
      return NextResponse.json(
        {
          error:
            textMod.reason ||
            "A módosított leírás nem felel meg a közösségi irányelveknek.",
        },
        { status: 400 },
      );
    }
  }

  const ok = await updateBusinessByManageToken(params.token, fields);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const updated = await getBusinessByManageToken(params.token);
  return NextResponse.json(
    { business: updated },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function DELETE(_req: Request, { params }: { params: { token: string } }) {
  const ok = await deleteBusinessByManageToken(params.token);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
