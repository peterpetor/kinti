import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vállalkozói regisztráció" };

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

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const target = safeTargetUrl(searchParams.redirect_url);

  const { userId } = await auth();
  if (userId) redirect(target);

  redirect(`${CLERK_ACCOUNTS_BASE}/sign-up?redirect_url=${encodeURIComponent(target)}`);
}
