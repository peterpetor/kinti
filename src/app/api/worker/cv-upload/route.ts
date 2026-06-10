import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { presignR2Put } from "@/lib/r2";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/worker/cv-upload — védett (Clerk).
 *
 * Presigned PUT URL egy CV PDF feltöltéséhez R2-be. A kulcs `cv/<userId>/<uuid>.pdf`
 * formátumú; a userId-prefix biztosítja, hogy a profil-mentésnél ellenőrizhető:
 * a kliens csak a SAJÁT kulcsát adhatja meg cv_key-ként.
 *
 * Bemenet: { contentLength: number }   (a típus mindig application/pdf)
 * Kimenet: { uploadUrl, key, expiresAt, bucket }
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  let body: { contentLength?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const contentLength = typeof body.contentLength === "number" ? body.contentLength : null;
  if (contentLength === null || !Number.isFinite(contentLength) || contentLength <= 0) {
    return NextResponse.json({ error: "Érvénytelen vagy hiányzó fájlméret." }, { status: 400 });
  }
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (contentLength > MAX_SIZE) {
    return NextResponse.json({ error: "A fájl túl nagy. Maximum 10 MB." }, { status: 400 });
  }

  const key = `cv/${userId}/${crypto.randomUUID()}.pdf`;

  try {
    const presigned = await presignR2Put(key, {
      expiresSeconds: 300,
      contentType: "application/pdf",
      contentLength,
    });
    return NextResponse.json(presigned, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("worker/cv-upload", err);
    return NextResponse.json({ error: "Belső hiba a feltöltés előkészítésekor." }, { status: 500 });
  }
}
