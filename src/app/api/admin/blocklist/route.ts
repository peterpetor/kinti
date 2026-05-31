import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import {
  addToBlocklist,
  deactivateBlocklistEntry,
  type BlocklistKind,
} from "@/lib/repo";
import { hashIp, hashEmail } from "@/lib/security";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/blocklist
 *
 * Body (kötelező a "kind" mező, és vagy "ip" VAGY "email" VAGY "valueHash"):
 *   {
 *     kind: "ip_hash" | "email_hash",
 *     ip?: "1.2.3.4",
 *     email?: "spam@example.com",
 *     valueHash?: "<már kész SHA-256 hex>",
 *     reason?: "spamol minden órán"
 *   }
 *
 * Ha `ip` vagy `email` van adva, mi hash-eljük (a hashIp /64-prefixet
 * normalizálja). Ha `valueHash` van adva, közvetlenül azt használjuk
 * (pl. a moderation queue-bólIP-hash ismert).
 */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as {
      kind?: string;
      ip?: string;
      email?: string;
      valueHash?: string;
      reason?: string;
    };
    const kind =
      body.kind === "ip_hash" || body.kind === "email_hash"
        ? (body.kind as BlocklistKind)
        : null;
    if (!kind) {
      return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
    }

    let value: string | null = null;
    if (typeof body.valueHash === "string" && body.valueHash.length === 64) {
      value = body.valueHash.toLowerCase();
    } else if (kind === "ip_hash" && typeof body.ip === "string") {
      value = await hashIp(body.ip.trim());
    } else if (kind === "email_hash" && typeof body.email === "string") {
      value = await hashEmail(body.email);
    }
    if (!value) {
      return NextResponse.json({ error: "missing_value" }, { status: 400 });
    }

    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 200) : null;

    const entry = await addToBlocklist({
      kind,
      value,
      reason: reason && reason.length > 0 ? reason : null,
      adminUserId: adminId,
    });
    if (!entry) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, entry });
  } catch (err) {
    safeLogError("api/admin/blocklist/POST", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
