import { NextResponse } from "next/server";
import { createSosAlert, getActiveAlertCountForUser } from "@/lib/sos-repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // IP alapú azonosítás (Clerk nélkül)
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  
  // Hash the IP to avoid storing raw IPs if possible, but for simplicity here we just use it directly or a simple hash.
  const ipHash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip)))
  ).map((b) => b.toString(16).padStart(2, "0")).join("");
  
  const userId = `ip_${ipHash.substring(0, 16)}`;

  // Anti-spam: max 1 active alert per user
  const activeCount = await getActiveAlertCountForUser(userId);
  if (activeCount >= 1) {
    return NextResponse.json(
      { error: "Már van egy aktív riasztásod! Zárd le a meglévőt, mielőtt újat adsz le." },
      { status: 429 }
    );
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
