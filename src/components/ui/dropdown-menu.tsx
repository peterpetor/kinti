"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { Icon } from "./icons";
import { cn } from "@/lib/cn";

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
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

  const Divider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 px-2 pt-4 pb-1">
      <div className="h-px flex-1 bg-line/60" />
      <span className="text-[10px] font-black uppercase tracking-widest text-ink-faint">{label}</span>
      <div className="h-px flex-1 bg-line/60" />
    </div>
  );

  const ProBadge = () => (
    <span className="ml-auto rounded-full bg-[#e3a233]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e3a233]">
      PRO
    </span>
  );

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

      {isOpen && createPortal(
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

              {/* ── Közösség ──────────────────────────── */}
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

              <Link href="/sajatjaim" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="bookmark" size={16} strokeWidth={2.4} />
                </span>
                Saját posztjaim
              </Link>

              {/* ── Toborzás & Munkáltatók ─────────────── */}
              <Divider label="Toborzás" />

              <Link href="/munkaltato" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="user" size={16} strokeWidth={2.4} />
                </span>
                Munkáltatói Irányítópult
              </Link>

              <Link href="/allasok" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="list" size={16} strokeWidth={2.4} />
                </span>
                Álláshirdetések
              </Link>

              <Link href="/allasok/interju-szimulator" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="sparkles" size={16} strokeWidth={2.4} />
                </span>
                AI Interjú Szimulátor
                <ProBadge />
              </Link>

              <Link href="/allasok/szakmai-szotar" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e3a233]/10 text-[#e3a233]">
                  <Icon name="document" size={16} strokeWidth={2.4} />
                </span>
                Szakmai Gyors-Szótár
                <ProBadge />
              </Link>

              {/* ── Tudás & Ügyintézés ─────────────────── */}
              <Divider label="Tudás & Ügyintézés" />

              <Link href="/kikoltozes" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name="check" size={16} strokeWidth={2.4} />
                </span>
                Kiköltözés Tracker
              </Link>

              <Link href="/allasok/onboarding" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success">
                  <Icon name="check" size={16} strokeWidth={2.4} />
                </span>
                Svájci Kezdőcsomag (Checklist)
              </Link>

              <Link href="/tudasbazis" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="globe" size={16} strokeWidth={2.4} />
                </span>
                Tudásbázis
              </Link>

              <Link href="/ugyintezes" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  📋
                </span>
                Ügyintézés Varázsló
              </Link>

              <Link href="/iskolarendszer" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fef3c7] text-[#d97706] text-base">
                  🏢
                </span>
                Svájci Iskolarendszer
              </Link>

              <Link href="/vizum" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  🪪
                </span>
                Melyik engedély kell?
              </Link>

              <Link href="/allampolgarsag" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  🇨🇭
                </span>
                Einbürgerung-szimulátor
                <ProBadge />
              </Link>

              {/* ── Pénzügyek & Kalkulátorok ───────────── */}
              <Divider label="Pénzügyek" />

              <Link href="/arfolyam" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  💱
                </span>
                CHF / HUF árfolyam
              </Link>

              <Link href="/berkalkulator" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                  💰
                </span>
                Svájci Bérkalkulátor
              </Link>

              <Link href="/iranytu" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                  📊
                </span>
                Bér- és Lakbér Iránytű
              </Link>

              <Link href="/lakberles" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  🏠
                </span>
                Bérlés rejtett-költség
              </Link>

              <Link href="/szolgaltato-valto" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                  🔄
                </span>
                Szolgáltató Váltó
              </Link>

              {/* ── Utazás & Térkép ────────────────────── */}
              <Divider label="Utazás & Térkép" />

              <Link href="/kozlekedes" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  🚆
                </span>
                Tömegközlekedés
              </Link>

              <Link href="/repulojegy" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  ✈️
                </span>
                Repülőjegy-figyelő
              </Link>

              <Link href="/vam" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  🛂
                </span>
                Vám-kalkulátor
              </Link>

              <Link href="/bussen" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                  🚓
                </span>
                Gyorshajtás kalkulátor
              </Link>

              <Link href="/akciok" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                  🏷️
                </span>
                Akciók a térképen
              </Link>


              {/* ── Játék ─────────────────────────────── */}
              <Divider label="Játék" />

              <Link href="/nyelvlecke" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                  🦉
                </span>
                Svájci Német (Mundart)
              </Link>

              <Link href="/kviz" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                  🎯
                </span>
                Napi Svájci Kvíz
              </Link>

              {/* ── Jogi & Segítség ───────────────────── */}
              <Divider label="Jogi & Segítség" />

              <Link href="/segitseg" onClick={() => setIsOpen(false)} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success">
                  <Icon name="question" size={16} strokeWidth={2.4} />
                </span>
                Segítség és GYIK
              </Link>

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
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
