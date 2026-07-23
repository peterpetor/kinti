"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { Icon, type IconName } from "./icons";
import { CountrySwitcher } from "./country-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";
import { haptic } from "@/lib/haptics";
import { recordUse, getTopUsed } from "@/lib/usage-frecency";

/**
 * Főmenü („…") — ADAT-VEZÉRELT szerkezet (2026-07-12-i átalakítás):
 *
 *  • Menü-szűrő felül: ékezet-független azonnali keresés a ~35 elem között —
 *    gépelésre csak a találatok látszanak, a szekcióik kinyílnak.
 *  • MINDEN szekció alapból NYITVA (user-kérés, 2026-07-12 — a korábbi
 *    „csak a két fő nyitva" alapállapotot váltotta): semmi nincs elrejtve,
 *    a gyors elérést a szűrő adja.
 *  • A nyit/zár állapotot a menü MEGJEGYZI (localStorage kinti.menu.sec2.* —
 *    a kulcs-névtér verziózott, hogy a korábbi alapállapot tárolt „csukva"
 *    értékei ne ragadjanak be) — aki becsuk valamit, annak úgy marad.
 *
 * Felirat-szabályok: [[ui-naming-rules]] (mondatkezdő nagybetű, kötőjeles
 * összetétel, nincs angol szó). Új menüpont = egy sor az items-listában.
 */

type Badge = "pro" | "bizpro" | "job";

interface MenuItem {
  key: string;
  label: string;
  href?: string;
  external?: boolean;
  /** Ikon-doboz tint-osztályai (bg + szöveg-szín). */
  tint: string;
  icon: { name: IconName; filled?: boolean } | { emoji: string };
  badge?: Badge;
  /** Egyedi render (pl. téma-váltó sor, cég-állapot skeleton) — a label a szűrőhöz kell. */
  custom?: ReactNode;
}

interface MenuSection {
  id: string;
  title: string;
  defaultOpen: boolean;
  items: MenuItem[];
}

/** Ékezet-hajtás a menü-szűrőhöz („kalkulator" találja a „kalkulátor"-t). */
function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const BADGE_META: Record<Badge, { label: string; cls: string }> = {
  // HÁROM külön termék — a badge KI is mondja, melyikhez tartozik a lakat
  // (nem csak „PRO"), a /pro oldal szín-kódját követve.
  pro: { label: "Kinti PRO", cls: "bg-primary/10 text-primary" },
  bizpro: { label: "Szaknévsor PRO", cls: "bg-pro/15 text-pro" },
  job: { label: "Kiemelt Állás", cls: "bg-accent/15 text-accent" },
};

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { isSignedIn, isLoaded } = useAuth();
  // Tulajdonosi állapot: van-e már Szaknévsor-vállalkozása? (egy fiók = egy cég)
  // A legutóbbi ismert értéket localStorage-ból indítjuk (azonnal a HELYES pont
  // látszik), nyitáskor a háttérben frissítjük a szerverről.
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(() => {
    try {
      const v = typeof window !== "undefined" ? localStorage.getItem("kinti_has_business") : null;
      return v === "1" ? true : v === "0" ? false : null;
    } catch {
      return null;
    }
  });
  const statusFetched = useRef(false);
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isCH = country === "CH";
  const has = (feature: string) => isFeatureAvailable(feature, country);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Nyitáskor a szűrő tisztán indul.
  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  // „Gyakran használt" — a menü a saját használathoz idomul (kliensoldali
  // számláló, ld. usage-frecency.ts; szerverre semmi nem megy). Nyitáskor
  // frissül, hogy az aznapi kattintások is számítsanak.
  const [topUsed, setTopUsed] = useState<string[]>([]);
  useEffect(() => {
    if (isOpen) setTopUsed(getTopUsed(5));
  }, [isOpen]);

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

  // ── A menü tartalma (ország- és fiók-tudatos) ─────────────────────────────
  const businessItem: MenuItem =
    isSignedIn && hasBusiness === null
      ? {
          key: "biz",
          label: "Vállalkozásom",
          tint: "bg-pro/10 text-pro",
          icon: { name: "store" },
          custom: (
            <div key="biz" className="flex items-center gap-3 px-4 py-3.5 rounded-xl" aria-hidden>
              <span className="h-8 w-8 shrink-0 rounded-xl bg-surface-alt animate-pulse" />
              <span className="h-4 w-44 rounded-md bg-surface-alt animate-pulse" />
            </div>
          ),
        }
      : isSignedIn && hasBusiness
        ? { key: "biz", label: "Vállalkozásom", href: "/profil", tint: "bg-pro/10 text-pro", icon: { name: "store" }, badge: "bizpro" }
        : { key: "biz", label: "Vidd fel a vállalkozásod", href: "/vallalkozo", tint: "bg-primary/10 text-primary", icon: { name: "plus" } };

  const sections: MenuSection[] = [
    {
      id: "szaknevsor",
      title: "Szaknévsor & Állások",
      defaultOpen: true,
      items: [
        { key: "ajanlas", label: "Ajánlj egy magyar vállalkozást", href: "/szaknevsor/ajanlas", tint: "bg-accent/10 text-accent", icon: { name: "send" } },
        businessItem,
        { key: "b2b", label: "B2B Hub — projektpiac", href: "/b2b", tint: "bg-pro/10", icon: { name: "trending" }, badge: "bizpro" },
        { key: "allasok", label: "Álláshirdetések", href: "/allasok", tint: "bg-primary/10 text-primary", icon: { name: "briefcase" } },
        // A Keresek az Álláshirdetések ALATT (user-kérés 2026-07-13).
        { key: "keresek", label: "Keresek — igény-hirdetés", href: "/keresek", tint: "bg-primary/10 text-primary", icon: { name: "search" } },
        { key: "mv-profil", label: "Munkavállalói profil", href: "/allasok/profil", tint: "bg-accent/10 text-accent", icon: { name: "user" } },
        { key: "munkaltato", label: "Munkáltatói irányítópult", href: "/munkaltato", tint: "bg-accent/10 text-accent", icon: { name: "user" }, badge: "job" },
      ],
    },
    {
      id: "penzugy",
      title: "Pénzügyek & Kalkulátorok",
      defaultOpen: true,
      items: [
        // Összevonások (2026-07-16): árfolyam → az Utalás oldalán él;
        // „Mennyi marad?" → a Bérkalkulátorba olvadt. Egy-egy menüpont maradt.
        { key: "utalas", label: "Utalás / Árfolyam", href: "/utalas", tint: "bg-primary/10", icon: { name: "exchange" } },
        ...(has("berkalkulator")
          ? [{ key: "ber", label: "Bérkalkulátor — mennyi marad?", href: "/berkalkulator", tint: "bg-success/10", icon: { name: "wallet" } } as MenuItem]
          : []),
        ...(has("iranytu")
          ? [{ key: "iranytu", label: "Iránytű — bérek és lakbérek", href: "/iranytu", tint: "bg-success/10", icon: { name: "trending" } } as MenuItem]
          : []),
        // Piactér-összevonás (2026-07-16): a lakbér-kalkulátor a Piactér füle.
        { key: "piacter", label: "Piactér — albérlet-börze", href: "/piacter", tint: "bg-primary/10", icon: { name: "house" } },
        ...(has("szolgaltato-valto")
          ? [{ key: "valto", label: "Szolgáltató-váltó", href: "/szolgaltato-valto", tint: "bg-success/10", icon: { name: "refresh" } } as MenuItem]
          : []),
      ],
    },
    {
      id: "tudas",
      title: "Tudás & Ügyintézés",
      defaultOpen: true,
      items: [
        // Tudásbázis-konszolidáció (2026-07-16, user-döntés): a téma-oldalak
        // (kiköltözés, vízum, vám, állampolgárság, hivatalos linkek, bírság,
        // iskolarendszer) a /tudasbazis alá költöztek — a menüben EGY belépő
        // van, a Tudásbázis-oldal eszköz-szekciója sorolja fel őket.
        { key: "tudasbazis", label: "Tudásbázis — minden útmutató és eszköz", href: "/tudasbazis", tint: "bg-primary/10 text-primary", icon: { name: "bookmark" } },
        ...(has("ugyintezes")
          ? [{ key: "ugyintezes", label: "Ügyintézés-varázsló", href: "/ugyintezes", tint: "bg-primary/10", icon: { name: "document" } } as MenuItem]
          : []),
        { key: "hatarido", label: "Határidő-asszisztens", href: "/hatarido", tint: "bg-accent/10", icon: { name: "clock" }, badge: "pro" },
      ],
    },
    {
      id: "kozosseg",
      title: "Közösség & Profilom",
      defaultOpen: true,
      items: [
        { key: "kedvencek", label: "Kedvenceim", href: "/szaknevsor?fav=1", tint: "bg-accent/10 text-accent", icon: { name: "heart", filled: true } },
        { key: "sajat", label: "Saját posztjaim", href: "/sajatjaim", tint: "bg-primary/10 text-primary", icon: { name: "bookmark" } },
        { key: "ranglista", label: "Közösségi ranglista", href: "/ranglista", tint: "bg-star/15", icon: { name: "trophy" } },
        { key: "hol-elnek", label: "Merre él a legtöbb magyar?", href: "/hol-elnek-a-magyarok", tint: "bg-primary/10 text-primary", icon: { name: "pin" } },
        { key: "tortenetek", label: "Élettörténetek", href: "/tortenetek", tint: "bg-accent/10", icon: { name: "edit" } },
        { key: "pass", label: "Kinti Pass — kedvezménykártya", href: "/profil/kinti-pass", tint: "bg-star/15", icon: { name: "ticket" } },
      ],
    },
    {
      id: "ai",
      title: "Felkészülés & AI",
      defaultOpen: true,
      items: [
        { key: "cv", label: "Német önéletrajz-készítő", href: "/nemet-oneletrajz", tint: "bg-success/10 text-success", icon: { name: "document" } },
        { key: "cvaudit", label: "AI CV-asszisztens", href: "/allasok/cv-audit", tint: "bg-success/10 text-success", icon: { name: "sparkles" }, badge: "pro" },
        ...(has("szakmai-szotar")
          ? [{ key: "szotar", label: "Szakmai szótár", href: "/allasok/szakmai-szotar", tint: "bg-star/10 text-star", icon: { name: "document" }, badge: "pro" } as MenuItem]
          : []),
      ],
    },
    {
      id: "utazas",
      title: "Utazás & Autó",
      defaultOpen: true,
      items: [
        ...(has("kozlekedes") ? [{ key: "kozlekedes", label: "Tömegközlekedés", href: "/kozlekedes", tint: "bg-primary/10", icon: { name: "train" } } as MenuItem] : []),
        ...(has("repulojegy") ? [{ key: "repjegy", label: "Repülőjegy-figyelő", href: "/repulojegy", tint: "bg-primary/10", icon: { name: "plane" } } as MenuItem] : []),
        ...(has("vam") ? [{ key: "vam", label: "Vám-kalkulátor", href: "/tudasbazis/vam", tint: "bg-primary/10", icon: { name: "document" } } as MenuItem] : []),
        ...(has("bussen") ? [{ key: "bussen", label: "Gyorshajtás-kalkulátor", href: "/tudasbazis/bussen", tint: "bg-accent/10", icon: { name: "alert" } } as MenuItem] : []),
      ],
    },
    {
      id: "jatek",
      title: "Nyelv & Játék",
      defaultOpen: true,
      items: [
        ...(has("nyelvlecke")
          ? [{
              key: "nyelv",
              label: isCH ? "Nyelvlecke — svájci német" : country === "DE" ? "Nyelvlecke — német" : country === "NL" ? "Nyelvlecke — holland" : "Nyelvlecke — osztrák német",
              href: "/nyelvlecke", tint: "bg-primary/10", icon: { name: "book" },
            } as MenuItem]
          : []),
        ...(has("kviz") ? [{ key: "kviz", label: "Napi kvíz", href: "/kviz", tint: "bg-accent/10", icon: { name: "target" } } as MenuItem] : []),
      ],
    },
    {
      id: "beallitasok",
      title: "Beállítások",
      defaultOpen: true,
      items: [
        {
          key: "tema",
          label: "Megjelenés — világos/sötét téma",
          tint: "bg-primary/10",
          icon: { name: "sun" },
          custom: (
            <div key="tema" className="flex items-center justify-between gap-2 px-4 py-3.5">
              <span className="flex min-w-0 items-center gap-3 text-[15px] font-bold text-ink">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="sun" size={16} strokeWidth={2.2} />
                </span>
                <span className="truncate">Megjelenés</span>
              </span>
              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>
          ),
        },
        { key: "hirlevel", label: "Hírlevél", href: "/hirlevel", tint: "bg-primary/10 text-primary", icon: { name: "send" } },
        { key: "ertesitesek", label: "Értesítések", href: "/ertesitesek", tint: "bg-primary/10 text-primary", icon: { name: "bell" } },
        { key: "helymeghatarozas", label: "Helymeghatározás", href: "/helymeghatarozas", tint: "bg-primary/10 text-primary", icon: { name: "pin" } },
      ],
    },
    {
      id: "kovess",
      title: "Kövess minket",
      defaultOpen: true,
      items: [
        { key: "fb", label: "Facebook", href: "https://www.facebook.com/profile.php?id=61591833836890", external: true, tint: "bg-[#1877F2]/10 text-[#1877F2]", icon: { name: "facebook" } },
        { key: "li", label: "LinkedIn", href: "https://www.linkedin.com/company/kintiapp", external: true, tint: "bg-[#0A66C2]/10 text-[#0A66C2]", icon: { name: "linkedin" } },
        { key: "yt", label: "YouTube", href: "https://www.youtube.com/@kintiapp", external: true, tint: "bg-[#FF0000]/10 text-[#FF0000]", icon: { name: "youtube" } },
        { key: "tt", label: "TikTok", href: "https://www.tiktok.com/@kintiapp", external: true, tint: "bg-[#FE2C55]/10 text-[#FE2C55]", icon: { name: "tiktok" } },
      ],
    },
    {
      id: "jogi",
      title: "Jogi & Segítség",
      defaultOpen: true,
      items: [
        { key: "segitseg", label: "Segítség és GYIK", href: "/segitseg", tint: "bg-success/10 text-success", icon: { name: "question" } },
        { key: "impresszum", label: "Impresszum", href: "/impresszum", tint: "bg-ink-muted/10 text-ink-muted", icon: { name: "flag" } },
        { key: "adatvedelem", label: "Adatvédelem", href: "/adatvedelem", tint: "bg-ink-muted/10 text-ink-muted", icon: { name: "bookmark" } },
        { key: "aszf", label: "ÁSZF", href: "/aszf", tint: "bg-ink-muted/10 text-ink-muted", icon: { name: "list" } },
        { key: "abuse", label: "Visszaélés-bejelentés", href: "mailto:abuse@kinti.app", external: true, tint: "bg-accent/10 text-accent", icon: { name: "bell" } },
      ],
    },
  ];

  // ── „Gyakran használt" sor-lista: a mért top-hrefekhez tartozó menüpontok
  // (a szekciókból visszakeresve, hogy címke/ikon/badge egyezzen). Csak akkor
  // jelenik meg, ha már legalább 3 valódi szokás kirajzolódott — addig a menü
  // változatlan, semmi nem ugrál.
  const itemByHref = new Map<string, MenuItem>();
  for (const s of sections) {
    for (const it of s.items) {
      if (it.href && !it.external && !itemByHref.has(it.href)) itemByHref.set(it.href, it);
    }
  }
  const frequentItems = topUsed
    .map((h) => itemByHref.get(h))
    .filter((x): x is MenuItem => !!x)
    .slice(0, 5);

  // ── Szűrés ────────────────────────────────────────────────────────────────
  const q = fold(query.trim());
  const filtering = q.length > 0;
  const visibleSections = filtering
    ? sections
        .map((s) => ({ ...s, items: s.items.filter((it) => fold(it.label).includes(q)) }))
        .filter((s) => s.items.length > 0)
    : sections;

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
            <div className="shrink-0 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-ink tracking-tight">Menü</h2>
                <button
                  onClick={close}
                  aria-label="Menü bezárása"
                  className="grid h-10 w-10 place-items-center rounded-full bg-surface-alt text-ink transition-transform hover:rotate-90 hover:bg-line active:scale-90"
                >
                  <Icon name="close" size={16} strokeWidth={2.4} />
                </button>
              </div>
              {/* Menü-szűrő: 35+ elemnél a gépelés a leggyorsabb út. */}
              <div className="relative mt-3">
                <Icon name="search" size={15} strokeWidth={2.4} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="search"
                  enterKeyHint="search"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Keresés a menüben…"
                  aria-label="Keresés a menüben"
                  className="h-11 w-full rounded-[14px] border border-line bg-surface-alt pl-10 pr-9 text-[14px] font-semibold text-ink placeholder:font-normal placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Szűrő törlése"
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-line/60 text-ink-muted active:scale-90"
                  >
                    <Icon name="close" size={12} strokeWidth={2.6} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1 custom-scrollbar">
              {!filtering && (
                <>
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
                </>
              )}

              {/* ── Gyakran használt (adaptív) — a top 5 egy érintésre. ──── */}
              {!filtering && frequentItems.length >= 3 && (
                <div className="pt-1.5">
                  <div className="px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-ink-faint">
                    Gyakran használt
                  </div>
                  <div className="space-y-1">
                    {frequentItems.map((it) => (
                      <MenuRow key={`freq-${it.key}`} item={it} onNavigate={close} />
                    ))}
                  </div>
                </div>
              )}

              {visibleSections.length === 0 ? (
                <p className="px-4 py-10 text-center text-[13px] text-ink-muted">
                  Nincs találat a menüben erre: „{query.trim()}".
                </p>
              ) : (
                visibleSections.map((s) => (
                  <CollapsibleSection key={s.id} id={s.id} title={s.title} defaultOpen={s.defaultOpen} forceOpen={filtering}>
                    {s.items.map((it) => (
                      <MenuRow key={it.key} item={it} onNavigate={close} />
                    ))}
                  </CollapsibleSection>
                ))
              )}

              {/* Belépés / Kijelentkezés — amíg a Clerk töltődik, egyiket sem
                  mutatjuk (ne villanjon téves gomb). */}
              {!filtering && isLoaded && (isSignedIn ? (
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

const linkClass =
  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-bold text-ink hover:bg-surface-alt transition-all active:scale-[0.98]";

/** Egy menüsor — Link / külső <a> / egyedi node, közös ikon-doboz + badge. */
function MenuRow({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  if (item.custom) return <>{item.custom}</>;
  // Belső navigációnál a használat-számláló is tanul (→ „Gyakran használt").
  const handleNavigate = () => {
    if (item.href && !item.external) recordUse(item.href);
    onNavigate();
  };
  const inner = (
    <>
      <span className={cn("grid h-8 w-8 place-items-center rounded-xl text-base", item.tint)}>
        {"emoji" in item.icon ? (
          item.icon.emoji
        ) : (
          <Icon name={item.icon.name} size={16} strokeWidth={2.4} filled={item.icon.filled} />
        )}
      </span>
      {item.label}
      {item.badge && (
        <span className={cn("ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-black tracking-wide", BADGE_META[item.badge].cls)}>
          {BADGE_META[item.badge].label}
        </span>
      )}
    </>
  );
  if (item.external) {
    return (
      <a href={item.href} target={item.href?.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" onClick={onNavigate} className={linkClass}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href ?? "/"} onClick={handleNavigate} className={linkClass}>
      {inner}
    </Link>
  );
}

/**
 * Összecsukható menü-szekció — a nyit/zár állapotot MEGJEGYZI (localStorage),
 * így a menü a felhasználó saját használatához idomul. Szűréskor kényszer-nyitva.
 */
function CollapsibleSection({
  id,
  title,
  defaultOpen,
  forceOpen,
  children,
}: {
  id: string;
  title: string;
  defaultOpen: boolean;
  forceOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const v = typeof window !== "undefined" ? localStorage.getItem(`kinti.menu.sec2.${id}`) : null;
      return v === "1" ? true : v === "0" ? false : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });
  const effectiveOpen = forceOpen || open;
  const toggle = () => {
    haptic("selection");
    setOpen((o) => {
      const next = !o;
      try {
        localStorage.setItem(`kinti.menu.sec2.${id}`, next ? "1" : "0");
      } catch { /* privát mód — csak a munkamenetre él */ }
      return next;
    });
  };
  return (
    <div className="pt-1.5">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={effectiveOpen}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-alt"
      >
        <span className="flex-1 text-[11px] font-black uppercase tracking-widest text-ink-faint">
          {title}
        </span>
        <Icon
          name="chevR"
          size={15}
          strokeWidth={2.6}
          className={cn("text-ink-faint transition-transform", effectiveOpen && "rotate-90")}
        />
      </button>
      {effectiveOpen && <div className="space-y-1">{children}</div>}
    </div>
  );
}
