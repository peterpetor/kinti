"use client";

import Link from "next/link";
import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { Icon, KintiLogo, DropdownMenu } from "@/components/ui";

export const runtime = "edge";

/**
 * A „Vállalkozó" fül egységes belépő oldala. KÉT, világosan elkülönülő lépcső:
 *
 *   1) ELÖL, NAGYBAN — ingyenes felvétel a Szaknévsorba, FIÓK NÉLKÜL.
 *      (a megjelenés: hogy a kintik megtaláljanak)  → /szaknevsor/uj
 *   2) ALATTA, KICSIBEN — vállalkozói FIÓK a meglévő listád KEZELÉSÉHEZ
 *      (logó, nyitvatartás, statisztika, vélemények) → Clerk <SignIn />
 *
 * Így nincs „két regisztráció": a felvétel és a kezelés két külön lépcső.
 */
export default function VallalkozoPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="space-y-5 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
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

      <main className="space-y-4 py-1">
        {!showSignIn ? (
          <>
            {/* 1) ELSŐDLEGES — ingyenes felvétel, fiók nélkül */}
            <section className="rounded-card border border-primary/25 bg-primary-soft p-5 shadow-card">
              <div className="mb-3 inline-flex items-center gap-2 rounded-pill bg-primary/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                <Icon name="check" size={13} strokeWidth={2.6} />
                Ingyenes · nem kell fiók
              </div>
              <h1 className="text-[21px] font-extrabold leading-tight tracking-tight text-ink">
                Tedd fel a vállalkozásod a Szaknévsorba
              </h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                Pár adat, egy email-megerősítés — és a kint élő magyarok{" "}
                <strong className="text-ink">azonnal megtalálnak</strong>. Fiók nem szükséges.
              </p>
              <Link
                href="/szaknevsor/uj"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-primary px-5 text-[14px] font-extrabold text-white shadow-card-hover active:scale-[0.99] transition-all"
              >
                Add hozzá a vállalkozásod
                <Icon name="arrowRight" size={15} strokeWidth={2.4} />
              </Link>
            </section>

            {/* 2) MÁSODLAGOS — fiók a meglévő lista kezeléséhez */}
            <section className="rounded-card border border-line bg-surface p-4 shadow-card">
              <h2 className="text-[14px] font-extrabold tracking-tight text-ink">
                Már fent van a vállalkozásod?
              </h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                Lépj be (vagy hozz létre egy fiókot), és <strong className="text-ink">kezeld</strong>:
                logó, nyitvatartás, statisztika és a beérkező vélemények — egy helyen.
              </p>
              <button
                type="button"
                onClick={() => setShowSignIn(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-alt px-4 py-2 text-[13px] font-bold text-ink hover:bg-surface active:scale-[0.98] transition-all"
              >
                <Icon name="user" size={14} strokeWidth={2.4} />
                Belépés a kezeléshez
              </button>
            </section>

            <p className="px-1 text-center text-[11.5px] leading-snug text-ink-faint">
              Csak böngésznél vagy hirdetést adnál fel? Ahhoz semmi sem kell —{" "}
              <Link href="/kozosseg" className="underline">menj a Közösségbe</Link>.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center animate-fade-up pt-2">
            <SignIn />
            <button
              type="button"
              onClick={() => setShowSignIn(false)}
              className="mt-6 text-[13px] font-bold text-ink-muted underline hover:text-ink transition-colors"
            >
              Vissza
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
