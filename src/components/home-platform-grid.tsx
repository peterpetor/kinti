import Link from "next/link";
import { Icon, SectionHeader } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";

/**
 * HomePlatformGrid — „Mit tud a Kinti?" modul-rács a kezdőlapon.
 *
 * Egy helyen kirakja a platform TELJES szélességét → komoly, sokoldalú
 * platformnak látszik (nem egy-funkciós app). Minden modul CH-n és AT-n is
 * működik (a tartalom ország-tudatosan alkalmazkodik), ezért statikus, nincs
 * ország-szűrés. Csak valódi, kész funkciókra mutat — semmi „hamarosan".
 */
const MODULES: { href: string; icon: IconName; label: string }[] = [
  { href: "/szaknevsor", icon: "list", label: "Szaknévsor" },
  { href: "/allasok", icon: "briefcase", label: "Állások" },
  { href: "/iranytu", icon: "compass", label: "Iránytű" },
  { href: "/berkalkulator", icon: "sliders", label: "Bérkalkulátor" },
  { href: "/arfolyam", icon: "trending", label: "Árfolyam" },
  { href: "/nyelvlecke", icon: "globe", label: "Nyelvlecke" },
  { href: "/kviz", icon: "star", label: "Kvíz" },
  { href: "/holvagyunk", icon: "pin", label: "Hol vagyunk?" },
  { href: "/esemenyek", icon: "calendar", label: "Események" },
  { href: "/kozosseg", icon: "users", label: "Közösség" },
  { href: "/ugyintezes", icon: "document", label: "Ügyintézés" },
  { href: "/allampolgarsag", icon: "flag", label: "Állampolgárság" },
  { href: "/kikoltozes", icon: "check", label: "Kiköltözés" },
  { href: "/repulojegy", icon: "send", label: "Repülőjegy" },
];

export function HomePlatformGrid() {
  return (
    <section className="space-y-3">
      <SectionHeader>Mit tud a Kinti?</SectionHeader>
      <p className="-mt-1.5 text-[12.5px] leading-snug text-ink-muted">
        Egy app — minden a kinti élethez: munka, pénz, nyelv, ügyintézés, közösség.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3.5 text-center shadow-card transition active:scale-[0.97]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-primary/10 text-primary">
              <Icon name={m.icon} size={19} strokeWidth={2.2} />
            </span>
            <span className="text-[11.5px] font-bold leading-tight text-ink">{m.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
