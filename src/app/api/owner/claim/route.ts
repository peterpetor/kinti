import { NextResponse, type NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  claimBusiness,
  createBusinessClaimRequest,
  getBusinessById,
  getBusinessByOwner,
} from "@/lib/repo";
import { sendBusinessClaimEmail } from "@/lib/email";
import { BUSINESS_CONFIRM_TTL_MS } from "@/lib/business";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/claim  { businessId }
 *
 * Belépett Clerk user igényli egy meglévő, gazdátlan business kezelési jogát.
 *
 *   • Ha a Clerk fiókod e-mailje MEGEGYEZIK a vállalkozás contact_email-jével
 *     → AZONNAL claim (a Clerk már verifikálta az emailt).
 *   • Egyébként → megerősítő linket küldünk a business contact_email-jére;
 *     a linkre kattintva (GET /api/owner/claim/confirm/<token>) áll be a kötés.
 *
 * Egy user — egy vállalkozás (MVP). Ha már van, visszaadjuk a meglévőt.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { businessId?: string };
  if (!body.businessId) {
    return NextResponse.json({ error: "missing_business_id" }, { status: 400 });
  }

  // Már van vállalkozása ennek a usernek? → visszaadjuk azt.
  const existing = await getBusinessByOwner(userId);
  if (existing) {
    return NextResponse.json({ business: existing, status: "already_owned" });
  }

  const business = await getBusinessById(body.businessId);
  if (!business) {
    return NextResponse.json({ error: "business_not_found" }, { status: 404 });
  }
  if (business.ownerUserId) {
    return NextResponse.json({ error: "already_claimed" }, { status: 409 });
  }

  // Clerk user e-mailje (primary)
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;
  if (!userEmail) {
    return NextResponse.json({ error: "no_primary_email" }, { status: 400 });
  }

  const businessEmail = business.contactEmail?.toLowerCase().trim() ?? null;

  // 1) Email-egyezés → azonnali claim (a Clerk már verifikálta az emailt).
  if (businessEmail && businessEmail === userEmail.toLowerCase()) {
    const ok = await claimBusiness(body.businessId, userId);
    if (!ok) {
      return NextResponse.json({ error: "already_claimed" }, { status: 409 });
    }
    const updated = await getBusinessById(body.businessId);
    return NextResponse.json({ business: updated, status: "claimed" });
  }

  // 2) Nincs business contact_email → nem tudunk hova küldeni → 422.
  if (!businessEmail) {
    return NextResponse.json(
      { error: "no_contact_email", message: "Ennek a vállalkozásnak nincs kapcsolati e-mail címe — írj nekünk a hello@kinti.app címre." },
      { status: 422 },
    );
  }

  // 3) Email-eltérés → verifikációs link a business contact_email-jére.
  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + BUSINESS_CONFIRM_TTL_MS).toISOString();

  await createBusinessClaimRequest({
    id: crypto.randomUUID(),
    businessId: body.businessId,
    userId,
    userEmail,
    businessEmail,
    verifyToken: token,
    expiresAt,
  });

  const baseUrl =
    getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;

  try {
    await sendBusinessClaimEmail({
      to: businessEmail,
      businessName: business.name,
      claimerUserEmail: userEmail,
      confirmUrl: `${baseUrl}/api/owner/claim/confirm/${token}`,
      confirmExpiresAt: expiresAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ismeretlen email-hiba.";
    return NextResponse.json(
      { error: "email_send_failed", detail: message },
      { status: 502 },
    );
  }

  // Adatvédelem: a teljes business email-t NEM mutatjuk a kliensnek, csak maszkolva.
  return NextResponse.json({
    status: "verification_sent",
    maskedEmail: maskEmail(businessEmail),
  });
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}
