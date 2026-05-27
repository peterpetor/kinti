import { NextResponse } from "next/server";
import { getActiveSosAlerts } from "@/lib/sos-repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const alerts = await getActiveSosAlerts();
  return NextResponse.json(alerts, {
    headers: { "cache-control": "no-store" },
  });
}
