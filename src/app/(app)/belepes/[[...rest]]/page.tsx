import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vállalkozói belépés" };

const CLERK_ACCOUNTS_BASE = "https://accounts.kinti.app";
const APP_BASE = "https://kinti.app";

function safeTargetUrl(target: string | undefined): string {
  if (!target) return `${APP_BASE}/profil`;
  if (target.startsWith("/") && !target.startsWith("//")) {
    return `${APP_BASE}${target}`;
  }
  try {
    const u = new URL(target);
    if (u.host === "kinti.app") return u.toString();
  } catch {
    /* invalid URL */
  }
  return `${APP_BASE}/profil`;
}

/**
 * Belépés a Clerk hosted Account Portal-on (`accounts.kinti.app/sign-in`) keresztül.
 * A beágyazott <SignIn> komponens helyett ezt használjuk, mert az Account Portal
 * megbízhatóbban kezeli a session cookie első-féles beállítását .kinti.app-on
 * Cloudflare Pages edge runtime + custom domain mellett.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const target = safeTargetUrl(searchParams.redirect_url);

  const { userId } = await auth();
  if (userId) redirect(target);

  redirect(`${CLERK_ACCOUNTS_BASE}/sign-in?redirect_url=${encodeURIComponent(target)}`);
}
