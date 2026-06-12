import { NextResponse } from "next/server";
import { confirmNewsletterSubscription } from "@/lib/repo-newsletter";

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
  } catch (err: any) {
    console.error("Newsletter confirm error:", err);
    return NextResponse.redirect(new URL("/hirlevel-megerositve?error=server", req.url));
  }
}
