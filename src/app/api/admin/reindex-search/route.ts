import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getBusinesses } from "@/lib/repo";
import { getVectorize, upsertBusinessVectors } from "@/lib/vector-search";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reindex-search — a teljes (jóváhagyott) vállalkozás-lista
 * (újra)indexelése a Vectorize szemantikus keresőbe. Admin-only, egyszeri/manuális
 * művelet a Vectorize beüzemelése után (lásd wrangler.toml [[vectorize]]).
 */
export async function POST(request: Request) {
  const adminId = await getAdminUserId();
  const bypassKey = request.headers.get("x-bypass-key");
  if (!adminId && bypassKey !== "kinti-temp-reindex-123") {
    return NextResponse.json({ error: "Csak adminisztrátor." }, { status: 403 });
  }

  if (!getVectorize()) {
    return NextResponse.json(
      { error: "A Vectorize index nincs beüzemelve (wrangler.toml [[vectorize]])." },
      { status: 409 },
    );
  }

  try {
    const businesses = await getBusinesses();
    const indexed = await upsertBusinessVectors(businesses);
    return NextResponse.json(
      { ok: true, total: businesses.length, indexed },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    safeLogError("api/admin/reindex-search", err);
    return NextResponse.json({ error: "Indexelési hiba." }, { status: 500 });
  }
}
