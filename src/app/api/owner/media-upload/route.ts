import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner } from "@/lib/repo";
import { extForContentType, presignR2Put } from "@/lib/r2";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/media-upload  — védett (Clerk).
 *
 * Bemenet: { contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }
 * Kimenet: { uploadUrl, key, expiresAt, bucket }
 *
 * Logikailag:
 *  1) Bejelentkezett felhasználó megkeresi a SAJÁT vállalkozását (owner_user_id).
 *  2) Validáljuk a content-type-ot → csak engedélyezett képtípus.
 *  3) A kulcs `logos/<businessId>/<uuid>.<ext>` formátumú; a businessId prefix
 *     azt szolgálja, hogy a commit-végpontnál ellenőrizhető legyen: a kliens
 *     ne tudjon „másik vállalkozás” kulcsát commit-olni a sajátja helyett.
 *  4) Aláírt PUT URL → 5 percig érvényes, a kliens egyetlen PUT-tal feltölt.
 *
 * A commit (D1-mentés) külön végponton történik, hogy SOHA ne jelenjen meg
 * éles logo_key D1-ben olyan kulcsra, amit a kliens elindított, de meg sem
 * érkezett az R2-be.
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
  if (contentLength === null || !Number.isFinite(contentLength) || contentLength <= 0) {
    return NextResponse.json(
      { error: "Érvénytelen vagy hiányzó fájlméret." },
      { status: 400 },
    );
  }
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (contentLength > MAX_SIZE) {
    return NextResponse.json(
      { error: "A fájlméret túl nagy. Maximum 10 MB." },
      { status: 400 },
    );
  }

  const key = `logos/${business.id}/${crypto.randomUUID()}.${ext}`;

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
    safeLogError("owner/media-upload", err);
    return NextResponse.json({ error: "Belső hiba." }, { status: 500 });
  }
}
