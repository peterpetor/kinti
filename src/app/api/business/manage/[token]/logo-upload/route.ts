import { NextResponse } from "next/server";
import { getBusinessByManageToken } from "@/lib/repo";
import { extForContentType, presignR2Put } from "@/lib/r2";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/business/manage/[token]/logo-upload
 *
 * Email-only logó-feltöltés első lépése: presigned R2 PUT URL kérése.
 * Auth nincs — a manage_token MAGA a bizonyíték (a confirmáló e-mailben kapta).
 *
 * Bemenet: { contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }
 * Kimenet: { uploadUrl, key, expiresAt, bucket }
 *
 * A kulcs `logos/<businessId>/<uuid>.<ext>` — a commit-végpont ezen prefixet
 * ellenőrzi, hogy a kliens ne tudjon más vállalkozás kulcsát commit-olni.
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { contentType?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : null;
  const ext = extForContentType(contentType);
  if (!ext) {
    return NextResponse.json(
      { error: "Nem támogatott képtípus. Engedélyezett: JPEG, PNG, WebP, GIF." },
      { status: 415 },
    );
  }

  const key = `logos/${business.id}/${crypto.randomUUID()}.${ext}`;

  try {
    const presigned = await presignR2Put(key, { expiresSeconds: 300, contentType: contentType! });
    return NextResponse.json(presigned, {
      headers: { "cache-control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ismeretlen hiba.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
