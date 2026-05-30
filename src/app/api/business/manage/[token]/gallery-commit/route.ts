import { NextResponse } from "next/server";
import { getBusinessByManageToken, addBusinessGalleryKey } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";
import { moderateImage } from "@/lib/moderation";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/business/manage/[token]/gallery-commit
 *
 * Miután a kliens feltöltötte a képet a presigned URL-re, ide szól, hogy
 * "kész, frissítsd a DB-t!".
 *
 * Biztonság:
 * 1) A manage_token garantálja a jogosultságot.
 * 2) A `key`-nek a `gallery/<businessId>/` prefixszel kell kezdődnie.
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
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

  // 1) Prefix-ellenőrzés: csak a sajátját commitolhatja
  if (!key.startsWith(`gallery/${business.id}/`)) {
    return NextResponse.json({ error: "unauthorized_key" }, { status: 403 });
  }

  // 2) Tényleg ott van-e az R2-ben? (Ne lehessen átverni minket egy létező idegen fájllal)
  const head = await getMediaBucket().head(key);
  if (!head) {
    return NextResponse.json({ error: "Fájl nem található az R2-ben." }, { status: 400 });
  }

  const MAX_BYTES = 2 * 1024 * 1024;
  if (typeof head.size === "number" && head.size > MAX_BYTES) {
    await getMediaBucket().delete(key).catch(() => { /* silent */ });
    return NextResponse.json(
      { error: "A fájl mérete max. 2 MB lehet." },
      { status: 413 },
    );
  }

  // Kép moderáció Cloudflare Workers AI-val
  const obj = await getMediaBucket().get(key);
  if (!obj) {
    return NextResponse.json(
      { error: "A kép nem tölthető be a moderációhoz." },
      { status: 404 },
    );
  }
  const arrayBuffer = await obj.arrayBuffer();
  const moderation = await moderateImage(arrayBuffer);
  if (!moderation.safe) {
    await getMediaBucket().delete(key).catch(() => { /* silent */ });
    return NextResponse.json(
      { error: moderation.reason || "A kép moderációs okokból elutasításra került." },
      { status: 400 },
    );
  }

  // 3) DB mentés
  const success = await addBusinessGalleryKey(business.id, key);
  if (!success) {
    return NextResponse.json({ error: "DB hiba." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { headers: { "cache-control": "no-store" } });
}
