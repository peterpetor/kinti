"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Icon } from "@/components/ui";

/**
 * AuthControl �� fejléc-elem: bejelentkezve a Clerk UserButton (avatar + menü),
 * kijelentkezve egy márkagomb, ami a /belepes oldalra navigál. Direkt nem
 * modális, mert ott egy egyértelmű "csak vállalkozóknak" intro fogad — a
 * modal kihagyná ezt a copy-t.
 */
export function AuthControl() {
  return (
    <>
      <Show when="signed-out">
        <Link
          href="/belepes"
          className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-2 text-sm font-bold text-white shadow-card transition active:scale-95"
          title="Csak vállalkozóknak — közösségi taghoz nem kell fiók"
        >
          <Icon name="user" size={16} strokeWidth={2.2} />
          Vállalkozói belépés
        </Link>
      </Show>
      <Show when="signed-in">
        <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
      </Show>
    </>
  );
}
