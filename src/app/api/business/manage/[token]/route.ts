import { NextResponse } from "next/server";
import {
  deleteBusinessByManageToken,
  getBusinessByManageToken,
  updateBusinessByManageToken,
  type UpdateBusinessFields,
} from "@/lib/repo";
import { BUSINESS_LIMITS } from "@/lib/business";
import { isSwissAddress } from "@/lib/cantons";

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
    if (v && (v.length > BUSINESS_LIMITS.addressMax || !isSwissAddress(v))) {
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
  if ("workingHours" in body) fields.workingHours = str(body.workingHours);
  if ("socialLinks" in body) fields.socialLinks = str(body.socialLinks);

  if ("languages" in body) {
    const v = body.languages;
    if (v === null) fields.languages = null;
    else if (Array.isArray(v)) {
      const arr = v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
      fields.languages = arr;
    } else errors.push({ field: "languages", message: "A languages tömb kell legyen." });
  }

  if (errors.length) {
    return NextResponse.json({ error: "validation", details: errors }, { status: 400 });
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
