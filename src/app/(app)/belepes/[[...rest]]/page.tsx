"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignIn, useAuth } from "@clerk/nextjs";
import { Icon } from "@/components/ui";

export const runtime = "edge";

/**
 * Csak relatív vagy ugyanorigóra mutató URL-eket fogadunk el — open-redirect ellen.
 */
function safeRedirect(target: string | null): string {
  if (!target) return "/profil";
  if (target.startsWith("/") && !target.startsWith("//")) return target;
  try {
    const u = new URL(target);
    if (u.host === "kinti.app") return u.pathname + u.search;
  } catch {
    /* érvénytelen URL */
  }
  return "/profil";
}

function LoginForm() {
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const target = safeRedirect(searchParams.get("redirect_url"));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ha már be van lépve a kliens, azonnal továbbítjuk.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.replace(target);
    }
  }, [isLoaded, isSignedIn, target]);

  if (!isLoaded || !mounted) {
    return (
      <div className="min-h-[calc(100dvh-70px)] flex items-center justify-center">
        <span className="text-ink-muted animate-pulse">Betöltés...</span>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-[calc(100dvh-70px)] flex items-center justify-center">
        <span className="text-ink-muted animate-pulse">Átirányítás...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)] min-h-[calc(100dvh-70px)] flex flex-col">
      <main className="flex-1 flex flex-col items-center pt-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
        <div className="w-full max-w-md animate-fade-up">
          <Link
            href="/vallalkozo"
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition-colors"
          >
            <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
            Vissza
          </Link>
          <div className="flex justify-center w-full">
            <SignIn
              path="/belepes"
              routing="path"
              signUpUrl="/regisztracio"
              fallbackRedirectUrl={target}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-70px)] flex items-center justify-center">
        <span className="text-ink-muted animate-pulse">Betöltés...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
