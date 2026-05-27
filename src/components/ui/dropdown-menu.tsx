"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";
import { SosModal } from "../views/sos-modal";

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Kívülre kattintás kezelése a menü bezárásához
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkClass =
    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold text-ink hover:bg-surface-alt transition-all active:scale-[0.98]";

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menü megnyitása"
        className={cn(
          "grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95 cursor-pointer focus:outline-none",
          isOpen && "border-primary bg-surface-alt"
        )}
      >
        <Icon name="more" size={17} strokeWidth={2.6} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-line p-2 shadow-pop z-50 animate-fade-in space-y-0.5 text-left">
          {/* Fő akciók */}
          
          <button 
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsSosOpen(true);
            }} 
            className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold text-red-600 hover:bg-red-50 transition-all active:scale-[0.98]"
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-red-100 text-red-600">
              🆘
            </span>
            Közösségi S.O.S.
          </button>
          
          <div className="h-px bg-line/60 my-1 mx-2" />

          {isLoaded && isSignedIn ? (
            <Link href="/profil" onClick={() => setIsOpen(false)} className={linkClass}>
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name="user" size={13} strokeWidth={2.4} />
              </span>
              Profilom
            </Link>
          ) : (
            <Link href="/belepes" onClick={() => setIsOpen(false)} className={linkClass}>
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name="user" size={13} strokeWidth={2.4} />
              </span>
              Vállalkozói belépés
            </Link>
          )}

          <Link href="/szaknevsor?fav=1" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-accent/10 text-accent">
              <Icon name="heart" size={13} strokeWidth={2.4} filled={true} />
            </span>
            Kedvenceim
          </Link>

          <Link href="/kozosseg/uj-esemeny" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#E4405F]/10 text-[#E4405F]">
              <Icon name="calendar" size={13} strokeWidth={2.4} />
            </span>
            Esemény beküldése
          </Link>

          <Link href="/kozosseg/uj-hirdetes" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
              <Icon name="plus" size={13} strokeWidth={2.4} />
            </span>
            Új hirdetés
          </Link>

          <Link href="/tudasbazis" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name="globe" size={13} strokeWidth={2.4} />
            </span>
            Tudásbázis
          </Link>

          {/* Elválasztó */}
          <div className="h-px bg-line/60 my-1 mx-2" />

          {/* Jogi linkek */}
          <Link href="/impresszum" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-ink-muted/10 text-ink-muted">
              <Icon name="flag" size={13} strokeWidth={2.4} />
            </span>
            Impresszum
          </Link>

          <Link href="/adatvedelem" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-ink-muted/10 text-ink-muted">
              <Icon name="bookmark" size={13} strokeWidth={2.4} />
            </span>
            Adatvédelem
          </Link>

          <Link href="/aszf" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-ink-muted/10 text-ink-muted">
              <Icon name="list" size={13} strokeWidth={2.4} />
            </span>
            ÁSZF
          </Link>

          <a href="mailto:abuse@kinti.app" onClick={() => setIsOpen(false)} className={linkClass}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-accent/10 text-accent">
              <Icon name="bell" size={13} strokeWidth={2.4} />
            </span>
            Visszaélés-bejelentés
          </a>
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
