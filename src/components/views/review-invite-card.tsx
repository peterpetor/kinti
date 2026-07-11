"use client";

/**
 * review-invite-card.tsx — „Kérj értékelést az ügyfeleidtől" kártya a
 * vállalkozói dashboardon (/profil).
 *
 * A vélemény-lendkerék leggyorsabb indítója maga a CÉGTULAJDONOS: ő motivált
 * (értékelés → bizalom → több lead), és megvannak a régi ügyfelei — a Google
 * cégprofil-playbook Kinti-változata. Kész, magyar üzenetet adunk a kezébe
 * (natív megosztóval / vágólappal), ami a cége értékelő-űrlapjára mutat
 * (?ertekeles=1#ertekeles mélylink — ugyanaz, amit a vélemény-nudge email használ).
 * A beérkező vélemény a szokásos kapukon megy át (email-megerősítés + moderáció).
 */

import { useState } from "react";
import { Icon } from "@/components/ui";
import { trackAction } from "@/components/usage-tracker";

export function ReviewInviteCard({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [copied, setCopied] = useState(false);

  const url = `https://kinti.app/szaknevsor/${businessId}?ertekeles=1#ertekeles`;
  const message =
    `Szia! Ha elégedett voltál a munkámmal (${businessName}), sokat segítenél egy rövid értékeléssel ` +
    `a Kinti magyar szaknévsorában — 1 perc az egész: ${url}`;

  async function share() {
    trackAction("review-invite");
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
        return;
      }
    } catch {
      return; // a user bezárta a megosztót → nem hiba
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard-engedély hiánya — csendben elnyeljük */
    }
  }

  return (
    <section className="rounded-card border border-star/30 bg-star/5 p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-star/15 text-xl">⭐</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold leading-tight text-ink">
            Kérj értékelést az ügyfeleidtől
          </p>
          <p className="mt-1 text-[12px] leading-snug text-ink-muted">
            Az értékeléssel rendelkező profilok sokkal több megkeresést kapnak. Küldd el a
            kész üzenetet pár elégedett ügyfelednek — 1 perc nekik, neked bizalom-előny.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={share}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-pill border border-star/40 bg-surface px-4 py-2.5 text-[13.5px] font-bold text-ink transition active:scale-[0.98]"
      >
        <Icon name="share" size={15} strokeWidth={2.2} />
        {copied ? "Üzenet kimásolva ✓" : "Kérő-üzenet küldése / másolása"}
      </button>
    </section>
  );
}
