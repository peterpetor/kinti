import { NextResponse } from "next/server";
import { getBusinessByManageToken } from "@/lib/repo";
import { extForContentType, presignR2Put } from "@/lib/r2";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/business/manage/[token]/gallery-upload
 *
 * Email-only galéria-feltöltés első lépése: presigned R2 PUT URL kérése.
 *
 * Bemenet: { contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }
 * Kimenet: { uploadUrl, key, expiresAt, bucket }
 *
 * A kulcs `gallery/<businessId>/<uuid>.<ext>`.
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { contentType?: unknown; contentLength?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : null;
  const ext = extForContentType(contentType);
  if (!ext) {
    return NextResponse.json(
      { error: "Nem támogatott fájltípus. Engedélyezett: JPEG, PNG, WebP, GIF, PDF." },
      { status: 415 },
    );
  }

  const contentLength = typeof body.contentLength === "number" ? body.contentLength : null;
  if (contentLength === null || !Number.isFinite(contentLength) || contentLength <= 0) {
    return NextResponse.json(
      { error: "Érvénytelen vagy hiányzó fájlméret." },
      { status: 400 },
    );
  }
  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  if (contentLength > MAX_SIZE) {
    return NextResponse.json(
      { error: "A fájlméret túl nagy. Maximum 20 MB." },
      { status: 400 },
    );
  }

  const key = `gallery/${business.id}/${crypto.randomUUID()}.${ext}`;

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
    safeLogError("gallery-upload", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
