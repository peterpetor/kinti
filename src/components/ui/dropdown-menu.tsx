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

  const close = () => setIsOpen(false);

  const linkClass =
    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-bold text-ink hover:bg-surface-alt transition-all active:scale-[0.98]";

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
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface-alt text-ink transition-transform hover:rotate-90 hover:bg-line active:scale-90"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1 custom-scrollbar">

              {/* ── PRO csomagok (kiemelt) ─────────────── */}
              <Link
                href="/pro"
                onClick={close}
                className="mb-2 flex items-center gap-3 rounded-xl border border-[#e3a233]/30 bg-[#e3a233]/10 px-4 py-3.5 text-[15px] font-black text-[#e3a233] transition-all hover:bg-[#e3a233]/15 active:scale-[0.98]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e3a233]/20 text-[#e3a233]">
                  <Icon name="sparkles" size={16} strokeWidth={2.6} />
                </span>
                Kinti PRO csomagok
                <span className="ml-auto rounded-full bg-[#e3a233] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  PRO
                </span>
              </Link>

              {/* ── Gyors elérés (mindig látszik) ──────── */}
              <Link href="/vallalkozo" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="plus" size={16} strokeWidth={2.6} />
                </span>
                Vidd fel a vállalkozásod
              </Link>
              <Link href="/allasok" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="shoppingBag" size={16} strokeWidth={2.4} />
                </span>
                Álláshirdetések
              </Link>
              <Link href="/szaknevsor?fav=1" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name="heart" size={16} strokeWidth={2.4} filled={true} />
                </span>
                Kedvenceim
              </Link>
              <Link href="/sajatjaim" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="bookmark" size={16} strokeWidth={2.4} />
                </span>
                Saját posztjaim
              </Link>

              {/* ── Összecsukható szekciók (alapból zárva) ── */}
              <CollapsibleSection title="Toborzás & AI">
                <Link href="/munkaltato" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="user" size={16} strokeWidth={2.4} />
                  </span>
                  Munkáltatói Irányítópult
                </Link>
                <Link href="/allasok/interju-szimulator" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="sparkles" size={16} strokeWidth={2.4} />
                  </span>
                  AI Interjú Szimulátor
                  <ProBadge />
                </Link>
                <Link href="/allasok/szakmai-szotar" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e3a233]/10 text-[#e3a233]">
                    <Icon name="document" size={16} strokeWidth={2.4} />
                  </span>
                  Szakmai Gyors-Szótár
                  <ProBadge />
                </Link>
              </CollapsibleSection>

              <CollapsibleSection title="Tudás & Ügyintézés">
                <Link href="/kikoltozes" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="check" size={16} strokeWidth={2.4} />
                  </span>
                  Kiköltözés Tracker
                </Link>
                <Link href="/allasok/onboarding" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success">
                    <Icon name="check" size={16} strokeWidth={2.4} />
                  </span>
                  Svájci Kezdőcsomag (Checklist)
                </Link>
                <Link href="/tudasbazis" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="globe" size={16} strokeWidth={2.4} />
                  </span>
                  Tudásbázis
                </Link>
                <Link href="/ugyintezes" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    📋
                  </span>
                  Ügyintézés Varázsló
                </Link>
                <Link href="/iskolarendszer" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fef3c7] text-[#d97706] text-base">
                    🏢
                  </span>
                  Svájci Iskolarendszer
                </Link>
                <Link href="/vizum" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🪪
                  </span>
                  Melyik engedély kell?
                </Link>
                <Link href="/allampolgarsag" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🇨🇭
                  </span>
                  Einbürgerung-szimulátor
                  <ProBadge />
                </Link>
              </CollapsibleSection>

              <CollapsibleSection title="Pénzügyek & Kalkulátorok">
                <Link href="/arfolyam" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    💱
                  </span>
                  CHF / HUF árfolyam
                </Link>
                <Link href="/berkalkulator" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                    💰
                  </span>
                  Svájci Bérkalkulátor
                </Link>
                <Link href="/iranytu" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                    📊
                  </span>
                  Bér- és Lakbér Iránytű
                </Link>
                <Link href="/lakberles" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🏠
                  </span>
                  Bérlés rejtett-költség
                </Link>
                <Link href="/szolgaltato-valto" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                    🔄
                  </span>
                  Szolgáltató Váltó
                </Link>
              </CollapsibleSection>

              <CollapsibleSection title="Utazás & Térkép">
                <Link href="/kozlekedes" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🚆
                  </span>
                  Tömegközlekedés
                </Link>
                <Link href="/repulojegy" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    ✈️
                  </span>
                  Repülőjegy-figyelő
                </Link>
                <Link href="/vam" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🛂
                  </span>
                  Vám-kalkulátor
                </Link>
                <Link href="/bussen" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                    🚓
                  </span>
                  Gyorshajtás kalkulátor
                </Link>
                <Link href="/akciok" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                    🏷️
                  </span>
                  Akciók a térképen
                </Link>
              </CollapsibleSection>

              <CollapsibleSection title="Játék">
                <Link href="/nyelvlecke" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🦉
                  </span>
                  Svájci Német (Mundart)
                </Link>
                <Link href="/kviz" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                    🎯
                  </span>
                  Napi Svájci Kvíz
                </Link>
              </CollapsibleSection>

              <CollapsibleSection title="Jogi & Segítség">
                <Link href="/segitseg" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success">
                    <Icon name="question" size={16} strokeWidth={2.4} />
                  </span>
                  Segítség és GYIK
                </Link>
                <Link href="/impresszum" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-muted/10 text-ink-muted">
                    <Icon name="flag" size={16} strokeWidth={2.4} />
                  </span>
                  Impresszum
                </Link>
                <Link href="/adatvedelem" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-muted/10 text-ink-muted">
                    <Icon name="bookmark" size={16} strokeWidth={2.4} />
                  </span>
                  Adatvédelem
                </Link>
                <Link href="/aszf" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-muted/10 text-ink-muted">
                    <Icon name="list" size={16} strokeWidth={2.4} />
                  </span>
                  ÁSZF
                </Link>
                <a href="mailto:abuse@kinti.app" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="bell" size={16} strokeWidth={2.4} />
                  </span>
                  Visszaélés-bejelentés
                </a>
              </CollapsibleSection>

              {isLoaded && isSignedIn && (
                <SignOutButton redirectUrl="/">
                  <button className="flex w-full items-center justify-center gap-2.5 mt-3 px-4 py-3.5 rounded-2xl text-[14.5px] font-black text-ink bg-surface-alt hover:bg-line transition-all active:scale-[0.98]">
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

/**
 * Összecsukható menü-szekció — alapból zárva, hogy a ~30 elemes menü ne legyen
 * áttekinthetetlen. A fejléc-gombra koppintva nyílik/zárul.
 */
function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-alt"
      >
        <span className="flex-1 text-[11px] font-black uppercase tracking-widest text-ink-faint">
          {title}
        </span>
        <Icon
          name="chevR"
          size={15}
          strokeWidth={2.6}
          className={cn("text-ink-faint transition-transform", open && "rotate-90")}
        />
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}
