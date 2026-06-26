"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { Icon } from "./icons";
import { CountrySwitcher } from "./country-switcher";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  // A menü kattintásra (mount után) renderel → az ország közvetlenül olvasható.
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isCH = country === "CH";
  const has = (feature: string) => isFeatureAvailable(feature, country);

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
    <span className="ml-auto rounded-full bg-star/15 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-star">
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

              {/* ── Ország-váltó ───────────────────────── */}
              <CountrySwitcher />

              {/* ── PRO csomagok (kiemelt) ─────────────── */}
              <Link
                href="/pro"
                onClick={close}
                className="mb-2 flex items-center gap-3 rounded-xl border border-star/30 bg-star/10 px-4 py-3.5 text-[15px] font-black text-star transition-all hover:bg-star/15 active:scale-[0.98]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-star/20 text-star">
                  <Icon name="sparkles" size={16} strokeWidth={2.6} />
                </span>
                Kinti PRO csomagok
                <span className="ml-auto rounded-full bg-star px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white">
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
              <Link href="/szaknevsor/ajanlas" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name="send" size={16} strokeWidth={2.4} />
                </span>
                Ajánlj egy magyar vállalkozást
              </Link>
              <Link href="/allasok" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="briefcase" size={16} strokeWidth={2.4} />
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
              <Link href="/ranglista" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-star/15 text-base">🏆</span>
                Közösségi ranglista
              </Link>
              <Link href="/ertesitesek" onClick={close} className={linkClass}>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="bell" size={16} strokeWidth={2.4} />
                </span>
                Értesítések
              </Link>

              {/* ── Összecsukható szekciók (alapból zárva) ── */}
              <CollapsibleSection title="Toborzás & AI">
                <Link href="/allasok/profil" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="user" size={16} strokeWidth={2.4} />
                  </span>
                  Munkavállalói profil
                </Link>
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
                <Link href="/allasok/profil" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success">
                    <Icon name="sparkles" size={16} strokeWidth={2.4} />
                  </span>
                  AI CV-asszisztens
                  <ProBadge />
                </Link>
                {has("szakmai-szotar") && (
                <Link href="/allasok/szakmai-szotar" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-star/10 text-star">
                    <Icon name="document" size={16} strokeWidth={2.4} />
                  </span>
                  Szakmai Gyors-Szótár
                  <ProBadge />
                </Link>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Tudás & Ügyintézés">
                <Link href="/kikoltozes" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="check" size={16} strokeWidth={2.4} />
                  </span>
                  Kiköltözés Tracker
                </Link>
                {has("iskolarendszer") && (
                <Link href="/iskolarendszer" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fef3c7] text-[#d97706] text-base">
                    🏢
                  </span>
                  {isCH ? "Svájci Iskolarendszer" : country === "DE" ? "Német Iskolarendszer" : "Osztrák Iskolarendszer"}
                </Link>
                )}
                {has("vizum") && (
                <Link href="/vizum" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🪪
                  </span>
                  {isCH ? "Tartózkodási engedély" : `Tartózkodás ${countryLocative(country)}`}
                </Link>
                )}
                {has("allampolgarsag") && (
                <Link href="/allampolgarsag" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    {isCH ? "🇨🇭" : "🇦🇹"}
                  </span>
                  {isCH ? "Einbürgerung-szimulátor" : "Állampolgárság"}
                  {isCH && <ProBadge />}
                </Link>
                )}
                {has("ugyintezes") && (
                <Link href="/ugyintezes" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    📋
                  </span>
                  Ügyintézés Varázsló
                </Link>
                )}
                {has("tudasbazis") && (
                <Link href="/tudasbazis" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="globe" size={16} strokeWidth={2.4} />
                  </span>
                  Tudásbázis
                </Link>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Pénzügyek & Kalkulátorok">
                <Link href="/arfolyam" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    💱
                  </span>
                  Árfolyam-figyelő
                </Link>
                {has("berkalkulator") && (
                <Link href="/berkalkulator" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                    💰
                  </span>
                  {isCH ? "Svájci Bérkalkulátor" : "Bérkalkulátor"}
                </Link>
                )}
                {has("iranytu") && (
                <Link href="/iranytu" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                    📊
                  </span>
                  Bér- és Lakbér Iránytű
                </Link>
                )}
                {has("lakberles") && (
                <Link href="/lakberles" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🏠
                  </span>
                  Bérlés rejtett-költség
                </Link>
                )}
                {has("szolgaltato-valto") && (
                <Link href="/szolgaltato-valto" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                    🔄
                  </span>
                  Szolgáltató Váltó
                </Link>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Utazás & Térkép">
                {has("kozlekedes") && (
                <Link href="/kozlekedes" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🚆
                  </span>
                  Tömegközlekedés
                </Link>
                )}
                {has("repulojegy") && (
                <Link href="/repulojegy" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    ✈️
                  </span>
                  Repülőjegy-figyelő
                </Link>
                )}
                {has("vam") && (
                <Link href="/vam" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🛂
                  </span>
                  Vám-kalkulátor
                </Link>
                )}
                {has("bussen") && (
                <Link href="/bussen" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                    🚓
                  </span>
                  Gyorshajtás kalkulátor
                </Link>
                )}
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
                  {isCH ? "Svájci Német (Mundart)" : country === "DE" ? "Német (Hochdeutsch)" : "Osztrák Német"}
                </Link>
                {has("kviz") && (
                <Link href="/kviz" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                    🎯
                  </span>
                  {isCH ? "Napi Svájci Kvíz" : "Napi Osztrák Kvíz"}
                </Link>
                )}
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
  // Alapból NYITVA — a felhasználó ne kelljen minden szekciót külön kinyitnia.
  // (A fejléc-gombbal továbbra is összecsukható, ha valaki mégis szeretné.)
  const [open, setOpen] = useState(true);
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
