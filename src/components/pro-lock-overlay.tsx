"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";

/**
 * ProLockOverlay — a PRO-funkciók „előnézet + paywall" kapuja. A hard-block
 * (a funkció teljes elrejtése) helyett a nem-PRO user LÁTJA a valódi funkciót
 * (elmosva, nem interaktívan), így érti, MI EZ — de a használathoz meg kell
 * vennie a PRO-t. Kivétel az oktató anyag (nyelvlecke): ott az 1. fejezet ingyen,
 * ezért az a saját, fejezet-szintű freemium-kapuját tartja meg, nem ezt.
 */
export function ProLockOverlay({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {/* Előnézet: a VALÓDI funkció, de nem használható (elmosva, kattinthatatlan).
          A min-h garantálja, hogy a rövid funkcióknál is legyen elég hely a paywall
          kártyának (különben az overflow-hidden levágná a CTA-t). */}
      <div className="pointer-events-none min-h-[340px] select-none blur-[3px] saturate-[.85] opacity-70" aria-hidden="true">
        {children}
      </div>

      {/* Paywall — a tartalom fölé simuló CTA. */}
      <div className="absolute inset-0 flex items-start justify-center overflow-hidden rounded-card bg-gradient-to-b from-bg/10 via-bg/55 to-bg/90 p-4">
        <div className="mt-6 w-full max-w-sm rounded-card border-2 border-star/40 bg-surface p-5 text-center shadow-pop">
          <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-[14px] bg-star text-white">
            <Icon name="lock" size={20} strokeWidth={2.4} />
          </div>
          <p className="text-[15px] font-extrabold text-ink">{title}</p>
          <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-snug text-ink-muted">{subtitle}</p>
          <Link
            href="/pro"
            className="mt-3 inline-flex items-center justify-center rounded-pill bg-star px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#d68f20] active:scale-[0.98]"
          >
            Kinti PRO feloldása
          </Link>
          <p className="mt-2 text-[11px] text-ink-faint">A használathoz PRO kell.</p>
        </div>
      </div>
    </div>
  );
}
