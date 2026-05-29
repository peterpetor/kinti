"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";
import { SosModal } from "../views/sos-modal";

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const linkClass =
    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-bold text-ink hover:bg-surface-alt transition-all active:scale-[0.98]";

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Menü megnyitása"
        className={cn(
          "grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95 cursor-pointer focus:outline-none"
        )}
      >
        <Icon name="more" size={17} strokeWidth={2.6} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center sm:items-center bg-surface sm:bg-black/50 sm:backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex w-full max-w-md flex-col bg-surface h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-line shrink-0">
              <h2 className="text-xl font-black text-ink tracking-tight">Menü</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface-alt text-ink transition-transform hover:rotate-90 hover:bg-line active:scale-90"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1 custom-scrollbar">
              {/*
                * A vállalkozók saját rekordjukat NEM belépéssel, hanem a confirmáló
                * email-ben kapott kezelő-linkkel szerkesztik. Ezért nincs külön
                * "Vállalkozói belépés" a menüben. Adminok a /belepes URL-t használják.
                */}
              <Link href="/vallalkozo" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="plus" size={16} strokeWidth={2.6} />
                </span>
                Vidd fel a vállalkozásod
              </Link>

              <Link href="/szaknevsor?fav=1" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name="heart" size={16} strokeWidth={2.4} filled={true} />
                </span>
                Kedvenceim
              </Link>

              <Link href="/kozosseg/uj-esemeny" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#E4405F]/10 text-[#E4405F]">
                  <Icon name="calendar" size={16} strokeWidth={2.4} />
                </span>
                Esemény beküldése
              </Link>

              <Link href="/kozosseg/uj-hirdetes" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1877F2]/10 text-[#1877F2]">
                  <Icon name="plus" size={16} strokeWidth={2.4} />
                </span>
                Új hirdetés
              </Link>

              <Link href="/sajatjaim" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="bookmark" size={16} strokeWidth={2.4} />
                </span>
                Saját posztjaim
              </Link>

              <Link href="/tudasbazis" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="globe" size={16} strokeWidth={2.4} />
                </span>
                Tudásbázis
              </Link>

              <div className="h-px bg-line/60 my-4 mx-2" />

              {/* Jogi linkek */}
              <Link href="/impresszum" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-muted/10 text-ink-muted">
                  <Icon name="flag" size={16} strokeWidth={2.4} />
                </span>
                Impresszum
              </Link>

              <Link href="/adatvedelem" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-muted/10 text-ink-muted">
                  <Icon name="bookmark" size={16} strokeWidth={2.4} />
                </span>
                Adatvédelem
              </Link>

              <Link href="/aszf" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-muted/10 text-ink-muted">
                  <Icon name="list" size={16} strokeWidth={2.4} />
                </span>
                ÁSZF
              </Link>

              <a href="mailto:abuse@kinti.app" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name="bell" size={16} strokeWidth={2.4} />
                </span>
                Visszaélés-bejelentés
              </a>

              {isLoaded && isSignedIn && (
                <SignOutButton redirectUrl="/">
                  <button className="flex w-full items-center justify-center gap-2.5 mt-2 px-4 py-3.5 rounded-2xl text-[14.5px] font-black text-ink bg-surface-alt hover:bg-line transition-all active:scale-[0.98]">
                    <Icon name="user" size={16} strokeWidth={2.4} />
                    Kijelentkezés
                  </button>
                </SignOutButton>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsSosOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2.5 mt-4 px-4 py-3.5 rounded-2xl text-[14.5px] font-black text-white bg-red-600 hover:bg-red-700 transition-all active:scale-[0.98] shadow-card"
              >
                <span className="text-base leading-none">🆘</span>
                Közösségi S.O.S. Radar
              </button>
            </div>
          </div>
        </div>
      )}

      {isSosOpen && (
        <SosModal
          onClose={() => setIsSosOpen(false)}
          onSuccess={() => {
            setIsSosOpen(false);
          }}
        />
      )}
    </div>
  );
}
