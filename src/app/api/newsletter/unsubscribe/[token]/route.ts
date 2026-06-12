import { NextResponse } from "next/server";
import { deleteNewsletterSubscription } from "@/lib/repo-newsletter";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const success = await deleteNewsletterSubscription(params.token);

    if (success) {
      return NextResponse.redirect(new URL("/hirlevel-megerositve?status=unsubscribed", req.url));
    } else {
      return NextResponse.redirect(new URL("/hirlevel-megerositve?status=expired", req.url));
    }
  } catch (err: any) {
    console.error("Newsletter unsubscribe error:", err);
    return NextResponse.redirect(new URL("/hirlevel-megerositve?error=server", req.url));
  }
}
