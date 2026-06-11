import { getDB } from "./cloudflare";

export const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";

/**
 * Létrehoz egy Lemon Squeezy Checkout URL-t egy adott termék variánsra.
 * A `customData` objektumot titkosítva továbbítjuk a checkout metaadataiba,
 * hogy a sikeres fizetés után a webhookban azonosítani tudjuk a tranzakciót.
 */
export async function createCheckout(
  variantId: string,
  customData: Record<string, string>,
  customer?: { email: string; name?: string }
): Promise<string> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error("Missing LEMONSQUEEZY_API_KEY");
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error("Missing LEMONSQUEEZY_STORE_ID");

  const payload: any = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          custom: customData,
        },
      },
      relationships: {
        store: {
          data: {
            type: "stores",
            id: storeId.toString(),
          },
        },
        variant: {
          data: {
            type: "variants",
            id: variantId.toString(),
          },
        },
      },
    },
  };

  if (customer?.email) {
    payload.data.attributes.checkout_data.email = customer.email;
  }
  if (customer?.name) {
    payload.data.attributes.checkout_data.name = customer.name;
  }

  const res = await fetch(`${LEMONSQUEEZY_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Lemon Squeezy checkout error:", text);
    throw new Error(`Failed to create checkout: ${res.statusText}`);
  }

  const data = (await res.json()) as any;
  return data.data.attributes.url;
}

/**
 * Aláírás ellenőrzése a Webhook requestben
 */
export async function verifySignature(payload: string, signature: string): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  // A Lemon Squeezy HMAC HEX formátumban adja vissza a signature-t.
  // Mivel a crypto.subtle.verify buffert vár, konvertáljuk.
  const signatureBuffer = new Uint8Array(
    signature.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
  );

  return await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBuffer,
    encoder.encode(payload)
  );
}
