"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

/**
 * Eszközök és kalauzok — ORSZÁG-TUDATOS lista (user-hiba-jelzés 2026-07-17:
 * Ausztriában is látszott a csak-svájci Vám-kalkulátor). A force-static oldal
 * miatt a szűrés kliens-oldali (usePreferredCountry, hidratálás-biztos:
 * mount előtt CH-default = SSR-egyezés); a kapu ugyanaz az isFeatureAvailable,
 * mint a menüben/keresőben.
 */
const TOOLS: { href: string; emoji: string; label: string; desc: string; feature?: string }[] = [
  { href: "/tudasbazis/kikoltozes", emoji: "✈️", label: "Kiköltözési teendőlista", desc: "Lépésről lépésre az indulásig — idővonallal" },
  { href: "/tudasbazis/vizum", emoji: "🪪", label: "Tartózkodás és engedélyek", desc: "Engedély-varázsló: mi kell, mikor, hova", feature: "vizum" },
  { href: "/tudasbazis/hivatalos", emoji: "🏛️", label: "Hivatalos linkek", desc: "Konzulátus, hivatalok — egy kattintásra" },
  { href: "/tudasbazis/iskolarendszer", emoji: "🎒", label: "Iskolarendszer", desc: "Óvodától az egyetemig, országonként", feature: "iskolarendszer" },
  { href: "/tudasbazis/allampolgarsag", emoji: "🏅", label: "Állampolgárság", desc: "Honosítási felkészítő és teszt", feature: "allampolgarsag" },
  { href: "/tudasbazis/bussen", emoji: "🚗", label: "Bírság-becslő", desc: "Gyorshajtás: mennyi büntetés jár?", feature: "bussen" },
  { href: "/tudasbazis/vam", emoji: "📦", label: "Vám-kalkulátor", desc: "Behozatal a svájci határon", feature: "vam" },
];

export function ToolsList() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const tools = TOOLS.filter((t) => !t.feature || isFeatureAvailable(t.feature, country));

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
        Eszközök és kalauzok
      </h2>
      <div className="grid gap-2">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-lg">{t.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">{t.label}</span>
              <span className="block text-[11.5px] leading-snug text-ink-muted">{t.desc}</span>
            </span>
            <Icon name="chevR" size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          </Link>
        ))}
      </div>
    </section>
  );
}
