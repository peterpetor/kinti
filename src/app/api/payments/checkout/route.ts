import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckout } from "@/lib/lemonsqueezy";
import { getVariantId, PRODUCT_ENTITLEMENT, ProductType, CountryCode } from "@/lib/payments-config";
import { getBusinessByOwner, getEmployerByOwner, getJobById } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // A jogosultságot a webhook a customData.userId alapján adja meg, ezért NEM
    // bízhatunk a kliens userId-jében — a bejelentkezett session-ből vesszük.
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges a vásárláshoz." }, { status: 401 });
    }

    const body = await req.json();
    const { product, country, customData, customerEmail, customerName } = body as {
      product: ProductType;
      country?: CountryCode;
      customData?: Record<string, string>;
      customerEmail?: string;
      customerName?: string;
    };

    const type = product ? PRODUCT_ENTITLEMENT[product] : undefined;
    if (!product || !type) {
      return NextResponse.json({ error: "Ismeretlen termék." }, { status: 400 });
    }

    // Alapértelmezetten Svájc (CH), de ha küldik, használjuk azt.
    const selectedCountry = country || "CH";
    const variantId = getVariantId(product, selectedCountry);

    // A webhook a custom_data alapján aktivál — ezért MINDENT szerver-oldalon, a
    // bejelentkezett user tényleges tulajdonjogából vezetünk le. A kliens
    // customData-ját (type/businessId/jobId) NEM bízzuk meg.
    const safeCustomData: Record<string, string> = { type, userId };

    if (type === "business_pro") {
      // Csak a SAJÁT vállalkozásodat emelheted ki (a kliens businessId-ját eldobjuk).
      const business = await getBusinessByOwner(userId);
      if (!business) {
        return NextResponse.json({ error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
      }
      safeCustomData.businessId = business.id;
    } else if (type === "job_featured") {
      // Csak a SAJÁT hirdetésedet emelheted ki — ellenőrizzük a tulajdonjogot.
      const jobId = typeof customData?.jobId === "string" ? customData.jobId : "";
      const [employer, job] = await Promise.all([
        getEmployerByOwner(userId),
        jobId ? getJobById(jobId) : Promise.resolve(null),
      ]);
      if (!employer || !job || job.employerId !== employer.id) {
        return NextResponse.json({ error: "Ez a hirdetés nem a tiéd." }, { status: 403 });
      }
      safeCustomData.jobId = jobId;
    }
    // user_pro: csak { type, userId } kell.

    const checkoutUrl = await createCheckout(
      variantId,
      safeCustomData,
      customerEmail ? { email: customerEmail, name: customerName } : undefined
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    safeLogError("[payments/checkout]", error);
    return NextResponse.json(
      { error: "A fizetés elindítása nem sikerült. Próbáld újra később." },
      { status: 500 },
    );
  }
}
