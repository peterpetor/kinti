import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, removeBusinessGalleryKey } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/owner/gallery-delete  — védett (Clerk).
 *
 * Bemenet: { key: "gallery/<businessId>/<uuid>.<ext>" }
 * Kimenet: { ok: true }
 */
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  const business = await getBusinessByOwner(userId);
  if (!business) {
    return NextResponse.json({ error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
  }

  if (!business.featured) {
    return NextResponse.json({ error: "Ez a funkció csak Szaknévsor PRO tagoknak elérhető." }, { status: 403 });
  }


  let body: { key?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key : "";
  const expectedPrefix = `gallery/${business.id}/`;
  if (!key.startsWith(expectedPrefix) || key.includes("..")) {
    return NextResponse.json({ error: "Érvénytelen kulcs." }, { status: 400 });
  }

  // Töröljük a DB-ből
  const ok = await removeBusinessGalleryKey(business.id, key);
  if (!ok) {
    return NextResponse.json({ error: "A galéria frissítése nem sikerült." }, { status: 500 });
  }

  // Töröljük az R2-ből
  await getMediaBucket().delete(key).catch(() => { /* silent */ });

  return NextResponse.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}
