import { NextResponse } from "next/server";
import { confirmNewsletterSubscription } from "@/lib/repo-newsletter";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const result = await confirmNewsletterSubscription(params.token);

    if (!result) {
      // Ha már megerősítették vagy nem létezik
      return NextResponse.redirect(new URL("/hirlevel-megerositve?error=invalid", req.url));
    }

    return NextResponse.redirect(new URL("/hirlevel-megerositve", req.url));
  } catch (err) {
    safeLogError("[newsletter/confirm]", err);
    return NextResponse.redirect(new URL("/hirlevel-megerositve?error=server", req.url));
  }
}
