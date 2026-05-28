"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignUp, useAuth } from "@clerk/nextjs";
import { Icon } from "@/components/ui";

export const runtime = "edge";

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/profil");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
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
          <Link href="/vallalkozo" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition-colors">
            <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
            Vissza
          </Link>
          <div className="flex justify-center w-full">
            <SignUp
              path="/regisztracio"
              routing="path"
              signInUrl="/belepes"
              fallbackRedirectUrl="/profil"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
