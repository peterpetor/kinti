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

const MODULES: { href: string; icon: IconName; label: string; tone: Tone; external?: boolean }[] = [
  { href: "/szaknevsor", icon: "list", label: "Szaknévsor", tone: "work" },
  { href: "/keresek", icon: "search", label: "Keresek", tone: "work" },
  { href: "/allasok", icon: "briefcase", label: "Állások", tone: "work" },
  // A CV-készítő a mérés szerint alul-exponált volt (csak menüből ért el) —
  // a kezdőlap a legerősebb felület, ide való a zászlós ingyenes eszköz.
  { href: "/nemet-oneletrajz", icon: "document", label: "Német CV", tone: "work" },
  { href: "/allasok/interju-szimulator", icon: "sparkles", label: "AI interjú-szimulátor", tone: "work" },
  { href: "/allasok/cv-audit", icon: "magic", label: "AI CV-asszisztens", tone: "work" },
  { href: "/iranytu", icon: "compass", label: "Iránytű", tone: "money" },
  { href: "/mennyi-marad", icon: "trending", label: "Mennyi marad?", tone: "money" },
  { href: "/berkalkulator", icon: "sliders", label: "Bérkalkulátor", tone: "money" },
  { href: "/arfolyam", icon: "trending", label: "Árfolyam", tone: "money" },
  { href: "/lakberles", icon: "home", label: "Lakásbérlés", tone: "money" },
  { href: "/szallas-borze", icon: "bed", label: "Albérlet-börze", tone: "money" },
  { href: "/szolgaltato-valto", icon: "filter", label: "Szolgáltató-váltó", tone: "money" },
  { href: "/utalas", icon: "send", label: "Utalás", tone: "money" },
  { href: "/nyelvlecke", icon: "globe", label: "Nyelvlecke", tone: "learn" },
  { href: "/kviz", icon: "star", label: "Kvíz", tone: "learn" },
  { href: "/ugyintezes", icon: "document", label: "Ügyintézés", tone: "work" },
  { href: "/hivatalos", icon: "flag", label: "Hivatalos linkek", tone: "work" },
  { href: "/hatarido", icon: "clock", label: "Határidők", tone: "work" },
  { href: "/kozlekedes", icon: "nav", label: "Közlekedés", tone: "work" },
  { href: "/bussen", icon: "car", label: "Bírság-becslő", tone: "work" },
  // CH-only — a feature-availability a többi országban elrejti.
  { href: "/vam", icon: "shoppingBag", label: "Vám-kalkulátor", tone: "work" },
  { href: "/allampolgarsag", icon: "flag", label: "Állampolgárság", tone: "learn" },
  { href: "/iskolarendszer", icon: "users", label: "Iskolarendszer", tone: "learn" },
  { href: "/allasok/szakmai-szotar", icon: "bookmark", label: "Szakmai szótár", tone: "learn" },
  { href: "/kikoltozes", icon: "check", label: "Kiköltözés", tone: "work" },
  { href: "/repulojegy", icon: "send", label: "Repülőjegy", tone: "social" },
  { href: "/tortenetek", icon: "heart", label: "Élettörténetek", tone: "social" },
  { href: "/profil/kinti-pass", icon: "qrCode", label: "Kinti Pass", tone: "social" },
  { href: "/b2b", icon: "briefcase", label: "B2B Hub", tone: "work" },
  // A papírrepülő a Telegram saját logó-motívuma — külső deep-link a bothoz.
  { href: "https://t.me/KintiSzaknevsorBot", icon: "send", label: "Telegram-bot", tone: "social", external: true },
];

export function HomePlatformGrid({ b2bOpenCount = 0 }: { b2bOpenCount?: number }) {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const modules = MODULES.filter(
    (m) => m.external || isFeatureAvailable(m.href.slice(1), country),
  );

  // Élő szám-badge csempénként (üresség-elv: 0-nál NEM jelenik meg badge —
  // üres állapotot nem hirdetünk). Bővítés: új élő szám = egy sor ide.
  const liveBadge: Record<string, number> = { "/b2b": b2bOpenCount };

  const tileCls =
    "relative flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3.5 text-center shadow-card transition active:scale-[0.97]";
  const tileInner = (m: (typeof MODULES)[number]) => (
    <>
      {(liveBadge[m.href] ?? 0) > 0 && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
          {liveBadge[m.href]}
        </span>
      )}
      <span className={`grid h-10 w-10 place-items-center rounded-[12px] ${TONE_CHIP[m.tone]}`}>
        <Icon name={m.icon} size={19} strokeWidth={2.2} />
      </span>
      <span className="text-[11.5px] font-bold leading-tight text-ink">{m.label}</span>
    </>
  );

  return (
    <section className="space-y-3">
      <SectionHeader>Mit tud a Kinti?</SectionHeader>
      <p className="-mt-1.5 text-[12.5px] leading-snug text-ink-muted">
        Egy app — minden a kinti élethez: munka, pénz, nyelv, ügyintézés.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {modules.map((m) =>
          m.external ? (
            <a key={m.href} href={m.href} target="_blank" rel="noopener noreferrer" className={tileCls}>
              {tileInner(m)}
            </a>
          ) : (
            <Link key={m.href} href={m.href} className={tileCls}>
              {tileInner(m)}
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
