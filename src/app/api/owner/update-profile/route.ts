import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, updateBusinessProfile } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/update-profile  — védett (Clerk).
 *
 * Cél: Vállalkozói profil adatainak frissítése.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  const business = await getBusinessByOwner(userId);
  if (!business) {
    return NextResponse.json({ error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  // Validációk
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const blurb = typeof body.blurb === "string" ? body.blurb.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const categoryLabel = typeof body.categoryLabel === "string" ? body.categoryLabel.trim() : "";
  const openText = typeof body.openText === "string" ? body.openText.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { error: "A név legalább 2 és legfeljebb 100 karakter hosszú legyen." },
      { status: 400 },
    );
  }

  if (phone.length > 30) {
    return NextResponse.json({ error: "A telefonszám legfeljebb 30 karakter lehet." }, { status: 400 });
  }

  if (blurb.length > 500) {
    return NextResponse.json({ error: "A leírás legfeljebb 500 karakter lehet." }, { status: 400 });
  }

  if (address.length > 200) {
    return NextResponse.json({ error: "A cím legfeljebb 200 karakter lehet." }, { status: 400 });
  }

  if (categoryLabel.length > 50) {
    return NextResponse.json(
      { error: "A kategória felülírás legfeljebb 50 karakter lehet." },
      { status: 400 },
    );
  }

  if (openText.length > 100) {
    return NextResponse.json(
      { error: "A nyitvatartás leírása legfeljebb 100 karakter lehet." },
      { status: 400 },
    );
  }

  const ok = await updateBusinessProfile(business.id, userId, {
    name,
    phone: phone || null,
    blurb: blurb || null,
    address: address || null,
    categoryLabel: categoryLabel || null,
    openText: openText || null,
  });

  if (!ok) {
    return NextResponse.json({ error: "Nem sikerült frissíteni a profilt." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}
