"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

/**
 * TabBar — alsó, lebegő üveg-navigáció. Stabil fülek, auth-független label:
 *   1) Főoldal    — dashboard
 *   2) Szaknévsor — vállalkozás-kereső
 *   3) Közösség   — események (alfülekkel)
 *   4) Iránytű    — kalkulátorok / útmutatók
 */
interface Tab {
  href: string;
  label: string;
  icon: IconName;
  /** Ezekre a prefix-ekre is aktívnak számít (a href-en felül). */
  alsoMatch?: string[];
}

const TABS: Tab[] = [
  { href: "/", label: "Főoldal", icon: "home" },
  { href: "/szaknevsor", label: "Szaknévsor", icon: "list" },
  {
    href: "/kozosseg",
    label: "Közösség",
    icon: "users",
  },
  { href: "/allasok", label: "Állások", icon: "shoppingBag", alsoMatch: ["/munkaltato"] },
  { href: "/iranytu", label: "Iránytű", icon: "trending" },
];

function isActive(pathname: string, tab: Tab): boolean {
  if (tab.href === "/") return pathname === "/";
  if (pathname.startsWith(tab.href)) return true;
  return tab.alsoMatch?.some((p) => pathname.startsWith(p)) ?? false;
}

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="glass pointer-events-auto flex w-full max-w-md items-stretch gap-1 rounded-[22px] border border-line p-1.5 shadow-pop">
        {TABS.map((t) => {
          const active = isActive(pathname, t);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-[1] flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10.5px] transition",
                active ? "text-primary" : "text-ink-faint",
              )}
            >
              <Icon name={t.icon} size={24} strokeWidth={active ? 2.2 : 1.7} />
              <span className={active ? "font-bold" : "font-medium"}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
