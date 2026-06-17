import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckout } from "@/lib/lemonsqueezy";
import { getVariantId, ProductType, CountryCode } from "@/lib/payments-config";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // A jogosultságot (PRO) a webhook a customData.userId alapján adja meg.
    // Ezért NEM bízhatunk a kliens által küldött userId-ben — a bejelentkezett
    // session-ből vesszük, különben más fiókjára lehetne íratni a vásárlást.
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

    if (!product) {
      return NextResponse.json({ error: "Missing product" }, { status: 400 });
    }

    // Alapértelmezetten Svájc (CH), de ha küldik, használjuk azt
    const selectedCountry = country || "CH";

    // 1. Megkeressük a megfelelő Lemon Squeezy Variant ID-t az adott országhoz
    const variantId = getVariantId(product, selectedCountry);

    // A userId-t MINDIG a session-ből írjuk felül (a kliensét eldobjuk).
    const safeCustomData: Record<string, string> = { ...(customData || {}), userId };

    // 2. Létrehozzuk a Checkout URL-t a Lemon Squeezy API-n keresztül
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
