import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSosAlert } from "@/lib/sos-repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lat, lng, description, contactPhone } = body;

  if (typeof lat !== "number" || typeof lng !== "number" || !description || !contactPhone) {
    return NextResponse.json({ error: "Hiányzó adatok." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  // Expires in 3 hours
  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

  await createSosAlert({
    id,
    lat,
    lng,
    description: String(description).slice(0, 300), // Max 300 chars
    contactPhone: String(contactPhone).slice(0, 50),
    posterUserId: userId,
    expiresAt,
  });

  return NextResponse.json({ ok: true, id });
}
