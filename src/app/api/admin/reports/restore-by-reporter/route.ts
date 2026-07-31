import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { listOpenReportsByReporter, updateContentReportStatus } from "@/lib/repo-spam";
import { restoreReportedContent } from "@/lib/report-restore";
import { logAdminAction } from "@/lib/audit";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reports/restore-by-reporter
 * Body: { reporterIpHash: string }
 *
 * ⚠️ EZ A ROSSZHISZEMŰ BEJELENTÉS-KAMPÁNY ELLENSZERE.
 *
 * A bejelentés azonnal elrejti a tartalmat (DSA Art. 16, notice-and-action) —
 * ezt a szabályt SZÁNDÉKOSAN nem gyengítettük. A kockázatot azzal kezeljük,
 * hogy a HELYREÁLLÍTÁS azonnali és tömeges: ha valaki végigjelenti a
 * szaknévsort, az összes rejtése EGY kattintással visszavonható.
 *
 * A tartalomtípus-elágazás a KÖZÖS `lib/report-restore.ts`-ben él (ugyanaz,
 * amit az e-mailes moderációs link hív) — így egy új tartalomtípus nem tud
 * kimaradni az egyik ágból.
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { reporterIpHash?: string };
    const ipHash = typeof body.reporterIpHash === "string" ? body.reporterIpHash.trim() : "";
    if (!ipHash) {
      return NextResponse.json({ error: "missing_reporter" }, { status: 400 });
    }

    const reports = await listOpenReportsByReporter(ipHash);
    if (reports.length === 0) {
      return NextResponse.json({ ok: true, restored: 0, skipped: 0 });
    }

    let restored = 0;
    let skipped = 0;
    for (const report of reports) {
      // ⚠️ Egyetlen hibás sor NEM akaszthatja meg a többi visszaállítását —
      // egy kampány közepén a részleges helyreállítás is jobb a semminél.
      try {
        const known = await restoreReportedContent(report.contentType, report.contentId);
        if (!known) {
          skipped++;
          continue;
        }
        await updateContentReportStatus(report.moderateToken, "kept");
        restored++;
      } catch (err) {
        safeLogError("admin/reports/restore-by-reporter item", err);
        skipped++;
      }
    }

    await logAdminAction({
      adminUserId: adminId,
      actionType: "approve",
      targetType: "content_report_bulk",
      targetId: null,
      ipHash,
      reason: "Tömeges visszaállítás egy bejelentőtől",
      details: `${restored} visszaállítva, ${skipped} kihagyva`,
    });

    return NextResponse.json({ ok: true, restored, skipped });
  } catch (err) {
    safeLogError("admin/reports/restore-by-reporter", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
