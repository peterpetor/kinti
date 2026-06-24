import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import {
  listAllShortlist,
  addShortlistJob,
  updateShortlistStatus,
  updateShortlistEmail,
  removeShortlistJob,
  type ShortlistStatus,
} from "@/lib/repo-recruiting";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const STATUSES = new Set<ShortlistStatus>(["saved", "contacted"]);

async function guard() { return !!(await getAdminUserId()); }

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const shortlist = await listAllShortlist();
  return NextResponse.json({ shortlist }, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as {
    candidateId?: string; job?: { title?: string; company?: string; location?: string; url?: string }; matchScore?: number;
  };
  const job = body.job ?? {};
  if (!body.candidateId || !job.title || !job.url) return NextResponse.json({ error: "Hiányzó adat." }, { status: 400 });
  const id = await addShortlistJob({
    candidateId: body.candidateId,
    jobTitle: String(job.title).slice(0, 200),
    jobCompany: job.company ? String(job.company).slice(0, 160) : null,
    jobLocation: job.location ? String(job.location).slice(0, 160) : null,
    jobUrl: String(job.url).slice(0, 600),
    matchScore: typeof body.matchScore === "number" ? Math.max(0, Math.min(100, Math.round(body.matchScore))) : null,
  });
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string; employerEmail?: string | null };
  if (!body.id) return NextResponse.json({ error: "Hiányzó id." }, { status: 400 });
  // E-mail beállítása (vagy törlése null-lal)
  if (body.employerEmail !== undefined) {
    const raw = (body.employerEmail ?? "").trim();
    const email = raw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw.slice(0, 200) : null;
    const ok = await updateShortlistEmail(body.id, email);
    return NextResponse.json({ ok, email });
  }
  // Státusz
  if (body.status && STATUSES.has(body.status as ShortlistStatus)) {
    const ok = await updateShortlistStatus(body.id, body.status as ShortlistStatus);
    return NextResponse.json({ ok });
  }
  return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
}

export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Hiányzó id." }, { status: 400 });
  const ok = await removeShortlistJob(id);
  return NextResponse.json({ ok });
}
