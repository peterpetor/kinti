import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { getUnclaimedBusinesses } from "@/lib/repo";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/unclaimed-export — a "vedd át" kampány CSV-je: még nem
 * foglalt, telefonszámmal elérhető cégek. Csak adminnak (ugyanaz a
 * kapu, mint az /admin/atvetelre-var oldalnak).
 */
function csvCell(v: string | null): string {
  const s = v ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Csak adminoknak." }, { status: 403 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || undefined;
  const country = url.searchParams.get("country")?.trim() || undefined;

  // Egy CSV-hez nem lapozunk — ésszerű felső korlát (a teljes claimed=0+telefonos
  // állomány jelenleg ~1600 sor, ez bőven elfér).
  const rows = await getUnclaimedBusinesses({ q, country, limit: 5000, offset: 0 });

  const baseUrl = getCloudflareEnv().PUBLIC_BASE_URL?.replace(/\/$/, "") || url.origin;
  // ⚠️ A VÉLEMÉNYKÉRŐ LINK is bekerül. A megkeresésnek KÉT ajánlata van, és a
  // második a fontosabb: „vedd át a profilod" (hosszú távú) ÉS „kérd meg pár
  // ügyfeled, hogy írjon rólad" (ez oldja a hideg startot — 2353 cég, 0
  // vélemény). A `?ertekeles=1` egyből a véleményíró űrlapot nyitja, tehát a
  // vállalkozónak elég továbbküldenie; átvétel sem kell hozzá.
  const header = ["Cégnév", "Kategória", "Ország", "Telefon", "Cím", "Profil URL", "Véleménykérő link"].join(",");
  const lines = rows.map((b) =>
    [
      csvCell(b.name),
      csvCell(b.categoryLabel),
      csvCell(b.countryCode),
      csvCell(b.phone),
      csvCell(b.address),
      csvCell(`${baseUrl}/szaknevsor/${b.id}`),
      csvCell(`${baseUrl}/szaknevsor/${b.id}?ertekeles=1`),
    ].join(","),
  );
  const csv = "﻿" + [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="kinti-atvetelre-var.csv"`,
      "cache-control": "no-store",
    },
  });
}
