import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEmployer, getEmployerByOwner } from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Basic validation
  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
  
  if (companyName.length < 2) {
    return NextResponse.json({ error: "A cégnév túl rövid." }, { status: 400 });
  }
  if (!contactEmail.includes("@")) {
    return NextResponse.json({ error: "Érvénytelen email cím." }, { status: 400 });
  }

  // Check if employer already exists
  const existing = await getEmployerByOwner(userId);
  if (existing) {
    return NextResponse.json({ error: "Már rendelkezel munkáltatói fiókkal." }, { status: 409 });
  }

  const id = crypto.randomUUID();

  try {
    await createEmployer({
      id,
      ownerUserId: userId,
      companyName,
      logoKey: null, // later
      description: typeof body.description === "string" ? body.description.trim() : null,
      website: typeof body.website === "string" ? body.website.trim() : null,
      contactEmail,
      billingEmail: null,
      subscriptionTier: "free",
      stripeCustomerId: null,
      moderationStatus: 0, // 0 = pending
    });
    
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[employer/profile] create error:", err);
    return NextResponse.json({ error: "Belső hiba történt a mentés során." }, { status: 500 });
  }
}
