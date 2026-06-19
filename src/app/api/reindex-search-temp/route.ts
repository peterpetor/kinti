import { NextResponse } from "next/server";
import { getBusinesses } from "@/lib/repo";
import { upsertBusinessVectors } from "@/lib/vector-search";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== "kinti-temp-reindex-123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businesses = await getBusinesses();
  const indexed = await upsertBusinessVectors(businesses);
  return NextResponse.json({ ok: true, total: businesses.length, indexed });
}
