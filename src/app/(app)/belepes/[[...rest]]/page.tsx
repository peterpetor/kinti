"use client";

import Link from "next/link";
import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

/**
 * A belépés KIZÁRÓLAG vállalkozóknak / szakembereknek szól (saját profil
 * kezeléséhez). A közösségi tagoknak (böngészés, hirdetésfeladás) nem kell.
 */
export default function SignInPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* fejléc */}
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/switzerland-flag.png"
            alt="Svájc"
            className="h-[18px] w-[18px] rounded-[4px] object-contain select-none"
          />
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      <main className="py-2">
        <section className="mb-6 rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="mb-3 inline-flex items-center gap-2 rounded-pill bg-primary/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-primary">
            <Icon name="user" size={13} strokeWidth={2.4} />
            Csak vállalkozóknak
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
            Vállalkozói belépés
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
            A profilkezelés <strong className="text-ink">kizárólag vállalkozók
            és szakemberek</strong> számára van fenntartva. Ha még nincs
            fiókod, regisztrálj — vagy menj vissza a kintizéshez.
          </p>
          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={() => setShowSignIn(true)}
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2 text-[13px] font-bold text-white shadow-sm active:scale-[0.98] transition-all"
            >
              Belépés
            </button>
            <Link
              href="/regisztracio"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-alt px-5 py-2 text-[13px] font-bold text-ink hover:bg-surface-alt/80 active:scale-[0.98] transition-all"
            >
              Regisztráció
            </Link>
          </div>
        </section>

        {showSignIn && (
          <div className="grid place-items-center animate-fade-up py-4">
            <SignIn />
          </div>
        )}
      </main>
    </div>
  );
}
