import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { presignR2Put } from "@/lib/r2";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/recruiter/cv-upload — admin presigned PUT egy jelölt CV-jéhez.
 * A kulcs `cv/recruiting/<uuid>.pdf` — a `cv/` prefix miatt a publikus média-
 * route nem szolgálja ki; csak az admin CV-route adja vissza.
 * Bemenet: { contentLength }. Kimenet: { uploadUrl, key, ... }.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { contentLength?: unknown };
  const contentLength = typeof body.contentLength === "number" ? body.contentLength : null;
  if (contentLength === null || !Number.isFinite(contentLength) || contentLength <= 0) {
    return NextResponse.json({ error: "Érvénytelen fájlméret." }, { status: 400 });
  }
  if (contentLength > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "A fájl túl nagy. Maximum 10 MB." }, { status: 400 });
  }

  const key = `cv/recruiting/${crypto.randomUUID()}.pdf`;
  try {
    const presigned = await presignR2Put(key, { expiresSeconds: 300, contentType: "application/pdf", contentLength });
    return NextResponse.json(presigned, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("admin/recruiter/cv-upload", err);
    return NextResponse.json({ error: "Belső hiba a feltöltés előkészítésekor." }, { status: 500 });
  }
}
