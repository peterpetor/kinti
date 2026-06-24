import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getMediaBucket } from "@/lib/cloudflare";
import {
  listRecruitingCandidates,
  countRecruitingCandidates,
  getRecruitingStatusCounts,
  getRecruitingProfessions,
  createRecruitingCandidate,
  updateRecruitingCandidate,
  deleteRecruitingCandidate,
  getRecruitingCandidate,
  removeShortlistByCandidate,
  getRecruitingStats,
  type RecruitingStatus,
} from "@/lib/repo-recruiting";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const STATUSES = new Set<RecruitingStatus>(["new", "contacted", "placed", "paid", "dropped"]);
const COUNTRIES = new Set(["AT", "DE", "NL"]);

async function guard(): Promise<boolean> {
  return !!(await getAdminUserId());
}

const PAGE_SIZE = 30;

export async function GET(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q") ?? "";
  const statusRaw = sp.get("status");
  const countryRaw = sp.get("country");
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const filter = {
    q,
    status: statusRaw && STATUSES.has(statusRaw as RecruitingStatus) ? (statusRaw as RecruitingStatus) : null,
    country: countryRaw && COUNTRIES.has(countryRaw) ? countryRaw : null,
  };
  const [candidates, total, stats, statusCounts, professions] = await Promise.all([
    listRecruitingCandidates({ ...filter, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countRecruitingCandidates(filter),
    getRecruitingStats(),
    getRecruitingStatusCounts(),
    getRecruitingProfessions(12),
  ]);
  return NextResponse.json(
    { candidates, total, page, pageSize: PAGE_SIZE, stats, statusCounts, professions },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { fullName?: string; country?: string; keyword?: string; cvKey?: string };
  const fullName = (body.fullName ?? "").trim();
  if (fullName.length < 2) return NextResponse.json({ error: "Név kötelező (min. 2 karakter)." }, { status: 400 });
  const country = body.country && COUNTRIES.has(body.country) ? body.country : "AT";
  // A cvKey csak a presign route által kiadott recruiting-kulcs lehet.
  const cvKey = typeof body.cvKey === "string" && body.cvKey.startsWith("cv/recruiting/") ? body.cvKey : null;
  const id = await createRecruitingCandidate({ fullName, country, keyword: (body.keyword ?? "").trim() || null, cvKey });
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string; notes?: string; keyword?: string; feeEur?: number | null };
  if (!body.id) return NextResponse.json({ error: "Hiányzó id." }, { status: 400 });
  const fields: { status?: RecruitingStatus; notes?: string | null; keyword?: string | null; feeEur?: number | null } = {};
  if (body.status && STATUSES.has(body.status as RecruitingStatus)) fields.status = body.status as RecruitingStatus;
  if (typeof body.notes === "string") fields.notes = body.notes.slice(0, 2000) || null;
  if (typeof body.keyword === "string") fields.keyword = body.keyword.slice(0, 80).trim() || null;
  if (body.feeEur === null) fields.feeEur = null;
  else if (typeof body.feeEur === "number" && Number.isFinite(body.feeEur)) fields.feeEur = Math.max(0, Math.min(10_000_000, Math.round(body.feeEur)));
  const ok = await updateRecruitingCandidate(body.id, fields);
  return NextResponse.json({ ok });
}

export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Hiányzó id." }, { status: 400 });
  // GDPR-tiszta törlés: a jelölt + a shortlistje + (ha a recruiter töltötte fel)
  // a CV is törlődik az R2-ből. Az importált self-service jelölt CV-je a user saját
  // worker-profiljáé (cv/<userId>/...) — azt NEM töröljük itt.
  const cand = await getRecruitingCandidate(id);
  const ok = await deleteRecruitingCandidate(id);
  await removeShortlistByCandidate(id);
  if (cand?.cvKey && cand.cvKey.startsWith("cv/recruiting/")) {
    await getMediaBucket().delete(cand.cvKey).catch(() => { /* silent */ });
  }
  return NextResponse.json({ ok });
}
