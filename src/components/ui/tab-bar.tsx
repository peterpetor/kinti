"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";
import { isImmersiveRoute } from "@/lib/immersive-routes";

/**
 * TabBar — alsó, lebegő üveg-navigáció. Stabil fülek, auth-független label:
 *   1) Főoldal    — dashboard
 *   2) Szaknévsor — vállalkozás-kereső
 *   3) Állások    — álláshirdetések / munkáltató
 *   4) Iránytű    — ingyenes bér- és lakbér-benchmark
 */
interface Tab {
  href: string;
  label: string;
  icon: IconName;
  /** Ezekre a prefix-ekre is aktívnak számít (a href-en felül). */
  alsoMatch?: string[];
  /** Ha megadva, csak akkor látszik, ha a funkció elérhető az országban. */
  feature?: string;
}

const TABS: Tab[] = [
  { href: "/", label: "Főoldal", icon: "home" },
  { href: "/szaknevsor", label: "Szaknévsor", icon: "list" },
  { href: "/allasok", label: "Állások", icon: "briefcase", alsoMatch: ["/munkaltato"] },
  // Iránytű = svájci bér/lakbér-benchmark → csak CH (lib/feature-availability).
  { href: "/iranytu", label: "Iránytű", icon: "compass", feature: "iranytu" },
];

function isActive(pathname: string, tab: Tab): boolean {
  if (tab.href === "/") return pathname === "/";
  if (pathname.startsWith(tab.href)) return true;
  return tab.alsoMatch?.some((p) => pathname.startsWith(p)) ?? false;
}


export function TabBar() {
  const pathname = usePathname();
  // Ország-tudatos fülek: hidratálás-biztos (mount előtt CH-default = minden fül,
  // egyezik az SSR-rel; mount után a választott ország szerint szűrünk).
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  const tabs = TABS.filter((t) => !t.feature || isFeatureAvailable(t.feature, country));

  // Lecke-lejátszó (immerzív): ne lógjon rá a navigáció az alsó CTA-ra.
  if (isImmersiveRoute(pathname)) return null;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="glass pointer-events-auto flex w-full max-w-md items-stretch gap-1 rounded-[22px] border border-line p-1.5 shadow-pop">
        {tabs.map((t) => {
          const active = isActive(pathname, t);
          return (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => { if (!active) haptic("selection"); }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-[1] flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11.5px] transition duration-200 active:scale-[0.94]",
                active ? "bg-primary/10 text-primary" : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {/* Aktívvá váláskor a meglévő kinti-pop mikro-animáció fut le az ikonon
                  (a class megjelenése indítja — reduced-motion alatt kikapcsol). */}
              <span className={cn("grid place-items-center", active && "kinti-pop")}>
                <Icon name={t.icon} size={24} strokeWidth={active ? 2.2 : 1.7} />
              </span>
              <span className={active ? "font-bold" : "font-medium"}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
