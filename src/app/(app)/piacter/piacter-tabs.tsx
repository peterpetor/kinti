"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { RentCostCalculator } from "@/components/views/rent-cost-calculator";
import { MyPostsManager } from "@/components/views/my-posts-manager";
import { GamificationCard } from "@/components/views/gamification-card";
import { ReferralHub } from "@/components/views/referral-hub";
import { HOUSING_DISCLAIMER } from "@/lib/housing";
import type { HousingListing } from "@/lib/repo-housing";
import { HousingFeed } from "./housing-feed";

export type PiacterTab = "borze" | "kalkulator" | "sajatjaim";

const TABS: { id: PiacterTab; label: string; icon: IconName }[] = [
  { id: "borze", label: "Börze", icon: "house" },
  { id: "kalkulator", label: "Lakbér-kalkulátor", icon: "sliders" },
  { id: "sajatjaim", label: "Sajátjaim", icon: "bookmark" },
];

/**
 * A Piactér fülei. A fül-váltás kliensoldali (nincs újratöltés); a ?tab= a
 * címsorban szinkronban marad (megosztható / vissza-gombbal járható), a
 * kezdő fület a szerver adja (searchParams). A Börze a teljes korábbi
 * /szallas-borze; a Sajátjaim a korábbi /sajatjaim tartalma.
 */
export function PiacterTabs({
  initialTab,
  listings,
  isPro,
  signedIn,
  turnstileSiteKey,
}: {
  initialTab: PiacterTab;
  listings: HousingListing[];
  isPro: boolean;
  signedIn: boolean;
  turnstileSiteKey: string;
}) {
  const [tab, setTab] = useState<PiacterTab>(initialTab);

  const switchTab = (t: PiacterTab) => {
    setTab(t);
    try {
      const url = t === "borze" ? window.location.pathname : `${window.location.pathname}?tab=${t}`;
      window.history.replaceState(null, "", url);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Piactér-nézetek" className="flex gap-1 rounded-pill border border-line bg-surface p-1 shadow-card">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => switchTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-pill px-2 py-2 text-[11.5px] font-bold transition active:scale-[0.97]",
              tab === t.id ? "bg-primary text-white shadow-card" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon name={t.icon} size={13} strokeWidth={2.4} />
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "borze" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-ink-muted">
            Kiadó szobák és albérletek a kinti magyar közösségtől — vagy add fel, mit keresel.
            A hirdetők közvetlenül egymással egyeznek meg.
          </p>
          {/* Jogi tájékoztató (safe harbor) — halvány, de mindig látható. */}
          <div className="rounded-card border border-line bg-surface-alt/60 p-3">
            <p className="text-[11px] leading-relaxed text-ink-faint">{HOUSING_DISCLAIMER}</p>
          </div>
          <HousingFeed listings={listings} isPro={isPro} signedIn={signedIn} />
        </div>
      )}

      {tab === "kalkulator" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-ink-muted">
            Mielőtt aláírod a bérleti szerződést: kaució, rezsi és az év végi elszámolás
            várható költségei — országra szabva.
          </p>
          <RentCostCalculator />
        </div>
      )}

      {tab === "sajatjaim" && (
        <div className="space-y-4">
          <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
            <strong className="text-ink">Csak a böngésződben látható.</strong> A Kinti szerveren nincs
            felhasználói azonosítód — ezt a listát a böngésző localStorage-ja tárolja. Ha cache-t törölsz
            vagy másik eszközön nyitod meg, eltűnik. Másik eszközhöz:{" "}
            <strong className="text-ink">letöltés / import</strong> vagy{" "}
            <strong className="text-ink">email-küldés</strong>.
          </div>

          <GamificationCard />
          <ReferralHub />

          <Link
            href="/ranglista"
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-star/15 text-lg">🏆</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">Közösségi ranglista</span>
              <span className="block text-[11.5px] text-ink-muted">Opcionális, becenévvel — hasonlítsd a pontod másokéval.</span>
            </span>
            <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
          </Link>

          <MyPostsManager turnstileSiteKey={turnstileSiteKey} />
        </div>
      )}
    </div>
  );
}
