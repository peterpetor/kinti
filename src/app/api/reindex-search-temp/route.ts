import { NextResponse } from "next/server";
import { getBusinesses } from "@/lib/repo";
import { upsertBusinessVectors } from "@/lib/vector-search";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const businesses = await getBusinesses();
  const indexed = await upsertBusinessVectors(businesses);
  return NextResponse.json({ ok: true, total: businesses.length, indexed });
}
