"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { Icon } from "./icons";
import { CountrySwitcher } from "./country-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  // Tulajdonosi állapot: van-e már Szaknévsor-vállalkozása? (egy fiók = egy cég)
  // Ez alapján a menü VAGY a „Vidd fel a vállalkozásod”, VAGY a „Vállalkozásom”
  // pontot mutatja — sose mindkettőt. A legutóbbi ismert értéket localStorage-ból
  // indítjuk (azonnal a HELYES pont látszik, nincs téves villanás), nyitáskor
  // pedig a háttérben frissítjük a szerverről.
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(() => {
    try {
      const v = typeof window !== "undefined" ? localStorage.getItem("kinti_has_business") : null;
      return v === "1" ? true : v === "0" ? false : null;
    } catch {
      return null;
    }
  });
  const statusFetched = useRef(false);
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

  // Menü megnyitásakor (bejelentkezett usernél, mount-onként egyszer) frissítjük
  // a szerverről — a cache-elt érték így sosem ragad be (pl. közben létrehozta
  // vagy másik fiókkal lépett be). Hibánál a következő nyitáskor újrapróbáljuk.
  useEffect(() => {
    if (!isOpen || !isSignedIn || statusFetched.current) return;
    statusFetched.current = true;
    let cancelled = false;
    fetch("/api/owner/status")
      .then((r) => (r.ok ? (r.json() as Promise<{ hasBusiness?: boolean }>) : null))
      .then((d) => {
        if (cancelled || !d) return;
        const v = !!d.hasBusiness;
        setHasBusiness(v);
        try {
          localStorage.setItem("kinti_has_business", v ? "1" : "0");
        } catch {}
      })
      .catch(() => {
        statusFetched.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, isSignedIn]);

  const close = () => setIsOpen(false);

  const linkClass =
    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-bold text-ink hover:bg-surface-alt transition-all active:scale-[0.98]";

  // A menü lakatolt/prémium elemei HÁROM külön termékhez tartoznak — a badge KI is
  // mondja, MELYIKhez (nem csak „PRO"), a /pro oldal szín-kódját követve:
  //   • Kinti PRO  → zöld (primary) — magánszemély-funkciók (AI, kalkulátorok)
  //   • Szaknévsor PRO → arany (pro) — a vállalkozásod kiemelése/statisztikája
  //   • Kiemelt Állás → piros (accent) — a munkáltatói hirdetés kiemelése (egyszeri)
  const ProBadge = () => (
    <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-black tracking-wide text-primary">
      Kinti PRO
    </span>
  );
  const BizProBadge = () => (
    <span className="ml-auto shrink-0 rounded-full bg-pro/15 px-2 py-0.5 text-[10.5px] font-black tracking-wide text-pro">
      Szaknévsor PRO
    </span>
  );
  const JobFeaturedBadge = () => (
    <span className="ml-auto shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10.5px] font-black tracking-wide text-accent">
      Kiemelt Állás
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

              {/* ── Gyors elérés — a korábban fejléc nélkül „lógó" pontok most
                  fejléces szekciókba rendezve (mint a többi lenti szekció).
                  Alapból NYITVA (CollapsibleSection default), így semmi nem tűnik
                  el, csak csoportosított és átlátható. ─────────────────────────── */}
              <CollapsibleSection title="Szaknévsor & Állások">
                {/* Egy fiók = egy cég: akinek MÁR van vállalkozása, annak a kezelő
                    pontot mutatjuk; akinek nincs, a felvitel-CTA-t — sose a rosszat.
                    Bejelentkezve, amíg az első állapot-lekérés fut (nincs még cache),
                    semleges skeleton (ne villanjon téves menüpont). Kijelentkezve
                    mindig a felvitel-CTA (a /vallalkozo flow úgyis beléptet). */}
                <Link href="/szaknevsor/ajanlas" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="send" size={16} strokeWidth={2.4} />
                  </span>
                  Ajánlj egy magyar vállalkozást
                </Link>
                {isSignedIn && hasBusiness === null ? (
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" aria-hidden>
                    <span className="h-8 w-8 shrink-0 rounded-xl bg-surface-alt animate-pulse" />
                    <span className="h-4 w-44 rounded-md bg-surface-alt animate-pulse" />
                  </div>
                ) : isSignedIn && hasBusiness ? (
                  <Link href="/profil" onClick={close} className={linkClass}>
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-pro/10 text-pro text-base">
                      🏪
                    </span>
                    Vállalkozásom
                    <BizProBadge />
                  </Link>
                ) : (
                  <Link href="/vallalkozo" onClick={close} className={linkClass}>
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon name="plus" size={16} strokeWidth={2.6} />
                    </span>
                    Vidd fel a vállalkozásod
                  </Link>
                )}
                <Link href="/b2b" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-pro/10 text-base">
                    🤝
                  </span>
                  B2B Hub — projektpiac
                  <BizProBadge />
                </Link>
                <Link href="/allasok" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="briefcase" size={16} strokeWidth={2.4} />
                  </span>
                  Álláshirdetések
                </Link>
                <Link href="/allasok/profil" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="user" size={16} strokeWidth={2.4} />
                  </span>
                  Munkavállalói profil
                </Link>
                <Link href="/nemet-oneletrajz" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success">
                    <Icon name="document" size={16} strokeWidth={2.4} />
                  </span>
                  Német önéletrajz készítő
                </Link>
                <Link href="/munkaltato" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="user" size={16} strokeWidth={2.4} />
                  </span>
                  Munkáltatói Irányítópult
                  <JobFeaturedBadge />
                </Link>
              </CollapsibleSection>

              <CollapsibleSection title="Közösség & Profilom">
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
                <Link href="/profil/kinti-pass" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-star/15 text-base">🎟️</span>
                  Kinti Pass (kedvezménykártya)
                </Link>
              </CollapsibleSection>

              {/* ── Összecsukható szekciók (alapból zárva) ──
                  A munkakeresés/-adás pontjai (Munkavállalói profil, Munkáltatói
                  Irányítópult) átkerültek a „Szaknévsor & Állások" szekcióba —
                  itt már csak az AI-alapú felkészülő eszközök maradtak, ezért a
                  cím „Toborzás & AI" → „Felkészülés & AI". */}
              <CollapsibleSection title="Felkészülés & AI">
                <Link href="/allasok/interju-szimulator" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="sparkles" size={16} strokeWidth={2.4} />
                  </span>
                  AI Interjú Szimulátor
                  <ProBadge />
                </Link>
                <Link href="/allasok/cv-audit" onClick={close} className={linkClass}>
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
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-star/15 text-star text-base">
                    🏢
                  </span>
                  {isCH ? "Svájci Iskolarendszer" : country === "DE" ? "Német Iskolarendszer" : country === "NL" ? "Holland Iskolarendszer" : "Osztrák Iskolarendszer"}
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
                    {isCH ? "🇨🇭" : country === "AT" ? "🇦🇹" : country === "DE" ? "🇩🇪" : country === "NL" ? "🇳🇱" : "🌍"}
                  </span>
                  Állampolgársági teszt
                  <ProBadge />
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
                <Link href="/hivatalos" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🏛️
                  </span>
                  Hivatalos linkek
                </Link>
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
                <Link href="/mennyit-koltesz" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-success/10 text-success text-base">
                    💸
                  </span>
                  Mennyit költesz?
                </Link>
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
                <Link href="/utalas" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    💸
                  </span>
                  Utalás-asszisztens
                  <ProBadge />
                </Link>
                <Link href="/hatarido" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                    ⏰
                  </span>
                  Határidő-asszisztens
                  <ProBadge />
                </Link>
              </CollapsibleSection>

              <CollapsibleSection title="Játék">
                {has("nyelvlecke") && (
                <Link href="/nyelvlecke" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                    🦉
                  </span>
                  {isCH ? "Svájci Német (Mundart)" : country === "DE" ? "Német (Hochdeutsch)" : country === "NL" ? "Holland (Nederlands)" : "Osztrák Német"}
                  <ProBadge />
                </Link>
                )}
                {has("kviz") && (
                <Link href="/kviz" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent text-base">
                    🎯
                  </span>
                  {isCH ? "Napi Svájci Kvíz" : country === "DE" ? "Napi Német Kvíz" : country === "NL" ? "Napi Holland Kvíz" : "Napi Osztrák Kvíz"}
                </Link>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Alkalmazás beállítások">
                {/* Megjelenés — nem link, hanem téma-váltó vezérlő */}
                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <span className="flex items-center gap-3 text-[15px] font-bold text-ink">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary text-base">
                      🎨
                    </span>
                    Megjelenés
                  </span>
                  <ThemeToggle />
                </div>
                <Link href="/hirlevel" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="send" size={16} strokeWidth={2.4} />
                  </span>
                  Hírlevél
                </Link>
                <Link href="/ertesitesek" onClick={close} className={linkClass}>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="bell" size={16} strokeWidth={2.4} />
                  </span>
                  Értesítések
                </Link>
              </CollapsibleSection>

              {/* ── Közösségi média — kövess minket a platformokon ─────────── */}
              <CollapsibleSection title="Kövess minket">
                <a
                  href="https://www.facebook.com/profile.php?id=61591833836890"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={linkClass}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1877F2]/10 text-[#1877F2]">
                    <Icon name="facebook" size={16} strokeWidth={2.2} />
                  </span>
                  Facebook
                </a>
                <a
                  href="https://www.linkedin.com/company/kintiapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={linkClass}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#0A66C2]/10 text-[#0A66C2]">
                    <Icon name="linkedin" size={16} strokeWidth={2.2} />
                  </span>
                  LinkedIn
                </a>
                <a
                  href="https://www.youtube.com/@kintiapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={linkClass}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#FF0000]/10 text-[#FF0000]">
                    <Icon name="youtube" size={16} strokeWidth={2.2} />
                  </span>
                  YouTube
                </a>
                <a
                  href="https://www.tiktok.com/@kintiapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={linkClass}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#FE2C55]/10 text-[#FE2C55]">
                    <Icon name="tiktok" size={16} strokeWidth={2.2} />
                  </span>
                  TikTok
                </a>
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

              {/* Belépés (kijelentkezve) / Kijelentkezés (bejelentkezve). Amíg a
                  Clerk töltődik (isLoaded=false) egyiket sem mutatjuk, hogy ne
                  villanjon téves gomb. */}
              {isLoaded && (isSignedIn ? (
                <SignOutButton redirectUrl="/">
                  <button className="flex w-full items-center justify-center gap-2.5 mt-3 px-4 py-3.5 rounded-2xl text-[14.5px] font-black text-ink bg-surface-alt hover:bg-line transition-all active:scale-[0.98]">
                    <Icon name="user" size={16} strokeWidth={2.4} />
                    Kijelentkezés
                  </button>
                </SignOutButton>
              ) : (
                <Link
                  href="/belepes"
                  onClick={close}
                  className="flex w-full items-center justify-center gap-2.5 mt-3 px-4 py-3.5 rounded-2xl text-[14.5px] font-black text-white bg-primary hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <Icon name="user" size={16} strokeWidth={2.4} />
                  Belépés / Regisztráció
                </Link>
              ))}
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
