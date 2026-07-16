import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getHousingListings,
  createHousingListing,
  countRecentHousingByUser,
  deleteOwnHousingListing,
} from "@/lib/repo";
import { validateHousingInput } from "@/lib/housing";
import { isValidCountry } from "@/lib/countries";
import { containsProfanity } from "@/lib/profanity";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { notifyAdminContentPending } from "@/lib/admin-notify";
import { getCloudflareCtx } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const DAILY_USER_LIMIT = 3;

/** GET /api/housing?country=CH — aktív hirdetések (kontakt NÉLKÜL). */
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("country");
  const country = isValidCountry(c) ? c : null;
  const { userId } = await auth();
  const listings = await getHousingListings(country, userId);
  return NextResponse.json({ listings }, { headers: { "cache-control": "no-store" } });
}

/**
 * POST /api/housing — új lakhatási hirdetés. CSAK bejelentkezve (a hirdetés a
 * Clerk-fiókhoz kötődik — elszámoltathatóság + napi limit). A kontaktot a
 * válasz sem adja vissza; azt csak a PRO-gated /api/housing/contact fedi fel.
 * Body: { type, country, city, price, currency, description, contact, consent }.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "A hirdetés feladásához jelentkezz be." }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 }); }

  const v = validateHousingInput(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  for (const t of [v.value.city, v.value.description, v.value.contact]) {
    if (containsProfanity(t).hit) {
      return NextResponse.json({ error: "Nem megfelelő szöveg." }, { status: 400 });
    }
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const banned = await checkBlocklistOrReject({ ip, email: null });
  if (banned) return banned;

  if ((await countRecentHousingByUser(userId)) >= DAILY_USER_LIMIT) {
    return NextResponse.json({ error: "Ma már több hirdetést adtál fel. Próbáld holnap." }, { status: 429 });
  }

  const id = await createHousingListing({ ...v.value, userId });

  // Azonnali admin-értesítő (best-effort): a hirdetés MODERÁLT (0134) — a
  // lakhatási hirdetés időérzékeny, ezért a jóváhagyás ne a napi emlékeztetőn
  // múljon: minden beküldésről azonnali email megy az adminnak.
  const notify = notifyAdminContentPending({
    contentType: "albérlet-hirdetés",
    title: `${v.value.city} (${v.value.country}) — ${v.value.price} ${v.value.currency}/hó`,
    preview: v.value.description.slice(0, 200),
    submitterEmail: null,
  });
  const ctx = getCloudflareCtx();
  if (ctx) ctx.waitUntil(notify); else await notify;

  return NextResponse.json({ ok: true, id, message: "Köszönjük! A hirdetést jóváhagyás után tesszük közzé." });
}

/** DELETE /api/housing?id=… — saját hirdetés levétele (csak a feladó). */
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Jelentkezz be." }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) return NextResponse.json({ error: "Hiányzó azonosító." }, { status: 400 });
  const deleted = await deleteOwnHousingListing(id, userId);
  if (!deleted) return NextResponse.json({ error: "Nem található a saját hirdetéseid között." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
