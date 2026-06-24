import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import {
  listRecruitingCandidates,
  createRecruitingCandidate,
  updateRecruitingCandidate,
  deleteRecruitingCandidate,
  type RecruitingStatus,
} from "@/lib/repo-recruiting";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const STATUSES = new Set<RecruitingStatus>(["new", "contacted", "placed", "paid", "dropped"]);
const COUNTRIES = new Set(["AT", "DE", "NL"]);

async function guard(): Promise<boolean> {
  return !!(await getAdminUserId());
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const candidates = await listRecruitingCandidates(500);
  return NextResponse.json({ candidates }, { headers: { "cache-control": "no-store" } });
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
  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string; notes?: string; keyword?: string };
  if (!body.id) return NextResponse.json({ error: "Hiányzó id." }, { status: 400 });
  const fields: { status?: RecruitingStatus; notes?: string | null; keyword?: string | null } = {};
  if (body.status && STATUSES.has(body.status as RecruitingStatus)) fields.status = body.status as RecruitingStatus;
  if (typeof body.notes === "string") fields.notes = body.notes.slice(0, 2000) || null;
  if (typeof body.keyword === "string") fields.keyword = body.keyword.slice(0, 80).trim() || null;
  const ok = await updateRecruitingCandidate(body.id, fields);
  return NextResponse.json({ ok });
}

export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Hiányzó id." }, { status: 400 });
  const ok = await deleteRecruitingCandidate(id);
  return NextResponse.json({ ok });
}
