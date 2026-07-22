import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignUp } from "@clerk/nextjs";
import { Icon } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Regisztráció" };

/**
 * Csak relatív / ugyanorigóra mutató URL — open-redirect ellen.
 *
 * ⚠️ A puszta `//` tiltás NEM elég: a böngésző az URL-ben a visszaperjelet
 * előre-perjellé alakítja, a TAB/CR/LF karaktereket pedig eldobja. Emiatt a
 * `/\evil.com` és a `/<TAB>/evil.com` is PROTOKOLL-RELATÍV URL-lé válik a
 * böngészőben → külső átirányítás (adathalász-vektor). Ezért ELŐBB ugyanúgy
 * normalizálunk, mint a böngésző, és a normalizált értéket adjuk vissza.
 */
function safeRedirect(target: string | undefined): string {
  if (!target) return "/profil";
  const norm = target.replace(/[\t\r\n]/g, "").replace(/\\/g, "/");
  if (norm.startsWith("/") && !norm.startsWith("//")) return norm;
  try {
    const u = new URL(norm);
    if (u.host === "kinti.app") return u.pathname + u.search;
  } catch {
    /* érvénytelen URL */
  }
  return "/profil";
}

/**
 * Regisztráció — BEÁGYAZOTT Clerk <SignUp> (magyar a ClerkProvider `huHU`
 * localizációjával). Lásd a /belepes-t a session-handshake megjegyzéssel.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const { userId } = await auth();
  const target = safeRedirect(searchParams.redirect_url);
  if (userId) redirect(target);

  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
      <main className="flex-1 flex flex-col items-center pt-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
        <div className="w-full max-w-md animate-fade-up">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition-colors"
          >
            <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
            Vissza
          </Link>
          <div className="flex justify-center">
            <SignUp
              path="/regisztracio"
              routing="path"
              signInUrl="/belepes"
              fallbackRedirectUrl={target}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
