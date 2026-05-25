"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

/**
 * TabBar — alsó, lebegő üveg-navigáció (Home/Térkép, Szaknévsor, Közösség,
 * Profil). A külső sávon `pointer-events-none` engedi át az érintést a margón,
 * a belső `.glass` doboz `pointer-events-auto`. Safe-area-tudatos alsó padding.
 */
const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Főoldal", icon: "home" },
  { href: "/szaknevsor", label: "Szaknévsor", icon: "list" },
  { href: "/kozosseg", label: "Közösség", icon: "users" },
  { href: "/profil", label: "Profil", icon: "user" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="glass pointer-events-auto flex w-full max-w-md items-stretch gap-1 rounded-[22px] border border-line p-1.5 shadow-pop">
        {TABS.map((t) => {
          const active = isActive(pathname, t.href);
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
