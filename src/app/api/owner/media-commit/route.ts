import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessByOwner, setBusinessLogo } from "@/lib/repo";
import { getMediaBucket } from "@/lib/cloudflare";
import { moderateImage } from "@/lib/moderation";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/media-commit  — védett (Clerk).
 *
 * Bemenet: { key: "logos/<businessId>/<uuid>.<ext>" }
 * Kimenet: { ok: true, logoKey }
 *
 * Mit ellenőrzünk?
 *  1) Authentikált user → saját vállalkozás. Nincs idegen logo_key.
 *  2) A kulcs prefixe pontosan a saját vállalkozásé. Így a kliens nem tud
 *     másik tulajdonos kulcsát „belökni” a sajátja helyett.
 *  3) Az objektum LÉTEZIK az R2-ben (`MEDIA.head(key)`). Csak akkor mentünk
 *     a D1-be, ha a feltöltés ténylegesen sikerült — különben hivatkozhatnánk
 *     nem létező kulcsra.
 *
 * Csak ezután frissítjük a `businesses.logo_key` mezőt; a repo `setBusinessLogo`
 * is owner-szűréssel UPDATE-el, így dupla védelem.
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

  let body: { key?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
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

  // A régi logót töröljük R2-ből — különben halmozódnának az orphan fájlok.
  const previousKey = business.logoKey;

  const ok = await setBusinessLogo(business.id, userId, key);
  if (!ok) {
    return NextResponse.json({ error: "A frissítés nem sikerült." }, { status: 500 });
  }

  if (previousKey && previousKey !== key && previousKey.startsWith(expectedPrefix)) {
    await getMediaBucket().delete(previousKey).catch(() => { /* silent */ });
  }

  return NextResponse.json(
    { ok: true, logoKey: key },
    { headers: { "cache-control": "no-store" } },
  );
}
