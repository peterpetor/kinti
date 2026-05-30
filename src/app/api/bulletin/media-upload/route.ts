import { NextResponse } from "next/server";
import { extForContentType, presignR2Put } from "@/lib/r2";
import { safeLogError } from "@/lib/safe-log";

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
  let body: { contentType?: unknown; contentLength?: unknown } = {};
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

  const contentLength = typeof body.contentLength === "number" ? body.contentLength : null;
  if (contentLength === null || Number.isNaN(contentLength) || contentLength <= 0) {
    return NextResponse.json(
      { error: "Érvénytelen vagy hiányzó fájlméret." },
      { status: 400 },
    );
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (contentLength > MAX_SIZE) {
    return NextResponse.json(
      { error: "A fájlméret túl nagy. A megengedett maximális méret 5 MB." },
      { status: 400 },
    );
  }

  const key = `bulletin-images/${crypto.randomUUID()}.${ext}`;

  try {
    const presigned = await presignR2Put(key, {
      expiresSeconds: 300,
      contentType: contentType!,
      contentLength,
    });
    return NextResponse.json(presigned, {
      headers: { "cache-control": "no-store" },
    });
  } catch (err) {
    safeLogError("bulletin/media-upload", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
