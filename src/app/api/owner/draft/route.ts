import { NextResponse, type NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  createOwnerDraftBusiness,
  getBusinessByOwner,
  getBusinessById,
  getCategories,
} from "@/lib/repo";
import { approxCoordsForRegion, slugifyBusinessName, BUSINESS_LIMITS } from "@/lib/business";
import { getRegion } from "@/lib/regions";
import { getCountry } from "@/lib/countries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/owner/draft  { name, categoryId, cantonCode }
 *
 * Belépett vállalkozó inline draft létrehozása a /profil onboardingről —
 * email-megerősítés NÉLKÜL (a Clerk már verifikálta az emailt). A részleteket
 * (cím, telefon, leírás, nyitvatartás, nyelvek, logó, …) a sikeres létrehozás
 * után a ProfileEditor-en pótolja a felhasználó.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Egy user — egy vállalkozás. Ha már van, visszaadjuk azt és nem duplikálunk.
  const existing = await getBusinessByOwner(userId);
  if (existing) {
    return NextResponse.json({ business: existing, created: false });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    categoryId?: string;
    cantonCode?: string;
    country?: string;
  };

  const name = (body.name ?? "").trim();
  const categoryId = (body.categoryId ?? "").trim();
  const cantonCode = (body.cantonCode ?? "").trim();
  const country = body.country && getCountry(body.country)?.enabled ? body.country : "CH";

  if (name.length < BUSINESS_LIMITS.nameMin || name.length > BUSINESS_LIMITS.nameMax) {
    return NextResponse.json(
      { error: `A vállalkozás neve ${BUSINESS_LIMITS.nameMin}–${BUSINESS_LIMITS.nameMax} karakter között lehet.` },
      { status: 400 },
    );
  }
  if (!categoryId) {
    return NextResponse.json({ error: "Válassz kategóriát." }, { status: 400 });
  }
  if (!cantonCode || !getRegion(country, cantonCode)) {
    return NextResponse.json({ error: "Válassz régiót." }, { status: 400 });
  }

  const categories = await getCategories();
  if (!categories.find((c) => c.id === categoryId)) {
    return NextResponse.json({ error: "Ismeretlen kategória." }, { status: 400 });
  }

  // Clerk user e-mailje a kontakt-emailhez (a látogatók NEM látják, csak admin/claim)
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;
  if (!primaryEmail) {
    return NextResponse.json({ error: "no_primary_email" }, { status: 400 });
  }

  // Egyedi slug a névből + rövid random utótag (PK-ütközés ellen).
  let id = `${slugifyBusinessName(name)}-${crypto.randomUUID().slice(0, 6)}`;
  if (await getBusinessById(id)) {
    id = `${slugifyBusinessName(name)}-${crypto.randomUUID().slice(0, 8)}`;
  }
  const coords = approxCoordsForRegion(country, cantonCode);

  const manageToken = crypto.randomUUID().replace(/-/g, "");
  await createOwnerDraftBusiness({
    id,
    name,
    categoryId,
    cantonCode,
    country,
    contactEmail: primaryEmail,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    ownerUserId: userId,
    manageToken,
  });

  const business = await getBusinessById(id);
  return NextResponse.json({ business, created: true });
}
