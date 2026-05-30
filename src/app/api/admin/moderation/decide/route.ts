import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import {
  setModerationStatus,
  addToBlocklist,
  type ModerationTable,
} from "@/lib/repo";
import { hashEmail } from "@/lib/bulletin";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const VALID_TABLES: ModerationTable[] = [
  "bulletin_posts",
  "reviews",
  "businesses",
  "events",
];

const TABLE_LABELS: Record<ModerationTable, string> = {
  bulletin_posts: "hirdetés",
  reviews: "vélemény",
  businesses: "vállalkozás",
  events: "esemény",
};

/**
 * POST /api/admin/moderation/decide
 *
 * Body:
 *   {
 *     table: 'bulletin_posts'|'reviews'|'businesses'|'events',
 *     id: string,
 *     decision: 'approved'|'rejected',
 *     banIpHash?: string,   // ha jelen van + decision='rejected' → tiltólistára
 *     banEmail?: string,    // ha jelen van + decision='rejected' → tiltólistára
 *   }
 *
 * Ban-flow: csak `rejected` döntésnél van értelme. Az IP-hash már hashelt
 * (a queue-listán ott van); az email plaintext, mi hash-eljük itt.
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
      banIpHash?: string;
      banEmail?: string;
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
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // Ban-flow csak rejected esetén
    let bannedIp = false;
    let bannedEmail = false;
    if (statusValue === 2) {
      const reason = `Auto-ban (${TABLE_LABELS[table]}-elutasítás)`;

      if (
        typeof body.banIpHash === "string" &&
        /^[a-f0-9]{64}$/i.test(body.banIpHash)
      ) {
        const entry = await addToBlocklist({
          kind: "ip_hash",
          value: body.banIpHash.toLowerCase(),
          reason,
          adminUserId: adminId,
        });
        bannedIp = !!entry;
      }

      if (typeof body.banEmail === "string" && body.banEmail.trim().length > 0) {
        const emailHash = await hashEmail(body.banEmail);
        if (emailHash) {
          const entry = await addToBlocklist({
            kind: "email_hash",
            value: emailHash,
            reason,
            adminUserId: adminId,
          });
          bannedEmail = !!entry;
        }
      }
    }

    return NextResponse.json({ ok: true, bannedIp, bannedEmail });
  } catch (err) {
    safeLogError("api/admin/moderation/decide", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
