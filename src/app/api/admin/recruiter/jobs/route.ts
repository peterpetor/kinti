import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { searchAdzunaJobs } from "@/lib/adzuna";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/recruiter/jobs?country=AT&q=Maler — VALÓDI állás-listák
 * (Adzuna aggregátor-API) a közvetítő-keresőhöz. Admin-only.
 */
export async function GET(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const sp = new URL(req.url).searchParams;
  const country = sp.get("country") ?? "AT";
  const q = sp.get("q") ?? "";

  try {
    const { jobs, configured } = await searchAdzunaJobs(country, q, 20);
    return NextResponse.json({ jobs, configured }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    safeLogError("[admin/recruiter/jobs]", err);
    return NextResponse.json({ jobs: [], configured: true, error: "internal" }, { status: 500 });
  }
}
