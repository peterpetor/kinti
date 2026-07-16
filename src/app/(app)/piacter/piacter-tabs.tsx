"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { RentCostCalculator } from "@/components/views/rent-cost-calculator";
import { HOUSING_DISCLAIMER, HOUSING_SAFETY_TIPS } from "@/lib/housing";
import type { HousingListing } from "@/lib/repo-housing";
import { HousingFeed } from "./housing-feed";

export type PiacterTab = "borze" | "kalkulator" | "koltoztetes";

const TABS: { id: PiacterTab; label: string; icon: IconName }[] = [
  { id: "borze", label: "Börze", icon: "house" },
  { id: "kalkulator", label: "Lakbér-kalkulátor", icon: "sliders" },
  { id: "koltoztetes", label: "Költöztetés", icon: "truck" },
];

/** Kurált költözés-tippek — a Költöztetés-fül lenyitható tanács-doboza. */
const MOVING_TIPS: string[] = [
  "Foglalj időben: hónap végére és hétvégére a költöztetők hetekkel előre betelnek.",
  "Kérj írásos, fix árat több cégtől — az órabéres elszámolás könnyen elszalad.",
  "Kérdezz rá a szállítmány-biztosításra: enélkül a sérült bútor a te károd.",
  "Sok német és svájci városban a teherautóhoz ideiglenes megállási tilalmat (Halteverbot) kell igényelni — intézd el pár nappal előre.",
];

/** A Költöztetés-fül gyorslinkjei — mind MEGLÉVŐ funkcióra mutat
 *  (csoportos ajánlatkérés, Keresek-tábla, Szaknévsor), új backend nincs. */
const MOVING_LINKS: { href: string; emoji: string; title: string; subtitle: string }[] = [
  {
    href: "/szaknevsor/ajanlatkeres?cat=futas",
    emoji: "📨",
    title: "Kérj árajánlatot költöztetőktől",
    subtitle: "Egy űrlap — a környéked magyar fuvarozói keresnek meg téged.",
  },
  {
    href: "/keresek",
    emoji: "📦",
    title: "Írd ki a Keresek-táblára",
    subtitle: "Add fel „Költöztetés / fuvar” kategóriában, mit keresel — a vállalkozók jelentkeznek.",
  },
  {
    href: "/szaknevsor?cat=futas",
    emoji: "🚚",
    title: "Magyar fuvarozók a Szaknévsorban",
    subtitle: "Böngéssz a fuvarozás-kategóriában, és hívd őket közvetlenül.",
  },
];

/**
 * A Piactér fülei. A fül-váltás kliensoldali (nincs újratöltés); a ?tab= a
 * címsorban szinkronban marad (megosztható / vissza-gombbal járható), a
 * kezdő fület a szerver adja (searchParams). A Börze a teljes korábbi
 * /szallas-borze; a Költöztetés a meglévő lead-motorokat csatornázó hub.
 */
export function PiacterTabs({
  initialTab,
  listings,
  isPro,
  signedIn,
}: {
  initialTab: PiacterTab;
  listings: HousingListing[];
  isPro: boolean;
  signedIn: boolean;
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
          {/* Kaució-csalás elleni tippek — a lakhatási hirdetés a leggyakoribb
              csalás-terep; lenyitható, hogy ne nyomja el a listát, de mindig ott van. */}
          <details className="group rounded-card border border-star/30 bg-star/5 p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[12.5px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
              <span aria-hidden>⚠️</span> Így ismerd fel a kaució-csalást
              <Icon name="chevD" size={14} strokeWidth={2.4} className="ml-auto shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-2 space-y-1.5">
              {HOUSING_SAFETY_TIPS.map((tip) => (
                <li key={tip} className="flex gap-1.5 text-[11.5px] leading-snug text-ink-muted">
                  <span className="shrink-0" aria-hidden>•</span> {tip}
                </li>
              ))}
            </ul>
          </details>
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

      {tab === "koltoztetes" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-ink-muted">
            Költözöl? Itt kérhetsz segítséget: magyar költöztetők adnak árajánlatot,
            vagy kiírhatod a Keresek-táblára, mire van szükséged.
          </p>

          {MOVING_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">{l.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">{l.title}</span>
                <span className="block text-[11.5px] leading-snug text-ink-muted">{l.subtitle}</span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
            </Link>
          ))}

          {/* Kurált tanácsok — lenyitható, hogy ne nyomja el a cselekvés-kártyákat. */}
          <details className="group rounded-card border border-line bg-surface-alt/60 p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[12.5px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
              <span aria-hidden>💡</span> Költözés okosan — a legfontosabb tudnivalók
              <Icon name="chevD" size={14} strokeWidth={2.4} className="ml-auto shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-2 space-y-1.5">
              {MOVING_TIPS.map((tip) => (
                <li key={tip} className="flex gap-1.5 text-[11.5px] leading-snug text-ink-muted">
                  <span className="shrink-0" aria-hidden>•</span> {tip}
                </li>
              ))}
              <li className="flex gap-1.5 text-[11.5px] leading-snug text-ink-muted">
                <span className="shrink-0" aria-hidden>•</span>
                <span>
                  Svájcba vagy Svájcból költözésnél a holmid vámkezelést igényelhet —{" "}
                  <Link href="/tudasbazis/vam" className="font-bold text-primary underline">nézd meg a vám-kalauzt</Link>.
                </span>
              </li>
            </ul>
            <p className="mt-2 text-[10.5px] leading-snug text-ink-faint">
              A tippek tájékoztató jellegűek, nem minősülnek jogi tanácsadásnak — a pontos
              szabályok városonként és kantononként/tartományonként eltérhetnek.
            </p>
          </details>
        </div>
      )}
    </div>
  );
}
