import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEmployer, getEmployerByOwner } from "@/lib/repo";
import { moderateText } from "@/lib/text-moderation";

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

  const description = typeof body.description === "string" ? body.description.trim() : null;
  const website = typeof body.website === "string" ? body.website.trim() : null;

  // AI elő-moderáció: a munkáltatói profil szabad-szöveges mezőit (cégnév,
  // bemutatkozás, weboldal) átengedjük a Llama moderátoron. A profil önmagában
  // SEMMIT nem publikál — minden álláshirdetés továbbra is kézi admin-
  // jóváhagyáson megy át —, ezért itt biztonságosan auto-jóváhagyhatunk:
  //   • block  → egyértelműen sértő, elutasítjuk (400)
  //   • review → határeset, marad pending (0) kézi ellenőrzésre
  //   • allow / AI-elérhetetlen (fail-open) → azonnali jóváhagyás (1)
  const mod = await moderateText([companyName, description, website].filter(Boolean).join("\n\n"));
  if (mod.action === "block") {
    return NextResponse.json(
      { error: mod.reason || "A megadott adatok nem felelnek meg a közösségi irányelveinknek." },
      { status: 400 },
    );
  }
  const moderationStatus = mod.action === "review" ? 0 : 1;

  const id = crypto.randomUUID();

  try {
    await createEmployer({
      id,
      ownerUserId: userId,
      companyName,
      logoKey: null, // later
      description,
      website,
      contactEmail,
      billingEmail: null,
      subscriptionTier: "free",
      stripeCustomerId: null,
      moderationStatus,
    });

    return NextResponse.json({ ok: true, id, status: moderationStatus });
  } catch (err) {
    console.error("[employer/profile] create error:", err);
    return NextResponse.json({ error: "Belső hiba történt a mentés során." }, { status: 500 });
  }
}
