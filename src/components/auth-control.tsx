"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Icon } from "@/components/ui";

/**
 * AuthControl — fejléc-elem: bejelentkezve a Clerk UserButton (avatar + menü),
 * kijelentkezve egy márkagomb, ami modális belépést nyit (nincs külön oldal-
 * ugrás a böngészéshez).
 */
export function AuthControl() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-2 text-sm font-bold text-white shadow-card transition active:scale-95"
            title="Csak vállalkozóknak — közösségi taghoz nem kell fiók"
          >
            <Icon name="user" size={16} strokeWidth={2.2} />
            Vállalkozói belépés
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
      </SignedIn>
    </>
  );
}
