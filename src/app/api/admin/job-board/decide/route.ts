import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getDB, getCloudflareCtx } from "@/lib/cloudflare";
import { safeLogError } from "@/lib/safe-log";
import { triggerJobAlertRadars } from "@/lib/radars";
import { notifyMatchingWorkers } from "@/lib/worker-match";
import { notifyCanton } from "@/lib/push-notify";
import { logAdminAction } from "@/lib/audit";

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

    await logAdminAction({
      adminUserId: adminId,
      actionType: statusValue === 1 ? "approve" : "reject",
      targetType: table,
      targetId: id,
    });

    // Ha az állást most hagyták jóvá, triggerek futtatása a háttérben
    if (table === "jobs" && statusValue === 1) {
      const jobRow = await getDB().prepare("SELECT id, title, description, location, canton_code, country_code, category FROM jobs WHERE id = ?").bind(id).first<{id:string, title:string, description:string, location:string, canton_code:string|null, country_code:string|null, category:string|null}>();
      if (jobRow) {
        // Háttér-értesítések a válasz UTÁN: ctx.waitUntil tartja életben a Workert,
        // különben az edge runtime megszakíthatja a fire-and-forget promise-okat
        // (és az e-mailek/push némán elmaradnának). Ha nincs ctx (build/teszt),
        // sima fire-and-forget a fallback.
        const ctx = getCloudflareCtx();
        const background = (p: Promise<unknown>) => {
          if (ctx) ctx.waitUntil(p);
          else void p;
        };

        // Explicit alert-radarok (kulcsszavas feliratkozók).
        background(
          triggerJobAlertRadars({
            id: jobRow.id,
            title: jobRow.title,
            description: jobRow.description,
            location: jobRow.location,
            cantonCode: jobRow.canton_code,
            country: jobRow.country_code,
            category: jobRow.category,
          }).catch(err => safeLogError("triggerJobAlertRadars.background", err)),
        );

        // Profil-alapú matching: kereshető jelölteknek (kanton + szakma) email.
        background(
          notifyMatchingWorkers({
            id: jobRow.id,
            title: jobRow.title,
            location: jobRow.location,
            cantonCode: jobRow.canton_code,
            category: jobRow.category,
          }).catch(err => safeLogError("notifyMatchingWorkers.background", err)),
        );

        // Kanton-célzott push a „Új állás"-ra feliratkozóknak (mint az eseménynél).
        // Csak ha van kanton — különben a notifyCanton(null) MINDENKINEK menne.
        if (jobRow.canton_code) {
          background(
            notifyCanton(
              jobRow.canton_code,
              {
                title: "Új állás a kantonodban 💼",
                body: `${jobRow.title}${jobRow.location ? " · " + jobRow.location : ""}`,
                url: "/allasok",
              },
              "job",
            ).catch(err => safeLogError("notifyCanton.job.background", err)),
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogError("api/admin/job-board/decide", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
