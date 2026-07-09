"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Icon } from "@/components/ui";

/**
 * Admin kijelentkezés gomb. Az admin felület a `(app)` csoporton KÍVÜL van
 * (nincs TabBar/lenyíló menü, tehát nincs meg a szokásos „Kijelentkezés"),
 * ezért az admin-layout ezt a gombot teszi ki minden admin oldal tetejére.
 */
export function AdminLogoutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink transition hover:bg-surface-alt active:scale-[0.98]"
      >
        <Icon name="user" size={13} strokeWidth={2.4} />
        Kijelentkezés
      </button>
    </SignOutButton>
  );
}
