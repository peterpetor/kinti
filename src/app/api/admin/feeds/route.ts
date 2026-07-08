import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { createEventFeed, listEventFeeds } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** GET /api/admin/feeds — admin: feedek listája. */
export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) return forbidden();
  const feeds = await listEventFeeds();
  return NextResponse.json({ feeds }, { headers: { "cache-control": "no-store" } });
}

/** POST /api/admin/feeds — admin: új feed felvétele. Body: { url, label? } */
export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return forbidden();

  let body: { url?: unknown; label?: unknown; country?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url : "";
  const label = typeof body.label === "string" ? body.label.trim() : null;
  const country = typeof body.country === "string" ? body.country : null;
  if (!url) return NextResponse.json({ error: "URL kötelező." }, { status: 400 });

  const result = await createEventFeed({ url, label: label || null, country });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ feed: result }, { headers: { "cache-control": "no-store" } });
}

function forbidden() {
  return NextResponse.json(
    { error: "Csak admin felhasználó férhet hozzá." },
    { status: 403 },
  );
}
