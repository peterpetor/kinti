import { NextResponse, type NextRequest } from "next/server";
import { getMediaBucket, getCloudflareCtx } from "@/lib/cloudflare";
import { notifyAdminContentPending } from "@/lib/admin-notify";
import { getPublishedStories, createStory, countStoriesByIp } from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { hashIp } from "@/lib/security";
import { containsProfanity } from "@/lib/profanity";
import { isValidCountry } from "@/lib/countries";
import { storySlug, storyExcerpt } from "@/lib/story-md";
import { moderateImage } from "@/lib/moderation";
import { extForContentType } from "@/lib/r2";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const DAILY_IP_LIMIT = 2;
const MIN_BODY_LENGTH = 400;
const MAX_BODY_LENGTH = 20_000;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** GET /api/tortenetek?country=AT — publikált történetek (kliens-szűrőhöz). */
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("country");
  const country = isValidCountry(c) ? c : null;
  const stories = await getPublishedStories(country);
  return NextResponse.json({ stories }, { headers: { "cache-control": "public, max-age=120" } });
}

/**
 * POST /api/tortenetek — új élettörténet beküldése (admin-moderált).
 *
 * FormData: title, authorName, country, city?, bodyMd, contactEmail?,
 * turnstileToken, image? (opcionális borítókép ≤ 2 MB).
 *
 * Védelmek: Turnstile + blocklist + 2 beküldés/nap/IP + profanity + hossz-kapuk
 * (a ≥400 karakter a thin-content ellen is véd) + AI kép-moderáció. A kép a
 * stories/<uuid>/ prefixre kerül; elutasításkor a decide route törli.
 */
export async function POST(req: Request) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Érvénytelen űrlap." }, { status: 400 });
    }

    const str = (k: string, max: number) => {
      const v = form.get(k);
      return typeof v === "string" ? v.trim().slice(0, max) : "";
    };
    const title = str("title", 120);
    const authorName = str("authorName", 60);
    const country = str("country", 2);
    const city = str("city", 60);
    const bodyMd = str("bodyMd", MAX_BODY_LENGTH + 1);
    const contactEmail = str("contactEmail", 160).toLowerCase();
    const turnstileToken = str("turnstileToken", 4000);

    if (!isValidCountry(country)) return NextResponse.json({ error: "Ismeretlen ország." }, { status: 400 });
    if (title.length < 10) return NextResponse.json({ error: "Adj a történetednek címet (min. 10 karakter)." }, { status: 400 });
    if (authorName.length < 2) return NextResponse.json({ error: "Add meg a neved vagy beceneved." }, { status: 400 });
    if (bodyMd.length < MIN_BODY_LENGTH) {
      return NextResponse.json(
        { error: `Írj kicsit hosszabban (legalább ${MIN_BODY_LENGTH} karakter) — a jó történet a részletekben él.` },
        { status: 400 },
      );
    }
    if (bodyMd.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: `A történet legfeljebb ${MAX_BODY_LENGTH.toLocaleString("hu-HU")} karakter lehet.` }, { status: 400 });
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });
    }
    for (const t of [title, authorName, city, bodyMd]) {
      if (t && containsProfanity(t).hit) return NextResponse.json({ error: "Nem megfelelő szöveg." }, { status: 400 });
    }

    const ip = req.headers.get("cf-connecting-ip") ?? null;
    const captcha = await verifyTurnstile(turnstileToken, ip);
    if (!captcha.ok) return NextResponse.json({ error: "A robot-ellenőrzés sikertelen." }, { status: 400 });

    const banned = await checkBlocklistOrReject({ ip, email: contactEmail || null });
    if (banned) return banned;

    const ipHash = await hashIp(ip);
    if ((await countStoriesByIp(ipHash)) >= DAILY_IP_LIMIT) {
      return NextResponse.json({ error: "Ma már beküldtél történetet. Próbáld holnap." }, { status: 429 });
    }

    // ── Opcionális borítókép → R2 (méret-kapu + AI-moderáció) ────────────────
    let imageKey: string | null = null;
    const image = form.get("image");
    if (image instanceof File && image.size > 0) {
      if (image.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: "A kép legfeljebb 2 MB lehet." }, { status: 413 });
      }
      const ext = extForContentType(image.type);
      if (!ext) {
        return NextResponse.json({ error: "Nem támogatott képtípus (JPEG, PNG, WebP, GIF)." }, { status: 415 });
      }
      const buf = await image.arrayBuffer();
      const moderation = await moderateImage(buf);
      if (moderation.action === "block") {
        return NextResponse.json({ error: "A képet nem tudjuk elfogadni." }, { status: 400 });
      }
      imageKey = `stories/${crypto.randomUUID()}.${ext}`;
      await getMediaBucket().put(imageKey, buf, {
        httpMetadata: { contentType: image.type },
      });
    }

    const storyInput = {
      title, authorName, country, city: city || null,
      // Kivonat a kártyákhoz + meta descriptionhöz (a törzs első mondataiból).
      summary: storyExcerpt(bodyMd, 200), bodyMd, imageKey,
      contactEmail: contactEmail || null, ipHash: ipHash ?? "unknown-ip",
    };
    try {
      try {
        await createStory({ ...storyInput, slug: storySlug(title) });
      } catch {
        // Slug-ütközés a UNIQUE-on (valószínűtlen, de lehetséges) → egyszeri
        // retry ÚJ random utótaggal, ne 500-at kapjon a beküldő.
        await createStory({ ...storyInput, slug: storySlug(title) });
      }
    } catch (insertErr) {
      // Az insert végleg elbukott → a már feltöltött borítókép ne maradjon
      // orphan-fájlként az R2-ben.
      if (imageKey) await getMediaBucket().delete(imageKey).catch(() => { /* silent */ });
      throw insertErr;
    }

    // Azonnali admin-értesítő (best-effort) — a 24 órás moderációs ígéret motorja.
    const notify = notifyAdminContentPending({
      contentType: "élettörténet",
      title,
      preview: storyExcerpt(bodyMd, 300),
      submitterEmail: contactEmail || null,
    });
    const ctx = getCloudflareCtx();
    if (ctx) ctx.waitUntil(notify); else await notify;

    return NextResponse.json({
      ok: true,
      message: "Köszönjük! A történeted szerkesztői ellenőrzés után jelenik meg — ha megadtad az e-mail-címed, szólunk.",
    });
  } catch (err) {
    safeLogError("api/tortenetek", err);
    return NextResponse.json({ error: "Belső hiba. Próbáld újra később." }, { status: 500 });
  }
}
