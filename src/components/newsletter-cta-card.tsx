"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";

const DISMISS_KEY = "kinti.newsletterCtaDismissed";

/**
 * NewsletterCtaCard — diszkrét, elvethető feliratkozó-CTA a kezdőlapon.
 * A /hirlevel double-opt-in oldalra visz. Elvetés után localStorage-ben
 * megjegyezzük, így többé nem jelenik meg (privacy-first, nincs szerver-állapot).
 */
export function NewsletterCtaCard() {
  // Hidratálás-biztos: alapból rejtve, mount után döntünk.
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setShow(true);
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="relative flex items-center gap-3 rounded-card border border-primary/30 bg-primary-soft/50 px-4 py-3 shadow-card">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white text-lg">
        ✉️
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-extrabold text-ink">Kinti Hírlevél</p>
        <p className="text-[11.5px] leading-snug text-ink-muted">
          Hírek, események és ajánlatok — országodra szabva.
        </p>
      </div>
      <Link
        href="/hirlevel"
        className="shrink-0 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-card active:scale-95"
      >
        Feliratkozom
      </Link>
      <button
        type="button"
        aria-label="Elrejtem"
        onClick={dismiss}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-ink-faint hover:text-ink-muted"
      >
        <Icon name="close" size={11} strokeWidth={2.4} />
      </button>
    </div>
  );
}
