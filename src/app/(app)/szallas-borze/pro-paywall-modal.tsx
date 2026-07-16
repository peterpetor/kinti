"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { BottomSheet } from "@/components/ui/bottom-sheet";

/**
 * A börze kapuőr-paywallja: a hirdető elérhetőségét csak Kinti PRO láthatja.
 * A vásárlás a /pro oldalon történik (az kezeli az Android-app kontextust is —
 * ld. android-twa szabály: app-ban a Paddle-fizetés rejtve) — itt csak
 * odairányítunk, fizetési elem nincs.
 */
export function ProPaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Kinti PRO szükséges">
      <div className="pb-2 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-[14px] bg-star text-white">
          <Icon name="lock" size={22} strokeWidth={2.4} />
        </div>
        <p className="text-[15px] font-extrabold text-ink">
          A hirdetők elérhetőségeinek megtekintése csak Kinti PRO tagok számára elérhető.
        </p>
        <p className="mx-auto mt-2 max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
          A PRO-val korlátlanul láthatod a börze hirdetőinek elérhetőségét, és minden más
          PRO-funkciót is megkapsz.
        </p>
        <Link
          href="/pro"
          className="mt-4 inline-flex w-full items-center justify-center rounded-pill bg-star px-5 py-3 text-[14px] font-extrabold text-white transition hover:bg-[#d68f20] active:scale-[0.98]"
        >
          Kinti PRO feloldása
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-pill py-2.5 text-[12.5px] font-bold text-ink-muted"
        >
          Most nem
        </button>
      </div>
    </BottomSheet>
  );
}
