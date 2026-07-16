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
 *   4) Albérlet   — szoba- és albérlet-börze (a korábbi Iránytű-fül helyén)
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
  // 2026-07-16 (user-döntés): az Iránytű fül helyét a Szoba- és albérlet-börze
  // vette át (mind a 4 országban él → nincs feature-kapu). Az Iránytű a
  // kezdőlapi modul-rácsról továbbra is elérhető (home-platform-grid).
  { href: "/szallas-borze", label: "Albérlet", icon: "bed" },
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

  // Natív minta: lefelé görgetésnél a TabBar kiúszik alul (több hely a tartalomnak),
  // felfelé görgetésre / az oldal tetején-alján azonnal visszaúszik. Reduced-motion
  // alatt ki van kapcsolva (mindig látható). A layout-padding nem függ tőle
  // (fixed elem), így a tartalom nem ugrál.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      const nearBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 60;
      if (y < 120 || nearBottom) setHidden(false);
      else if (dy > 8) setHidden(true);
      else if (dy < -8) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Route-váltásra mindig visszaúszik (új oldal teteje).
  useEffect(() => setHidden(false), [pathname]);

  // Lecke-lejátszó (immerzív): ne lógjon rá a navigáció az alsó CTA-ra.
  if (isImmersiveRoute(pathname)) return null;

  return (
    <nav
      aria-hidden={hidden || undefined}
      // inert: elrejtve a linkjei billentyűzettel se legyenek elérhetők (a11y).
      // React 18-ban az inert prop nincs a típusokban — attribútumként szórjuk.
      {...(hidden ? ({ inert: "" } as unknown as Record<string, string>) : {})}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]",
        "transition-transform duration-300 ease-out",
        hidden && "translate-y-[150%]",
      )}
    >
      <div className="glass pointer-events-auto flex w-full max-w-md items-stretch gap-1 rounded-[22px] border border-line p-1.5 shadow-pop">
        {tabs.map((t) => {
          const active = isActive(pathname, t);
          return (
            <Link
              key={t.href}
              href={t.href}
              onClick={(e) => {
                if (active) {
                  // Natív minta: az AKTÍV fül újra-koppintása az oldal tetejére
                  // görget (navigáció helyett) — reduced-motion alatt ugrással.
                  e.preventDefault();
                  haptic("tap");
                  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
                } else {
                  haptic("selection");
                }
              }}
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
