import { NextResponse, type NextRequest } from "next/server";
import { getBusinessById, toPublicBusiness, isBlocked } from "@/lib/repo";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { encodeContact } from "@/lib/contact-obfuscate";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/businesses/:id            → a cég publikus adatai, telefonszám NÉLKÜL.
 * GET /api/businesses/:id?contact=1  → CSAK az (elhomályosított) telefonszám,
 *                                      szigorú rate-limittel (reveal-gomb hívja).
 *
 * Scrape-védelem (docs/anti-scraping.md): a nyers telefonszám sose kerül a sima
 * válaszba (a HTML/SSR sem tartalmazza); a botok tömeges szám-leszedését a
 * honeypot-blocklist + a kontakt-végpont IP/óra limitje + az elhomályosítás
 * (megfordítás+Base64) fékezi.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ipHash = await hashIp(req.headers.get("cf-connecting-ip"));
  if (await isBlocked("ip_hash", ipHash)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const wantsContact = new URL(req.url).searchParams.get("contact") === "1";

  // --- Telefonszám-felfedés (reveal) — külön, szigorúbb limit ---
  if (wantsContact) {
    const rl = await checkAiRateLimit("biz-contact", ipHash);
    if (!rl.allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    const business = await getBusinessById(params.id);
    if (!business) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await logAiRateLimit("biz-contact", ipHash);
    const phone = business.phone?.trim() || "";
    return NextResponse.json(
      { phone: phone ? encodeContact(phone) : null },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // --- Sima publikus adat — telefonszám NÉLKÜL ---
  const business = await getBusinessById(params.id);
  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Publikus válasz (érzékeny mezők nélkül) + a nyers telefonszám kiszűrve.
  return NextResponse.json(
    { business: { ...toPublicBusiness(business), phone: null } },
    { headers: { "cache-control": "no-store" } },
  );
}
