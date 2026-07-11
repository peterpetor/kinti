"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, SectionHeader } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

/**
 * HomePlatformGrid — „Mit tud a Kinti?" modul-rács a kezdőlapon.
 *
 * Ország-tudatos: a CH/AT/DE-specifikus eszközöket (amikhez nincs még holland
 * tartalom) NL-en elrejtjük (feature-availability.ts) — ne mutasson svájci/osztrák
 * tartalmat ott, ahol nincs hozzá holland verzió. A `feature` kulcs a route első
 * szegmense (a href „/" nélkül). Hidratálás-biztos: mount előtt CH-default (az SSR
 * is azt rendereli), mount után a választott ország.
 */
/** Domain-árnyalat: a rács így színnel is csoportosít (munka/pénz/tanulás/közösség),
 *  nem 17 egyforma szürke chip. A stringek teljesek (nincs cn-merge — lásd cn.ts). */
type Tone = "work" | "money" | "learn" | "social";
const TONE_CHIP: Record<Tone, string> = {
  work: "bg-primary/10 text-primary",
  money: "bg-gold/10 text-gold",
  learn: "bg-accent/10 text-accent",
  social: "bg-info/10 text-info",
};

const MODULES: { href: string; icon: IconName; label: string; tone: Tone }[] = [
  { href: "/szaknevsor", icon: "list", label: "Szaknévsor", tone: "work" },
  { href: "/keresek", icon: "search", label: "Keresek", tone: "work" },
  { href: "/allasok", icon: "briefcase", label: "Állások", tone: "work" },
  { href: "/iranytu", icon: "compass", label: "Iránytű", tone: "money" },
  { href: "/mennyi-marad", icon: "trending", label: "Mennyi marad?", tone: "money" },
  { href: "/berkalkulator", icon: "sliders", label: "Bérkalkulátor", tone: "money" },
  { href: "/arfolyam", icon: "trending", label: "Árfolyam", tone: "money" },
  { href: "/nyelvlecke", icon: "globe", label: "Nyelvlecke", tone: "learn" },
  { href: "/kviz", icon: "star", label: "Kvíz", tone: "learn" },
  { href: "/ugyintezes", icon: "document", label: "Ügyintézés", tone: "work" },
  { href: "/hivatalos", icon: "flag", label: "Hivatalos linkek", tone: "work" },
  { href: "/allampolgarsag", icon: "flag", label: "Állampolgárság", tone: "learn" },
  { href: "/kikoltozes", icon: "check", label: "Kiköltözés", tone: "work" },
  { href: "/repulojegy", icon: "send", label: "Repülőjegy", tone: "social" },
];

export function HomePlatformGrid() {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const modules = MODULES.filter((m) => isFeatureAvailable(m.href.slice(1), country));

  return (
    <section className="space-y-3">
      <SectionHeader>Mit tud a Kinti?</SectionHeader>
      <p className="-mt-1.5 text-[12.5px] leading-snug text-ink-muted">
        Egy app — minden a kinti élethez: munka, pénz, nyelv, ügyintézés.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3.5 text-center shadow-card transition active:scale-[0.97]"
          >
            <span className={`grid h-10 w-10 place-items-center rounded-[12px] ${TONE_CHIP[m.tone]}`}>
              <Icon name={m.icon} size={19} strokeWidth={2.2} />
            </span>
            <span className="text-[11.5px] font-bold leading-tight text-ink">{m.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
