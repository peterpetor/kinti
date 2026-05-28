import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { setReviewOwnerResponse } from "@/lib/repo";
import { findProfanityInFields } from "@/lib/profanity";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX = 600;

/**
 * POST /api/owner/reviews/[id]/respond — a vállalkozó válasza a véleményre.
 * Body: { response: string | null }
 *
 * Tulajdonos-ellenőrzés a SQL UPDATE-ben: csak akkor ír, ha a kérdéses
 * vélemény vállalkozása valóban a hívó (Clerk userId) tulajdonában van.
 * Üres / null response → a válasz törlése.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const raw = typeof body.response === "string" ? body.response.trim() : "";

  if (raw.length > 0) {
    if (raw.length > MAX) {
      return NextResponse.json(
        { error: `A válasz legfeljebb ${MAX} karakter lehet.` },
        { status: 400 },
      );
    }
    const dirty = findProfanityInFields({ response: raw });
    if (dirty) {
      return NextResponse.json(
        { error: "A válaszod olyan szót tartalmaz, amit nem engedünk. Fogalmazd meg másképp." },
        { status: 400 },
      );
    }
  }

  const ok = await setReviewOwnerResponse(params.id, userId, raw || null);
  if (!ok) {
    return NextResponse.json(
      { error: "Nem található vélemény, vagy nincs jogosultságod a válaszhoz." },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
