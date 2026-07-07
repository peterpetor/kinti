import { NextResponse, type NextRequest } from "next/server";
import { getExternalJobs } from "@/lib/repo-external-jobs";
import { isValidCountry } from "@/lib/countries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/jobs/external?country=AT&category=epitoipar&canton=W — API-ból aggregált
 * „Élő állások" (AT/DE/NL: Adzuna/Jooble; CH: hivatalos Job-Room/SECO). KIFELÉ linkelnek.
 * A `canton` (régió-kód) szűri a feloldott régiójú hirdetéseket.
 */
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("country");
  const country = isValidCountry(c) ? c : "AT";
  const category = req.nextUrl.searchParams.get("category");
  const canton = req.nextUrl.searchParams.get("canton");
  const jobs = await getExternalJobs(country, { category, cantonCode: canton });
  return NextResponse.json({ jobs }, { headers: { "cache-control": "public, max-age=300" } });
}
