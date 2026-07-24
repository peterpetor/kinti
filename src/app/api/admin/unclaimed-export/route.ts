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
  const header = ["Cégnév", "Kategória", "Ország", "Telefon", "Cím", "Profil URL"].join(",");
  const lines = rows.map((b) =>
    [
      csvCell(b.name),
      csvCell(b.categoryLabel),
      csvCell(b.countryCode),
      csvCell(b.phone),
      csvCell(b.address),
      csvCell(`${baseUrl}/szaknevsor/${b.id}`),
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
