import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getWorkerProfileById } from "@/lib/repo";
import { createRecruitingCandidate } from "@/lib/repo-recruiting";
import { COUNTRIES } from "@/lib/countries";
import { getRegions } from "@/lib/regions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PLACEMENT = new Set(["AT", "DE", "NL"]);

/** canton_code → placement-ország (CH nem közvetíthető → default AT). */
function deriveCountry(canton: string | null): string {
  if (!canton) return "AT";
  for (const c of COUNTRIES) {
    if (getRegions(c.code).some((r) => r.code === canton)) {
      return PLACEMENT.has(c.code) ? c.code : "AT";
    }
  }
  return "AT";
}

/**
 * POST /api/admin/recruiter/import — egy self-service (opt-inolt) worker_profile
 * behúzása a közvetítői pipeline-ba (recruiting_candidates), a meglévő CV-vel.
 * A keyword üresen marad → a recruiter a 🪄 AI-val szedi ki a CV-ből.
 * Body: { workerId }.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { workerId?: string };
  if (!body.workerId) return NextResponse.json({ error: "Hiányzó workerId." }, { status: 400 });

  const w = await getWorkerProfileById(body.workerId);
  if (!w) return NextResponse.json({ error: "Nincs ilyen jelölt." }, { status: 404 });

  const id = await createRecruitingCandidate({
    fullName: w.fullName,
    country: deriveCountry(w.cantonCode),
    keyword: null,
    cvKey: w.cvKey, // a worker saját CV-kulcsa (cv/<userId>/...), szerver-megbízható
  });
  return NextResponse.json({ ok: true, id });
}
