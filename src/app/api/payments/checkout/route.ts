import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createTransaction } from "@/lib/paddle";
import { getPriceId, PRODUCT_ENTITLEMENT, ProductType, CountryCode } from "@/lib/payments-config";
import { getBusinessByOwner, getBusinessByManageToken, getEmployerByOwner, getJobById } from "@/lib/repo";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

/**
 * POST /api/payments/checkout — Paddle transaction (checkout) létrehozása.
 *
 * A jogosultság-típust a `product`-ból vezetjük le (nem a kliensét), és a
 * businessId/jobId-t a bejelentkezett user tényleges tulajdonjogából — így nem
 * lehet olcsó terméket fizetve drágát aktiválni, sem idegen entitást kiemelni.
 * Visszaad egy `transactionId`-t, amit a kliens a Paddle.js overlay-ben nyit meg.
 *
 * TOKEN-OS ÚT (email-only cégtulajdonos, Clerk nélkül): a /szaknevsor/kezeles/
 * <token> oldal a manageTokent küldi — a token MAGA a tulajdonjog-bizonyíték
 * (ugyanaz, amivel a cég minden adata szerkeszthető; 122-bit entrópia, lásd
 * /api/business/manage). Ezen az úton KIZÁRÓLAG business_pro vásárolható, és a
 * businessId-t a tokenből oldjuk fel szerver-oldalon — más cégre/termékre nem
 * konvertálható. A Paddle-webhook aktiválása a businessId-n fut, userId nélkül
 * is teljes értékű.
 */
export async function POST(req: Request) {
  try {
    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 }); }
    const { product, country, customData, customerEmail, manageToken } = body as {
      product: ProductType;
      country?: CountryCode;
      customData?: Record<string, string>;
      customerEmail?: string;
      manageToken?: string;
    };

    const type = product ? PRODUCT_ENTITLEMENT[product] : undefined;
    if (!product || !type) {
      return NextResponse.json({ error: "Ismeretlen termék." }, { status: 400 });
    }

    // Ország-validáció: ismeretlen kódnál a getPriceId dobna (500 lenne) —
    // helyette tiszta 400. Hiányzó országnál a CH a default (eddigi viselkedés).
    const VALID_COUNTRIES: readonly CountryCode[] = ["CH", "AT", "DE", "NL"];
    if (country !== undefined && !VALID_COUNTRIES.includes(country)) {
      return NextResponse.json({ error: "Érvénytelen ország." }, { status: 400 });
    }

    const priceId = getPriceId(product, country || "CH");

    // --- Token-os (Clerk-mentes) út: csak business_pro, a cég a tokenből. ---
    if (typeof manageToken === "string" && manageToken.length > 0) {
      if (type !== "business_pro") {
        return NextResponse.json({ error: "Ezzel a linkkel csak Szaknévsor PRO vásárolható." }, { status: 400 });
      }
      const business = await getBusinessByManageToken(manageToken);
      if (!business) {
        return NextResponse.json({ error: "Érvénytelen vagy lejárt kezelő-link." }, { status: 403 });
      }
      const transactionId = await createTransaction(
        priceId,
        { type, businessId: business.id },
        customerEmail ? { email: customerEmail } : undefined,
      );
      return NextResponse.json({ transactionId });
    }

    // --- Bejelentkezett (Clerk) út — az eddigi viselkedés változatlanul. ---
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Bejelentkezés szükséges a vásárláshoz." }, { status: 401 });
    }

    // A custom_data SZERVER-OLDALON, a tényleges tulajdonjogból (a kliensét eldobjuk).
    const safeCustomData: Record<string, string> = { type, userId };

    if (type === "business_pro") {
      const business = await getBusinessByOwner(userId);
      if (!business) {
        return NextResponse.json({ error: "Nincs hozzád kötött vállalkozás." }, { status: 403 });
      }
      safeCustomData.businessId = business.id;
    } else if (type === "job_featured") {
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

    const transactionId = await createTransaction(
      priceId,
      safeCustomData,
      customerEmail ? { email: customerEmail } : undefined,
    );

    return NextResponse.json({ transactionId });
  } catch (error) {
    safeLogError("[payments/checkout]", error);
    return NextResponse.json(
      { error: "A fizetés elindítása nem sikerült. Próbáld újra később." },
      { status: 500 },
    );
  }
}
