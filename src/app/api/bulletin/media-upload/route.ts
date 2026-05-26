import { NextResponse } from "next/server";
import { extForContentType, presignR2Put } from "@/lib/r2";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/bulletin/media-upload  — nyilvános (hirdetés-képek feltöltéséhez).
 *
 * Bemenet: { contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }
 * Kimenet: { uploadUrl, key, expiresAt, bucket }
 *
 * Logikailag:
 *  1) Validáljuk a content-type-ot → csak engedélyezett képtípus.
 *  2) A kulcs `bulletin-images/<uuid>.<ext>` formátumú.
 *  3) Aláírt PUT URL → 5 percig érvényes, a kliens közvetlenül az R2-be tölt fel.
 */
export async function POST(req: Request) {
  let body: { contentType?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : null;
  const ext = extForContentType(contentType);
  if (!ext) {
    return NextResponse.json(
      { error: "Nem támogatott képtípus. Engedélyezett: JPEG, PNG, WebP, GIF." },
      { status: 415 },
    );
  }

  const key = `bulletin-images/${crypto.randomUUID()}.${ext}`;

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
