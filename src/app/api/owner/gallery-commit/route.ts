import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, addBusinessGalleryKey } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";
import { moderateImage } from "@/lib/moderation";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/gallery-commit  — védett (Clerk).
 *
 * Bemenet: { key: "gallery/<businessId>/<uuid>.<ext>" }
 * Kimenet: { ok: true, key }
 *
 * Mit ellenőrzünk?
 *  1) Authentikált user → saját vállalkozás. Nincs idegen key.
 *  2) A kulcs prefixe pontosan a saját vállalkozásé.
 *  3) Csak PRO tagok!
 *  4) Az objektum LÉTEZIK az R2-ben (`MEDIA.head(key)`).
 *
 * Csak ezután adjuk hozzá a `businesses.gallery_keys` tömbhöz.
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

  if (!business.featured) {
    return NextResponse.json({ error: "Ez a funkció csak Szaknévsor PRO tagoknak elérhető." }, { status: 403 });
  }


  let body: { key?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key : "";
  const expectedPrefix = `gallery/${business.id}/`;
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
  // Méret-védelem: csak <= 2 MB-os képet fogadunk el (Storage abuse ellen).
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
  if (moderation.action === "block") {
    await getMediaBucket().delete(key).catch(() => { /* silent */ });
    return NextResponse.json(
      { error: moderation.reason || "A kép moderációs okokból elutasításra került." },
      { status: 400 },
    );
  }

  const ok = await addBusinessGalleryKey(business.id, key);
  if (!ok) {
    return NextResponse.json({ error: "A galéria frissítése nem sikerült." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, key },
    { headers: { "cache-control": "no-store" } },
  );
}
