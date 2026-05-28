import { NextResponse } from "next/server";
import { getBusinessByManageToken, setBusinessLogoByManageToken } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/business/manage/[token]/logo-commit
 *
 * Email-only logó-commit: az R2-be feltöltött kulcs mentése a businesses.logo_key-be.
 *
 * Bemenet: { key: "logos/<businessId>/<uuid>.<ext>" }
 * Kimenet: { ok: true, logoKey }
 *
 * Védelmek:
 *  1) manage_token → létező business
 *  2) Kulcs prefixe pontosan a saját businessId-vel kezdődik
 *  3) Az R2-objektum LÉTEZIK (`MEDIA.head(key)`) — különben nem mentünk
 *     hivatkozást nem létező fájlra
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { key?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key : "";
  const expectedPrefix = `logos/${business.id}/`;
  if (!key.startsWith(expectedPrefix) || key.includes("..")) {
    return NextResponse.json({ error: "Érvénytelen kulcs." }, { status: 400 });
  }

  const head = await getMediaBucket().head(key);
  if (!head) {
    return NextResponse.json(
      { error: "Az R2-objektum nem található. Töltsd fel előbb a fájlt." },
      { status: 404 },
    );
  }
  // Méret-védelem: csak <= 2 MB-os képet fogadunk el. Ha valaki a presigned URL
  // megszerzésével nagyobbat töltött fel, töröljük az R2-ből és elutasítjuk.
  const MAX_BYTES = 2 * 1024 * 1024;
  if (typeof head.size === "number" && head.size > MAX_BYTES) {
    await getMediaBucket().delete(key).catch(() => { /* silent */ });
    return NextResponse.json(
      { error: "A fájl mérete max. 2 MB lehet." },
      { status: 413 },
    );
  }

  const ok = await setBusinessLogoByManageToken(params.token, key);
  if (!ok) {
    return NextResponse.json({ error: "A frissítés nem sikerült." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, logoKey: key },
    { headers: { "cache-control": "no-store" } },
  );
}
