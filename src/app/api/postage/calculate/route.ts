import { NextResponse } from "next/server";
import { calculatePostage } from "@/lib/swiss-post-rates";
import type { Destination, ServiceLevel, ItemType } from "@/lib/swiss-post-rates";

export const runtime = "edge";

/**
 * POST /api/postage/calculate
 *
 * Body: { itemType, weightG, destination, serviceLevel }
 *
 * Megjegyzés: A Swiss Post nem biztosít nyilvánosan elérhető, autentikáció
 * nélküli árkalkulátor API-t. Ez az endpoint a 2025-ös hivatalos díjtáblázat
 * alapján számol (src/lib/swiss-post-rates.ts). Ha a jövőben hozzáférünk a
 * Swiss Post developer.post.ch API-hoz, itt cserélhető le valódi API-hívásra.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen JSON." }, { status: 400 });
  }

  const itemType = body.itemType as ItemType;
  const weightG = Number(body.weightG);
  const destination = body.destination as Destination;
  const serviceLevel = body.serviceLevel as ServiceLevel;

  if (!["letter", "parcel"].includes(itemType)) {
    return NextResponse.json({ error: "Érvénytelen itemType." }, { status: 400 });
  }
  if (!["ch", "eu", "world"].includes(destination)) {
    return NextResponse.json({ error: "Érvénytelen destination." }, { status: 400 });
  }
  if (!["priority", "economy"].includes(serviceLevel)) {
    return NextResponse.json({ error: "Érvénytelen serviceLevel." }, { status: 400 });
  }
  if (!Number.isFinite(weightG) || weightG <= 0) {
    return NextResponse.json({ error: "Érvénytelen súly." }, { status: 400 });
  }

  const result = calculatePostage(itemType, weightG, destination, serviceLevel);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({
    ...result,
    source: "Swiss Post official tariff 2025",
    disclaimer:
      "A díjak a Swiss Post 2025. január 1-jén életbe lépett hivatalos díjszabásán alapulnak. " +
      "Ellenőrizd a pontos díjakat: https://www.post.ch/en/sending-letters/rates-and-conditions/postage-calculator",
  });
}
