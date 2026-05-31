import { NextResponse } from "next/server";
import {
  createBorderReport,
  getActiveBorderReports,
  countRecentBorderReports,
  type BorderStatus,
} from "@/lib/repo";
import { verifyTurnstile } from "@/lib/turnstile";
import { hashIp } from "@/lib/bulletin";
import { getCrossingById } from "@/lib/border-crossings";
import { containsProfanity } from "@/lib/profanity";
import { logModerationStrike } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const VALID_STATUSES: BorderStatus[] = ["strict", "moderate", "easy", "closed", "traffic"];

/**
 * GET /api/border-reports — aktív (nem lejárt) határátkelő-jelentések.
 */
export async function GET() {
  const reports = await getActiveBorderReports();
  return NextResponse.json(reports, {
    headers: { "cache-control": "public, max-age=60" },
  });
}

/**
 * POST /api/border-reports — új jelentés a közösségtől.
 *
 * Anti-spam: 5 jelentés / IP / óra. 4 óra TTL alapból.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const crossingId = typeof body.crossingId === "string" ? body.crossingId : "";
  const status = typeof body.status === "string" ? (body.status as BorderStatus) : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;

  if (!getCrossingById(crossingId)) {
    return NextResponse.json({ error: "Ismeretlen határátkelő." }, { status: 400 });
  }
  if (!VALID_STATUSES.includes(status as BorderStatus)) {
    return NextResponse.json({ error: "Érvénytelen státusz." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? null;
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "A robot-ellenőrzés sikertelen." },
      { status: 400 },
    );
  }

  const ipHash = await hashIp(ip);
  const recent = await countRecentBorderReports(ipHash);
  if (recent >= 5) {
    return NextResponse.json(
      { error: "Túl sok jelentés egy óra alatt. Próbáld újra később." },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();

  // Profanity-szűrő a note mezőre
  if (note && containsProfanity(note).hit) {
    await logModerationStrike(ipHash, "Border report note contained profanity").catch(() => {});
    return NextResponse.json(
      { error: "A megjegyzésed nem megfelelő szavakat tartalmaz. Fogalmazd meg másképp." },
      { status: 400 },
    );
  }
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  await createBorderReport({
    id,
    crossingId,
    status: status as BorderStatus,
    note: note || null,
    ipHash,
    expiresAt,
  });

  return NextResponse.json(
    { ok: true, id },
    { headers: { "cache-control": "no-store" } },
  );
}
