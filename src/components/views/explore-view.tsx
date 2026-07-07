"use client";

import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BusinessCard, CategoryPills, Icon } from "@/components/ui";
import { FAVORITES_CHANGED_EVENT } from "@/components/ui/favorite-button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { Business, Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { CANTONS, cantonFromAddress, matchesCanton, nearestCantonCode, cantonPoint } from "@/lib/cantons";
import { atPoint } from "@/lib/at-points";
import { dePoint } from "@/lib/de-points";
import { readPreferredCanton, setPreferredCanton } from "@/lib/canton-pref";
import { usePreferredCountry } from "@/lib/country-pref";
import { getRegions, regionLabel } from "@/lib/regions";
import { getCountry, DEFAULT_COUNTRY } from "@/lib/countries";
import { calculateBusinessHoursStatus, parseWorkingHoursStrict } from "@/lib/hours";
import { haversineKm } from "@/lib/distance";
import { hasStreetAddress } from "@/lib/address";
import { SmartSearchBar } from "./smart-search-bar";
import { PushOptin } from "@/components/push-optin";

const RADIUS_OPTIONS_KM = [5, 10, 20, 50] as const;
type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];
const RADIUS_LS_KEY = "kinti_radius_km";

// Ország-tudatos térkép-közép (ha nincs találat / „Egész ország" van kiválasztva).
// Eddig fix Zürich volt → DE/AT/NL-en is Svájcot mutatott. Lásd deals-map.
const COUNTRY_MAP_CENTER: Record<string, [number, number]> = {
  CH: [46.82, 8.23],
  AT: [47.59, 14.14],
  DE: [51.1, 10.4],
  NL: [52.13, 5.29],
};
const COUNTRY_MAP_ZOOM: Record<string, number> = { CH: 7, AT: 7, DE: 6, NL: 7 };

/**
 * ExploreView (Szaknévsor) — szerverről kapja a teljes adatkészletet, és
 * kliens-oldalon szűr kategóriára + szabad szövegre. Két nézet közt válthatunk:
 *
 *   • „Lista”   →  BusinessCard kártyák (kompakt, görgethető lista)
 *   • „Térkép”  →  Leaflet-térkép (OpenStreetMap csempék, divIcon markerek)
 *
 * A térkép nehéz (Leaflet + lokál CSS + `window`), ezért lazy-loadolva, kizárólag
 * a böngészőben („ssr: false”): csak akkor kerül a bundle-be, ha a felhasználó
 * tényleg átvált rá. A statikus lista így villámgyorsan megjelenik.
 */
const BusinessMap =
  typeof window !== "undefined"
    ? lazy(() => import("./business-map").then((m) => ({ default: m.BusinessMap })))
    : () => null;

type ViewMode = "list" | "map";

type SortMode = "relevant" | "rating" | "distance" | "newest";
const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "relevant", label: "Ajánlott" },
  { id: "rating", label: "⭐ Értékelés" },
  { id: "distance", label: "📍 Közelség" },
  { id: "newest", label: "🆕 Legújabb" },
];
/** SQLite ("YYYY-MM-DD HH:MM:SS") vagy ISO dátum → ms. Hiányzó/hibás → 0. */
function tsOf(s?: string | null): number {
  if (!s) return 0;
  const t = Date.parse(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return Number.isNaN(t) ? 0 : t;
}

export function ExploreView({
  categories,
  businesses,
}: {
  categories: Category[];
  businesses: Business[];
}) {
  // ?q és ?canton URL-paraméterek (a főoldalról / keresőből érkezve) → kezdő szűrők
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") ?? "";
  const initialCanton = searchParams?.get("canton") ?? "all";
  const initialFav = searchParams?.get("fav") === "1";
  const initialCat = searchParams?.get("cat") ?? "all";
  const initialPass = searchParams?.get("pass") === "1";

  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState(initialQ);
  const [canton, setCanton] = useState(initialCanton);
  const [showFavs, setShowFavs] = useState(initialFav);
  const [openNow, setOpenNow] = useState(false);
  const [passOnly, setPassOnly] = useState(initialPass);
  const [minYears, setMinYears] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  // Alapból LISTA (gyors pásztázás + SEO + nincs hydration-mismatch: az SSR és az
  // első kliens-render is "list"). A user térkép/lista választását megjegyezzük:
  // mount után visszaállítjuk a mentett preferenciát, váltáskor elmentjük.
  const [view, setView] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortMode>("relevant");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kinti_szaknevsor_view");
      if (saved === "map" || saved === "list") setView(saved);
    } catch { /* ignore */ }
  }, []);
  const setViewPersist = (v: ViewMode) => {
    setView(v);
    try { localStorage.setItem("kinti_szaknevsor_view", v); } catch { /* ignore */ }
  };
  const [cantonSheetOpen, setCantonSheetOpen] = useState(false);

  // Választott ország (6-ország rendszer). A régiók/szűrés/feliratok ehhez igazodnak.
  // CH a default; a régiók a lib/regions.ts-ből (CH: kantonok, AT: Bundeslandok, …).
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryName = getCountry(country)?.name ?? "Svájc";
  const regions = useMemo(() => getRegions(country), [country]);

  // Ország-/régió-tudatos térkép-közép a fallbackhez (találat nélkül se essen Svájcra).
  const mapCenter = useMemo<[number, number]>(() => {
    if (canton !== "all") {
      if (country === "DE") { const p = dePoint(canton); return [p.lat, p.lng]; }
      if (country === "AT") { const p = atPoint(canton); return [p.lat, p.lng]; }
      // cantonPoint CH-specifikus; NL provincia-kódok (ZH/FR/GR/GE) ütköznek a svájci
      // kantonokkal → csak CH-ra hívjuk, különben a nemzeti középre esünk vissza.
      if (country === "CH") { const p = cantonPoint(canton); if (p) return [p.lat, p.lng]; }
    }
    return COUNTRY_MAP_CENTER[country] ?? COUNTRY_MAP_CENTER.CH;
  }, [country, canton]);
  const mapZoom = canton !== "all" ? 10 : (COUNTRY_MAP_ZOOM[country] ?? 7);
  // Ország-váltáskor a más országbeli régió-választás érvénytelen → vissza "all"-ra.
  useEffect(() => {
    if (canton !== "all" && !regions.some((r) => r.code === canton)) setCanton("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  // Ha nem URL-ből érkezett kanton, a felhasználó preferált kantonjára szűrünk
  // alapból (kanton-személyre szabás). A hidratálás után, hogy ne legyen mismatch.
  useEffect(() => {
    if (!searchParams?.get("canton")) {
      const pref = readPreferredCanton();
      if (pref) setCanton(pref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Radius-search állapot (lat/lng = user böngészőjének poz.; ha null → kikapcsolva)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(20);
  const [geoState, setGeoState] = useState<"idle" | "loading" | "denied" | "error">("idle");

  // Kedvenc ID-k + radius-preferencia betöltése localStorage-ből
  useEffect(() => {
    const readFavs = () => {
      try {
        const favs = JSON.parse(localStorage.getItem("kinti_favorites") || "[]");
        setFavoriteIds(Array.isArray(favs) ? favs.map(String) : []);
      } catch {
        // ignore
      }
    };
    readFavs();
    // A kártyák szív-toggle-je ezt szórja → a szűrő (Mentett kedvencek) szinkronban marad.
    window.addEventListener(FAVORITES_CHANGED_EVENT, readFavs);
    try {
      const saved = Number(localStorage.getItem(RADIUS_LS_KEY));
      if (RADIUS_OPTIONS_KM.includes(saved as RadiusKm)) {
        setRadiusKm(saved as RadiusKm);
      }
    } catch {
      // ignore
    }
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, readFavs);
  }, []);

  function requestGeolocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("error");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoState("idle");
      },
      (err) => {
        setGeoState(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }

  function clearGeolocation() {
    setUserPos(null);
    setGeoState("idle");
  }

  function handleRadiusChange(km: RadiusKm) {
    setRadiusKm(km);
    try {
      localStorage.setItem(RADIUS_LS_KEY, String(km));
    } catch {
      // ignore
    }
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const withDistance = businesses
      .filter((b) => {
        // Ország-szűrés (6-ország): a választott ország tartalma. Régi sorok: 'CH'.
        const byCountry = (b.country ?? "CH") === country;
        const byCat = cat === "all" || b.categoryId === cat;
        const byCanton =
          canton === "all" ||
          // A TÁROLT régió-kód (AT/DE/… seed, ill. új CH-felvitel) mindenhol számít.
          b.canton === canton ||
          // CH-nál a régi származtatás is (cím / koordináta → kanton) a kompatibilitásért.
          (country === "CH" &&
            (cantonFromAddress(b.address ?? null)?.code === canton ||
              (b.lat != null && b.lng != null && nearestCantonCode(b.lat, b.lng).code === canton)));
        const byFav = !showFavs || favoriteIds.includes(b.id);
        // „Most nyitva" = TÉNYLEGESEN ismert-nyitva. Ismeretlen nyitvatartásnál
        // nem találunk ki „nyitva"-t (a kártya sem mutat státuszt ilyenkor) —
        // őszinte szűrő, összhangban a kártya megjelenítésével.
        const wh = parseWorkingHoursStrict(b.workingHours ?? null);
        const byOpen = !openNow || (wh != null && calculateBusinessHoursStatus(wh).isOpen);
        const byYears = minYears === 0 || (b.yearsHere ?? 0) >= minYears;
        // Kinti Pass elfogadóhely-szűrő (a kedvezménykártyát elfogadó helyek).
        const byPass = !passOnly || b.kintiPassActive === true;
        const byText =
          !needle ||
          b.name.toLowerCase().includes(needle) ||
          (b.categoryLabel ?? "").toLowerCase().includes(needle) ||
          // Specialitás-keresés a bemutatkozó szövegben is.
          (b.blurb ?? "").toLowerCase().includes(needle) ||
          (b.address ?? "").toLowerCase().includes(needle) ||
          // Svájci kanton-keresés szövegből is: pl. "Aargau", "ZH", "Tessin", …
          matchesCanton({ address: b.address ?? null }, needle);
        return byCountry && byCat && byCanton && byFav && byOpen && byYears && byPass && byText;
      })
      .map((b) => {
        // Házszám nélküli cím (pl. csak "Wien") esetén a lat/lng városközpont —
        // a táv/sugár-szűrés/rendezés ettől félrevezető lenne, marad koordináta nélkülinek.
        const dist =
          userPos && b.lat != null && b.lng != null && hasStreetAddress(b.address)
            ? haversineKm(userPos.lat, userPos.lng, b.lat, b.lng)
            : null;
        return { b, dist };
      });

    // Radius-szűrés: a koordináta nélküli rekordok ilyenkor kiesnek.
    const radiusFiltered = userPos
      ? withDistance.filter(({ dist }) => dist != null && dist <= radiusKm)
      : withDistance;

    // Rendezés: a PRO (featured) vállalkozások MINDIG elöl ("top pinning"),
    // azon belül a felhasználó által választott szempont szerint.
    radiusFiltered.sort((a, b) => {
      if (a.b.featured !== b.b.featured) return a.b.featured ? -1 : 1;
      switch (sortBy) {
        case "rating": {
          const r = (b.b.rating ?? 0) - (a.b.rating ?? 0);
          return r !== 0 ? r : (b.b.reviews ?? 0) - (a.b.reviews ?? 0);
        }
        case "distance":
          return (a.dist ?? Infinity) - (b.dist ?? Infinity);
        case "newest":
          return tsOf(b.b.createdAt) - tsOf(a.b.createdAt);
        case "relevant":
        default: {
          // Igazi KOMBINÁLT pontszám: közelség ÉS értékelés EGYÜTT súlyozva (nem
          // csak holtverseny-bontás) — így egy kicsit távolabbi, de sokkal jobban
          // értékelt cég megelőzhet egy közeli gyengét. proximity: a sugáron belül
          // közelebb = jobb; rating: értékelt cégnél a csillag, újnál semleges 0.6.
          const score = (it: typeof a) => {
            const prox = it.dist != null ? Math.max(0, 1 - it.dist / Math.max(radiusKm, 1)) : 0.4;
            const rate = (it.b.reviews ?? 0) > 0 ? (it.b.rating ?? 0) / 5 : 0.6;
            return 0.6 * prox + 0.4 * rate;
          };
          return score(b) - score(a);
        }
      }
    });

    return radiusFiltered;
  }, [businesses, country, cat, canton, q, showFavs, openNow, minYears, passOnly, favoriteIds, userPos, radiusKm, sortBy]);

  const locatedCount = useMemo(
    () => filtered.filter(({ b }) => b.lat != null && b.lng != null).length,
    [filtered],
  );

  const filteredBusinesses = useMemo(() => filtered.map(({ b }) => b), [filtered]);

  // „0 találat" fallback: ha a régió/sugár-szűrő miatt üres a lista, de van az
  // adott KATEGÓRIÁRA/szövegre illeszkedő találat máshol, mutassuk a legközelebbieket
  // (GPS-szel 50 km-en belül; nélküle a kategória legjobbjait az országban) — ne a
  // semmit. Csak akkor, ha volt valódi keresési szándék (kategória vagy szöveg).
  const nearbyFallback = useMemo(() => {
    if (showFavs) return [] as { b: Business; dist: number | null }[];
    const needle = q.trim().toLowerCase();
    if (cat === "all" && !needle) return [];
    const candidates = businesses.filter((b) => {
      if ((b.country ?? "CH") !== country) return false;
      if (cat !== "all" && b.categoryId !== cat) return false;
      if (needle) {
        const hit =
          b.name.toLowerCase().includes(needle) ||
          (b.categoryLabel ?? "").toLowerCase().includes(needle) ||
          (b.blurb ?? "").toLowerCase().includes(needle) ||
          (b.address ?? "").toLowerCase().includes(needle) ||
          matchesCanton({ address: b.address ?? null }, needle);
        if (!hit) return false;
      }
      return true;
    });
    const withDist = candidates.map((b) => ({
      b,
      dist: userPos && b.lat != null && b.lng != null ? haversineKm(userPos.lat, userPos.lng, b.lat, b.lng) : null,
    }));
    if (userPos) {
      return withDist
        .filter(({ dist }) => dist != null && dist <= 50)
        .sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity))
        .slice(0, 6);
    }
    return withDist
      .sort((a, b) =>
        (Number(b.b.featured) - Number(a.b.featured)) ||
        ((b.b.rating ?? 0) - (a.b.rating ?? 0)) ||
        ((b.b.reviews ?? 0) - (a.b.reviews ?? 0)),
      )
      .slice(0, 6);
  }, [businesses, country, cat, q, userPos, showFavs]);

  // Csak azokat a kategóriákat mutatjuk a pill-sorban, amikben TÉNYLEG van
  // vállalkozás (+ „Mind", + az épp kiválasztott) — így nincs üres, irreleváns
  // kategória, és a sor rövid/letisztult marad.
  const visibleCategories = useMemo(() => {
    const present = new Set(
      businesses.filter((b) => (b.country ?? "CH") === country).map((b) => b.categoryId),
    );
    return categories.filter((c) => c.id === "all" || c.id === cat || present.has(c.id));
  }, [categories, businesses, country, cat]);

  // A térkép hely-pillhez: a kiválasztott régió neve, vagy "Egész <ország>"
  const locationLabel = useMemo(() => {
    if (canton === "all") return `Egész ${countryName}`;
    const found = regions.find((c) => c.code === canton);
    return found ? `${found.name} (${found.code})` : canton;
  }, [canton, regions, countryName]);

  // Kontextuális „kevés a találat" supply-CTA: szűrt nézetben, 1–4 találatnál. Ha
  // ez látszik, a lista-alji általános ajánló-CTA-t elnyomjuk (különben duplikáció).
  const showLowCountCta =
    view === "list" && filtered.length > 0 && filtered.length <= 4 && (cat !== "all" || canton !== "all");

  return (
    <div className="space-y-3">
      {/* EGY kereső: kulcsszavas (élő) + ✨ AI (természetes nyelv → szűrők) */}
      <div className="px-5">
        <SmartSearchBar
          value={q}
          onChange={setQ}
          onApplyCategory={setCat}
          onApplyCanton={setCanton}
          onApplyQuery={setQ}
          placeholder={`Mit keresel? Pl. villanyszerelő ${country === "AT" ? "Bécsben" : country === "DE" ? "Berlinben" : country === "NL" ? "Amszterdamban" : "Zürichben"}`}
        />
      </div>

      {/* Szűrők sor (Kanton + Mentett kedvencek) — egysoros, vízszintesen görgethető
          chip-sor (a wrap 2-3 szabálytalan sorba tördelt). A py/-my a shadow-card
          levágása ellen ad teret az overflow-konténerben. */}
      <div className="no-scrollbar -my-2 flex items-center gap-2 overflow-x-auto px-5 py-2">
        {/* Kanton szűrő — natív alsó lap (BottomSheet) */}
        <button
          type="button"
          onClick={() => setCantonSheetOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border border-line bg-surface px-3 py-2 shadow-card transition hover:bg-surface-alt active:scale-[0.97]"
        >
          <Icon name="pin" size={14} strokeWidth={2.2} className="shrink-0 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Kanton</span>
          <span className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">{locationLabel}</span>
          <Icon name="chevD" size={13} strokeWidth={2.2} className="text-ink-muted shrink-0" />
        </button>
        <BottomSheet open={cantonSheetOpen} onClose={() => setCantonSheetOpen(false)} title={`Válassz ${regionLabel(country)}t`}>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[{ code: "all", name: `Egész ${countryName}` }, ...regions].map((c) => {
              const active = canton === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCanton(c.code);
                    setPreferredCanton(c.code); // az app tanul a kézi választásból
                    setCantonSheetOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-1 rounded-xl border px-3 py-2.5 text-left text-[13.5px] font-bold transition active:scale-[0.97]",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-line bg-surface text-ink hover:bg-surface-alt",
                  )}
                >
                  <span className="truncate">
                    {c.name}
                    {c.code !== "all" ? ` (${c.code})` : ""}
                  </span>
                  {active && <Icon name="check" size={15} strokeWidth={3} className="shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </BottomSheet>

        {/* Kedvencek szűrő */}
        <button
          type="button"
          onClick={() => setShowFavs(!showFavs)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            showFavs
              ? "bg-accent/10 border-accent/30 text-accent font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt"
          )}
        >
          <Icon
            name="heart"
            size={14}
            strokeWidth={2.2}
            filled={showFavs}
            className={cn("shrink-0", showFavs ? "text-accent" : "text-ink-muted")}
          />
          <span className="text-[11.5px] font-bold tracking-wide select-none">
            Mentett kedvencek
          </span>
        </button>

        {/* Kinti Pass elfogadóhely-szűrő (arany) */}
        <button
          type="button"
          onClick={() => setPassOnly((v) => !v)}
          aria-pressed={passOnly}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            passOnly
              ? "bg-star/15 border-star/50 text-ink font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <span aria-hidden className="text-[13px] leading-none">🎟️</span>
          <span className="text-[11.5px] font-bold tracking-wide select-none">
            Csak Kinti Pass helyek
          </span>
        </button>

        {/* Most nyitva szűrő */}
        <button
          type="button"
          onClick={() => setOpenNow((v) => !v)}
          aria-pressed={openNow}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            openNow
              ? "bg-success/10 border-success/30 text-success font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              openNow ? "bg-success animate-pulse" : "bg-ink-faint",
            )}
          />
          <span className="text-[11.5px] font-bold tracking-wide select-none">
            Most nyitva
          </span>
        </button>

        {/* Tapasztalat (év) szűrő — Advanced search */}
        <select
          value={minYears}
          onChange={(e) => setMinYears(Number(e.target.value))}
          aria-label="Szűrés tapasztalatra"
          className={cn(
            "inline-flex shrink-0 items-center rounded-pill border px-3 py-2 text-[11.5px] font-bold tracking-wide shadow-card transition cursor-pointer outline-none",
            minYears > 0
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <option value={0}>Tapasztalat</option>
          <option value={3}>3+ év</option>
          <option value={5}>5+ év</option>
          <option value={10}>10+ év</option>
        </select>

        {/* Közelemben / radius-szűrő */}
        <button
          type="button"
          onClick={userPos ? clearGeolocation : requestGeolocation}
          aria-pressed={userPos != null}
          disabled={geoState === "loading"}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            userPos
              ? "bg-primary/10 border-primary/30 text-primary font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
            geoState === "loading" && "opacity-60 cursor-wait",
          )}
        >
          <Icon
            name="pin"
            size={12}
            strokeWidth={2.4}
            className={cn("shrink-0", userPos ? "text-primary" : "text-ink-muted")}
          />
          <span className="text-[11.5px] font-bold tracking-wide select-none">
            {geoState === "loading"
              ? "Helymeghatározás…"
              : userPos
                ? `${radiusKm} km-en belül · ✕`
                : "Közelemben"}
          </span>
        </button>

        {/* Radius választó — csak ha aktív a helymeghatározás */}
        {userPos && (
          <label className="relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border border-primary/30 bg-primary/5 px-3 py-2 shadow-card cursor-pointer transition hover:bg-primary/10">
            <span className="text-[11px] font-bold uppercase tracking-wide text-primary/70 select-none">
              Sugár
            </span>
            <span className="text-[13px] font-bold tracking-[-0.01em] text-primary pr-1">
              {radiusKm} km
            </span>
            <Icon name="chevD" size={13} strokeWidth={2.2} className="text-primary/70 shrink-0" />
            <select
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value) as RadiusKm)}
              aria-label="Keresési sugár"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {RADIUS_OPTIONS_KM.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Kinti Pass szűrő aktív → emlékeztető a saját digitális kártyára */}
      {passOnly && (
        <div className="px-5">
          <Link
            href="/profil/kinti-pass"
            className="flex items-center gap-3 rounded-card border border-star/40 bg-star/10 px-4 py-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-star/20 text-[18px]">
              🎟️
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
                Ezeken a helyeken kedvezményt kapsz
              </span>
              <span className="block text-[11.5px] text-ink-muted">
                Mutasd fel a Kinti Pass digitális kártyád fizetéskor — itt nyitod meg.
              </span>
            </span>
            <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-muted" />
          </Link>
        </div>
      )}

      {/* Geo-hiba visszajelzés */}
      {(geoState === "denied" || geoState === "error") && (
        <div className="mx-5 rounded-card border border-accent/30 bg-accent/5 px-4 py-2 text-[12px] text-accent">
          {geoState === "denied"
            ? "Helymeghatározás letiltva. Engedélyezd a böngésződ beállításaiban, hogy a közeli vállalkozásokat lásd."
            : "Nem sikerült lekérni a helyzeted. Próbáld újra később."}
        </div>
      )}

      {/* Self-service CTA-k + push — csak lista-nézetben; map-módban a térkép a hős. */}
      {view === "list" && (
      <div className="px-5">
        <Link
          href="/vallalkozo"
          className="flex items-center gap-3 rounded-card border border-primary/25 bg-primary-soft px-4 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
            <Icon name="plus" size={17} strokeWidth={2.6} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Magyar vállalkozásod van? Add hozzá ingyen!
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Gyors regisztráció, és 1 perc alatt fent vagy.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary" />
        </Link>

        {/* Lead gen CTA — árajánlat-kérés */}
        <Link
          href="/szaknevsor/ajanlatkeres"
          className="flex items-center gap-3 rounded-card border border-accent/25 bg-accent/5 px-4 py-3 shadow-card transition active:scale-[0.99] mt-2"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-accent text-white">
            <Icon name="send" size={17} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Kérj árajánlatot egyszerre mindenkitől!
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              Egy űrlap — több vállalkozó válaszol neked.
            </span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-accent" />
        </Link>

        {/* Push-feliratkozás: új vállalkozás/állás/esemény a kantonodban */}
        <div className="mt-2">
          <PushOptin />
        </div>
      </div>
      )}

      {/* A kategória-pillek list-módban itt fent; map-módban a térképre úsztatva. */}
      {view === "list" && (
        <CategoryPills categories={visibleCategories} active={cat} onSelect={setCat} />
      )}

      {/* Lista / Térkép váltó + meta-sor */}
      <div className="flex items-center justify-between gap-3 px-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
          {filtered.length} találat
          {view === "map" && locatedCount < filtered.length && (
            <span className="ml-1 normal-case tracking-normal text-ink-faint">
              ({locatedCount} térképen)
            </span>
          )}
        </p>
        <ViewSwitch value={view} onChange={setViewPersist} />
      </div>

      {/* Rendezés (csak lista-nézetben, ha van mit rendezni) */}
      {view === "list" && filtered.length > 1 && (
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-5">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Rendezés</span>
          {SORT_OPTIONS.map((o) => {
            if (o.id === "distance" && !userPos) return null;
            const on = sortBy === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setSortBy(o.id)}
                aria-pressed={on}
                className={cn(
                  "inline-flex flex-none items-center rounded-pill px-3 py-1.5 text-[12px] font-bold tracking-[-0.01em] transition",
                  on
                    ? "bg-primary text-white shadow-card"
                    : "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-alpha))]",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Kontextuális supply-CTA: ha egy szűrt kategóriában/kantonban kevés a
          találat, ott a legnagyobb a hiányérzet → magas szándékú ajánlás-pont. */}
      {showLowCountCta && (
          <div className="px-5">
            <Link
              href="/szaknevsor/ajanlas"
              className="flex items-center gap-3 rounded-card border border-primary/30 bg-primary-soft px-4 py-3 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
                <Icon name="plus" size={17} strokeWidth={2.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold tracking-[-0.01em] text-ink">
                  Kevés a találat — ismersz többet?
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  Ajánlj egy magyar vállalkozást 30 mp alatt — mi ellenőrizzük és felvesszük.
                </span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary" />
            </Link>
          </div>
        )}

      {view === "list" ? (
        <div className="grid gap-2.5 px-5">
          {filtered.map(({ b, dist }) => (
            <BusinessCard
              key={b.id}
              business={b}
              href={`/szaknevsor/${b.id}${q.trim() ? `?st=${encodeURIComponent(q.trim())}` : ""}`}
              distanceKm={dist}
              showFavorite
            />
          ))}

          {/* „0 találat" fallback: a legközelebbi/hasonló találatok a semmi helyett */}
          {filtered.length === 0 && nearbyFallback.length > 0 && (
            (() => {
              const cantonLabel = canton !== "all" ? regions.find((c) => c.code === canton)?.name ?? null : null;
              const subject = cat !== "all" ? (categories.find((c) => c.id === cat)?.label ?? null) : (q.trim() || null);
              return (
                <>
                  <div className="rounded-card border border-star/30 bg-star/5 px-4 py-3 text-[12.5px] leading-snug text-ink-muted">
                    Nincs pontos találat{cantonLabel ? <> itt: <strong className="text-ink">{cantonLabel}</strong></> : null}
                    {subject ? <> erre: <strong className="text-ink">„{subject}"</strong></> : null}. {userPos ? "A legközelebbiek (50 km-en belül):" : "Hasonló találatok az országban:"}
                  </div>
                  {nearbyFallback.map(({ b, dist }) => (
                    <BusinessCard
                      key={b.id}
                      business={b}
                      href={`/szaknevsor/${b.id}${q.trim() ? `?st=${encodeURIComponent(q.trim())}` : ""}`}
                      distanceKm={dist}
                      showFavorite
                    />
                  ))}
                  <Link
                    href="/szaknevsor/ajanlas"
                    className="flex items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary"><Icon name="plus" size={16} strokeWidth={2.6} /></span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold text-ink">Ismersz egyet{cantonLabel ? ` ${cantonLabel} környékén` : ""}?</span>
                      <span className="block text-[12px] text-ink-muted">Ajánlj egy magyar vállalkozót — pár kattintás, és felkerül.</span>
                    </span>
                  </Link>
                </>
              );
            })()
          )}

          {filtered.length === 0 && nearbyFallback.length === 0 && (
            (() => {
              const cantonLabel = canton !== "all" ? regions.find((c) => c.code === canton)?.name ?? null : null;
              const subject = !showFavs ? (cat !== "all" ? (categories.find((c) => c.id === cat)?.label ?? null) : (q.trim() || null)) : null;
              return (
            <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface px-6 py-10 text-center shadow-card">
              <Icon name={showFavs ? "heart" : "pin"} size={28} className="text-ink-faint" />
              <p className="text-[15px] font-extrabold text-ink">
                {showFavs
                  ? "Nincs mentett kedvenced"
                  : subject
                    ? `Nem találtunk: „${subject}"${cantonLabel ? ` — ${cantonLabel}` : ""}`
                    : cantonLabel
                      ? `Még nincs magyar vállalkozás itt: ${cantonLabel}`
                      : "Még nincs itt magyar vállalkozás"}
              </p>
              <p className="max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
                {showFavs
                  ? "Nyomd meg a szívet egy vállalkozás kártyáján, és itt gyűjtöd a kedvenceidet."
                  : userPos
                    ? `Nincs vállalkozás ${radiusKm} km-en belül. Növeld a sugarat vagy kapcsold ki a helymeghatározást.`
                    : cantonLabel
                      ? "Légy te az első! Ha itt dolgozol, kerülj fel a térképre — vagy ajánlj egy magyar vállalkozót, akit ismersz."
                      : "Légy te az első! Vidd fel a vállalkozásod, vagy ajánlj egy magyar vállalkozót, akit ismersz."}
              </p>
              {!showFavs && (
                <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
                  <Link
                    href="/szaknevsor/uj"
                    className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card-hover active:scale-[0.98]"
                  >
                    <Icon name="pin" size={14} strokeWidth={2.6} /> Vidd fel a vállalkozásod
                  </Link>
                  <Link
                    href="/szaknevsor/ajanlas"
                    className="inline-flex items-center justify-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink active:scale-95"
                  >
                    <Icon name="plus" size={13} strokeWidth={2.6} /> Inkább ajánlok egyet
                  </Link>
                </div>
              )}
            </div>
              );
            })()
          )}

          {/* Hiányzik valaki? — közösségi ajánlás a lista alján. A kontextuális
              „kevés a találat" CTA-val kölcsönösen kizáró (nincs duplikáció). */}
          {filtered.length > 0 && !showLowCountCta && (
            <Link
              href="/szaknevsor/ajanlas"
              className="flex items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary">
                <Icon name="plus" size={17} strokeWidth={2.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold tracking-[-0.01em] text-ink">
                  Hiányzik egy magyar vállalkozás?
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  Ajánld 30 mp alatt — mi ellenőrizzük és felvesszük.
                </span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary" />
            </Link>
          )}
        </div>
      ) : (
        <div className="px-3">
          <Suspense
            fallback={
              <div className="mb-2 grid h-[calc(100dvh-300px)] min-h-[440px] max-h-[760px] place-items-center rounded-card border border-line bg-surface text-[12.5px] font-semibold text-ink-muted shadow-card">
                Térkép betöltése…
              </div>
            }
          >
            <BusinessMap
              businesses={filteredBusinesses}
              categories={visibleCategories}
              activeCat={cat}
              onSelectCat={setCat}
              locationLabel={locationLabel}
              userPos={userPos}
              fallbackCenter={mapCenter}
              fallbackZoom={mapZoom}
              className="mb-2 h-[calc(100dvh-300px)] min-h-[440px] max-h-[760px]"
            />
          </Suspense>

          {/* „0 térképi találat" fallback: a legközelebbiek lista a térkép alatt */}
          {filtered.length === 0 && nearbyFallback.length > 0 && (
            <div className="space-y-2.5 px-2 pb-2">
              <div className="rounded-card border border-star/30 bg-star/5 px-4 py-3 text-[12.5px] leading-snug text-ink-muted">
                Nincs pontos térképi találat itt — {userPos ? "a legközelebbiek (50 km-en belül):" : "hasonló találatok az országban:"}
              </div>
              {nearbyFallback.map(({ b, dist }) => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  href={`/szaknevsor/${b.id}${q.trim() ? `?st=${encodeURIComponent(q.trim())}` : ""}`}
                  distanceKm={dist}
                  showFavorite
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- nézet-váltó (Liquid Glass szegmentált gomb) ----------------------------
function ViewSwitch({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Nézet"
      className="glass inline-flex rounded-pill p-0.5 text-[11.5px] font-bold"
    >
      <SwitchBtn active={value === "list"} onClick={() => onChange("list")} label="Lista" icon="list" />
      <SwitchBtn active={value === "map"} onClick={() => onChange("map")} label="Térkép" icon="map" />
    </div>
  );
}

function SwitchBtn({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: "list" | "map";
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 transition",
        active
          ? "bg-primary text-white shadow-card"
          : "text-ink-muted hover:text-ink",
      )}
    >
      <Icon name={icon} size={12} strokeWidth={2.2} />
      {label}
    </button>
  );
}
