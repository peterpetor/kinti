import { NextResponse } from "next/server";
import { getBusinessByManageToken, removeBusinessGalleryKey } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/business/manage/[token]/gallery-remove
 *
 * Töröl egy képet a vizuális portfólióból.
 */
export async function DELETE(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
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

  // Biztonsági ellenőrzés
  if (!key.startsWith(`gallery/${business.id}/`)) {
    return NextResponse.json({ error: "unauthorized_key" }, { status: 403 });
  }

  // Megjegyzés: Az R2-ből fizikailag is törölhetnénk, de a D1 mentés a legfontosabb.
  // A deleteR2Object-hez jelenleg nincs külön segédfüggvény, így egyelőre csak
  // a DB-ből szedjük ki (árvahivatkozás marad, de nem probléma, az R2 bucket policy
  // majd törölheti a nem hivatkozott fájlokat vagy egyszerűen elfér).
  // Ha később implementáljuk a deleteR2Object-et, ide be lehet rakni.

  const success = await removeBusinessGalleryKey(business.id, key);
  if (!success) {
    return NextResponse.json({ error: "DB hiba." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { headers: { "cache-control": "no-store" } });
}
