import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import {
  setModerationStatus,
  type ModerationTable,
} from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const VALID_TABLES: ModerationTable[] = [
  "bulletin_posts",
  "reviews",
  "businesses",
  "events",
];

/**
 * POST /api/admin/moderation/decide
 *
 * Body: { table: 'bulletin_posts'|'reviews'|'businesses'|'events',
 *         id: string,
 *         decision: 'approved'|'rejected' }
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
    const table = body.table as ModerationTable;
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

    const ok = await setModerationStatus(table, id, statusValue, adminId);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  } catch (err) {
    safeLogError("api/admin/moderation/decide", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
