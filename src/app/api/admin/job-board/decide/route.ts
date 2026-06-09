import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getDB } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";
import { triggerJobAlertRadars } from "@/lib/radars";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type JobBoardTable = "employers" | "jobs";
const VALID_TABLES: JobBoardTable[] = ["employers", "jobs"];

/**
 * POST /api/admin/job-board/decide
 *
 * Body: { table: 'employers'|'jobs', id: string, decision: 'approved'|'rejected' }
 */
export async function POST(req: Request) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      table?: string;
      id?: string;
      decision?: string;
    };

    const table = body.table as JobBoardTable;
    const id = body.id;
    const decision = body.decision;

    if (!table || !VALID_TABLES.includes(table)) {
      return NextResponse.json({ error: "invalid_table" }, { status: 400 });
    }
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "invalid_id" }, { status: 400 });
    }

    let statusValue: 1 | 2;
    if (decision === "approved") statusValue = 1;
    else if (decision === "rejected") statusValue = 2;
    else {
      return NextResponse.json({ error: "invalid_decision" }, { status: 400 });
    }

    const res = await getDB()
      .prepare(
        `UPDATE ${table}
         SET moderation_status = ?,
             moderation_decision_at = datetime('now'),
             moderation_decided_by = ?
         WHERE id = ?`
      )
      .bind(statusValue, adminId, id)
      .run();

    if ((res.meta.changes ?? 0) === 0) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // Ha az állást most hagyták jóvá, triggerek futtatása a háttérben
    if (table === "jobs" && statusValue === 1) {
      const jobRow = await getDB().prepare("SELECT id, title, description, location, canton_code, category FROM jobs WHERE id = ?").bind(id).first<{id:string, title:string, description:string, location:string, canton_code:string|null, category:string|null}>();
      if (jobRow) {
        // Aszinkron háttérfolyamat (Cloudflare Pages/Workers waitUntil)
        // Edge runtime-on a Promise megvárása nélkül megszakadhat, de a Next.js Edge megvárja az I/O-t, ha simán elsütjük, bár biztonságosabb await-elni vagy context.waitUntil-t használni. Mivel a route Next.js Route Handler, await-eljük, de nem szakítjuk meg a választ ha hibázik.
        triggerJobAlertRadars({
          id: jobRow.id,
          title: jobRow.title,
          description: jobRow.description,
          location: jobRow.location,
          cantonCode: jobRow.canton_code,
          category: jobRow.category,
        }).catch(err => safeLogError("triggerJobAlertRadars.background", err));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("api/admin/job-board/decide", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
