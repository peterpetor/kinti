import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/lemonsqueezy";
import { getVariantId, ProductType, CountryCode } from "@/lib/payments-config";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
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

    // 2. Létrehozzuk a Checkout URL-t a Lemon Squeezy API-n keresztül
    const checkoutUrl = await createCheckout(
      variantId,
      customData || {},
      customerEmail ? { email: customerEmail, name: customerName } : undefined
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
