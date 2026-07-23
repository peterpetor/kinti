"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, SectionHeader } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";
import { haptic } from "@/lib/haptics";
import { recordUse } from "@/lib/usage-frecency";

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

/**
 * A sorrend SZÁNDÉKOS: az első 9 (= az összecsukott nézet 3 sora) a hétköznapi,
 * magas-gyakoriságú eszköz — a speciálisabbak (AI-eszközök, B2B, Kinti Pass…)
 * a „Mutasd az összes eszközt" mögött várnak. Új csempe felvételekor dönteni
 * kell: hétköznapi (első 9 közé) vagy speciális (utána).
 */
const MODULES: { href: string; icon: IconName; label: string; tone: Tone; external?: boolean }[] = [
  { href: "/szaknevsor", icon: "list", label: "Szaknévsor", tone: "work" },
  { href: "/allasok", icon: "briefcase", label: "Állások", tone: "work" },
  // Piactér-összevonás (2026-07-16): börze + lakbér-kalkulátor + sajátjaim egy
  // csempén. Címke 2026-07-18 (user-kérés): „Albérlet" — egyezik a TabBar-füllel.
  { href: "/piacter", icon: "key", label: "Albérlet", tone: "money" },
  { href: "/berkalkulator", icon: "sliders", label: "Bérkalkulátor", tone: "money" },
  { href: "/utalas", icon: "send", label: "Utalás", tone: "money" },
  { href: "/ugyintezes", icon: "document", label: "Ügyintézés", tone: "work" },
  // Tudásbázis-konszolidáció (2026-07-16): a téma-csempék (hivatalos linkek,
  // bírság-becslő, vám, állampolgárság, iskolarendszer, kiköltözés, vízum) a
  // /tudasbazis alá költöztek — a rácson EGY belépő, az oldal eszköz-szekciója
  // sorolja fel őket.
  { href: "/tudasbazis", icon: "bookmark", label: "Tudásbázis", tone: "learn" },
  { href: "/nyelvlecke", icon: "globe", label: "Nyelvlecke", tone: "learn" },
  // A CV-készítő a mérés szerint alul-exponált volt (csak menüből ért el) —
  // a kezdőlap a legerősebb felület, ide való a zászlós ingyenes eszköz.
  { href: "/nemet-oneletrajz", icon: "document", label: "Német CV", tone: "work" },
  // ── Innen a speciálisabb réteg (összecsukva rejtve) ──
  { href: "/keresek", icon: "search", label: "Keresek", tone: "work" },
  { href: "/allasok/cv-audit", icon: "magic", label: "AI CV-asszisztens", tone: "work" },
  { href: "/iranytu", icon: "compass", label: "Iránytű", tone: "money" },
  { href: "/szolgaltato-valto", icon: "filter", label: "Szolgáltató-váltó", tone: "money" },
  { href: "/kviz", icon: "star", label: "Kvíz", tone: "learn" },
  { href: "/hatarido", icon: "clock", label: "Határidők", tone: "work" },
  { href: "/kozlekedes", icon: "nav", label: "Közlekedés", tone: "work" },
  { href: "/allasok/szakmai-szotar", icon: "bookmark", label: "Szakmai szótár", tone: "learn" },
  { href: "/repulojegy", icon: "send", label: "Repülőjegy", tone: "social" },
  { href: "/tortenetek", icon: "heart", label: "Élettörténetek", tone: "social" },
  { href: "/profil/kinti-pass", icon: "qrCode", label: "Kinti Pass", tone: "social" },
  { href: "/b2b", icon: "briefcase", label: "B2B Hub", tone: "work" },
  // A papírrepülő a Telegram saját logó-motívuma — külső deep-link a bothoz.
  { href: "https://t.me/KintiSzaknevsorBot", icon: "send", label: "Telegram-bot", tone: "social", external: true },
];

/** Az összecsukott nézet csempe-száma (3 teljes sor a 3-oszlopos rácson). */
const COLLAPSED_COUNT = 9;

export function HomePlatformGrid({ b2bOpenCount = 0 }: { b2bOpenCount?: number }) {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  // Alapból az első 9 hétköznapi csempe látszik — a teljes katalógus egy
  // érintésre nyílik, és a választás megjegyződik (hidratálás-biztos: az SSR
  // mindig összecsukva renderel, mount után áll be a tárolt állapot).
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem("kinti.home.grid.open") === "1") setExpanded(true);
    } catch { /* privát mód — marad az alapállapot */ }
  }, []);
  const toggleExpanded = () => {
    haptic("selection");
    setExpanded((v) => {
      try {
        localStorage.setItem("kinti.home.grid.open", v ? "0" : "1");
      } catch { /* privát mód */ }
      return !v;
    });
  };
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const modules = MODULES.filter(
    (m) => m.external || isFeatureAvailable(m.href.slice(1), country),
  );
  const visibleModules = expanded ? modules : modules.slice(0, COLLAPSED_COUNT);
  const hiddenCount = modules.length - COLLAPSED_COUNT;

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
        {visibleModules.map((m) =>
          m.external ? (
            <a key={m.href} href={m.href} target="_blank" rel="noopener noreferrer" className={tileCls}>
              {tileInner(m)}
            </a>
          ) : (
            <Link key={m.href} href={m.href} onClick={() => recordUse(m.href)} className={tileCls}>
              {tileInner(m)}
            </Link>
          ),
        )}
      </div>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] font-bold text-ink shadow-card transition active:scale-[0.98]"
        >
          {expanded ? "Kevesebb eszköz" : `Mutasd az összes eszközt (${modules.length})`}
          <Icon
            name="chevR"
            size={14}
            strokeWidth={2.6}
            className={`text-ink-muted transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`}
          />
        </button>
      )}
    </section>
  );
}
