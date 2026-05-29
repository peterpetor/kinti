"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SEEN_FLAG = "kinti.seenWelcome";

/**
 * WelcomeModal — első látogatáskor megjelenő üdvözlő doboz.
 *
 * Csak a kliens-oldalon mutatkozik, ha a localStorage-ban nincs a "seenWelcome"
 * flag. Az "Értem" gombbal eltüntethető, és többé nem jön elő.
 */
export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const seen = window.localStorage.getItem(SEEN_FLAG);
      if (!seen) setOpen(true);
    } catch {
      /* private mode → nem mutatjuk */
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(SEEN_FLAG, "1");
    } catch {
      /* private mode → ok */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/40 px-4 py-6"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card-strong"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            👋
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="welcome-title" className="text-[18px] font-extrabold tracking-tight text-ink">
              Üdv a kinti-n!
            </h2>
            <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">
              A Svájcban élő magyaroknak. Nincs fiók, nincs email — egyszerűen használd.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            Mit szeretnél?
          </p>

          <Link
            href="/szaknevsor"
            onClick={dismiss}
            className="flex items-center gap-3 rounded-[14px] border border-line bg-surface-alt p-3 transition active:scale-[0.99] hover:border-primary/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary text-xl">
              🔍
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold text-ink">Magyar szakembert keresek</span>
              <span className="block text-[11.5px] text-ink-muted">
                Vállalkozók, orvosok, oktatók a Szaknévsorban
              </span>
            </span>
          </Link>

          <Link
            href="/piac"
            onClick={dismiss}
            className="flex items-center gap-3 rounded-[14px] border border-line bg-surface-alt p-3 transition active:scale-[0.99] hover:border-primary/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-accent-soft text-accent text-xl">
              📢
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold text-ink">Hirdetés és események</span>
              <span className="block text-[11.5px] text-ink-muted">
                Eladok-veszek, kérdezek, eseményt szervezek
              </span>
            </span>
          </Link>

          <Link
            href="/telekocsi"
            onClick={dismiss}
            className="flex items-center gap-3 rounded-[14px] border border-line bg-surface-alt p-3 transition active:scale-[0.99] hover:border-primary/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary text-xl">
              🚗
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold text-ink">Utazom / fuvart keresek</span>
              <span className="block text-[11.5px] text-ink-muted">
                Telekocsi a magyar közösségen belül
              </span>
            </span>
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-pill bg-primary px-4 py-3 text-[14px] font-extrabold text-white active:scale-[0.99]"
          >
            Értem, körülnézek!
          </button>
          <Link
            href="/segitseg"
            onClick={dismiss}
            className="text-center text-[11.5px] font-bold text-primary underline"
          >
            Hogyan működik az oldal? → Segítség
          </Link>
        </div>
      </div>
    </div>
  );
}
