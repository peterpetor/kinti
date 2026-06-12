import { NextResponse } from "next/server";
import { getBusinessByManageToken, removeBusinessGalleryKey } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/business/manage/[token]/gallery-remove
 *
 * Töröl egy képet a vizuális portfólióból:
 *   1) D1 — a key kivétele a galleryKeys JSON-tömbből
 *   2) R2 — a fájl tényleges törlése a bucketből (orphan cleanup)
 */
export async function DELETE(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!business.featured) {
    return NextResponse.json({ error: "Ez a funkció csak Szaknévsor PRO tagoknak elérhető." }, { status: 403 });
  }

  let body: { key?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { key } = body;
  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "missing_key" }, { status: 400 });
  }

  // Biztonsági ellenőrzés — csak saját business gallery prefix
  const expectedPrefix = `gallery/${business.id}/`;
  if (!key.startsWith(expectedPrefix) || key.includes("..")) {
    return NextResponse.json({ error: "unauthorized_key" }, { status: 403 });
  }

  // 1) D1 — referencia törlése
  const success = await removeBusinessGalleryKey(business.id, key);
  if (!success) {
    return NextResponse.json({ error: "DB hiba." }, { status: 500 });
  }

  // 2) R2 — fizikai fájl törlése (orphan storage cleanup).
  //    Silent catch: ha a fájl már nincs ott, ne bukjon el a kérés.
  await getMediaBucket().delete(key).catch(() => { /* silent */ });

  return NextResponse.json({ success: true }, { headers: { "cache-control": "no-store" } });
}
