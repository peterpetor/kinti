import { NextResponse, type NextRequest } from "next/server";
import { getBusinesses } from "@/lib/repo";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/businesses?category=fodrasz&featured=1
export async function GET(req: NextRequest) {
  // Scrape-védelem: a valódi szaknévsor-lista SSR-ből érkezik, ezt a tömeges
  // JSON-dumpot user gyakorlatilag nem hívja → szűk IP/óra limit a botok ellen.
  // A payload amúgy is érzékeny-mező-mentes (getBusinesses → toPublicBusiness).
  const ipHash = await hashIp(req.headers.get("cf-connecting-ip") ?? null);
  const rl = await checkAiRateLimit("businesses-list", ipHash);
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const businesses = await getBusinesses({
    category: searchParams.get("category"),
    featured: searchParams.get("featured") === "1",
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
  });
  await logAiRateLimit("businesses-list", ipHash);
  return NextResponse.json({ businesses }, { headers: { "cache-control": "no-store" } });
}
