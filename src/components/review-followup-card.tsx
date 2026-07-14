"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import {
  pickReviewPrompt,
  readCalls,
  readDismissed,
  dismissReviewPrompt,
  type CallEntry,
} from "@/lib/review-prompt";

/**
 * ReviewFollowupCard — hívás-utáni vélemény-kérő a kezdőlapon.
 *
 * Ha a felhasználó nemrég (2 óra – 14 nap) rábökött egy cég „Hívás" gombjára,
 * a következő látogatáskor egy finom kártya kérdezi meg, milyen volt — a CTA a
 * cég oldalának MEGLÉVŐ vélemény-mélylinkjére visz (?ertekeles=1#ertekeles,
 * ugyanaz, amit a vélemény-nudge email használ). Minden jel kliens-oldali
 * (lib/review-prompt, localStorage) — privacy-elv. Cégenként egyszer kérdez:
 * az X és a CTA is véglegesen elrejti az adott céget.
 */
export function ReviewFollowupCard() {
  const [candidate, setCandidate] = useState<CallEntry | null>(null);

  useEffect(() => {
    setCandidate(pickReviewPrompt(readCalls(), readDismissed(), Date.now()));
  }, []);

  if (!candidate) return null;

  const hide = () => {
    dismissReviewPrompt(candidate.id);
    setCandidate(null);
  };

  return (
    <section
      className="animate-fade-up rounded-card border border-star/40 bg-star/10 p-4 shadow-card"
      aria-label="Értékelés-kérés a legutóbbi hívásodról"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-star/20 text-lg" aria-hidden>
          📞
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold leading-snug tracking-[-0.01em] text-ink">
            Nemrég hívtad: {candidate.name}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            Milyen volt? Egy rövid értékeléssel sokat segítesz a többi Kintinek
            — pár másodperc, regisztráció nélkül.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Link
              href={`/szaknevsor/${candidate.id}?ertekeles=1#ertekeles`}
              onClick={() => dismissReviewPrompt(candidate.id)}
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-2 text-[12.5px] font-bold text-white transition active:scale-[0.97]"
            >
              <Icon name="star" size={13} filled /> Értékelem
            </Link>
            <button
              type="button"
              onClick={hide}
              className="rounded-pill px-3 py-2 text-[12.5px] font-bold text-ink-muted transition hover:text-ink active:scale-[0.97]"
            >
              Nem most
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={hide}
          aria-label="Elrejtés"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface/70 text-ink-muted active:scale-90"
        >
          <Icon name="close" size={13} strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
}
