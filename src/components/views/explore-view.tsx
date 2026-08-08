"use client";

import { useMemo, useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useKeyboardDismissOnScroll } from "@/lib/use-keyboard-dismiss";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BusinessCard, CategoryPills, Icon, SegmentedControl, SwipeAction, type IconName } from "@/components/ui";
import { FAVORITES_CHANGED_EVENT, removeFavorite } from "@/components/ui/favorite-button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { Category, ListBusiness } from "@/lib/types";
import { cn } from "@/lib/cn";
import { foldSearchText } from "@/lib/sql-fold";
import { matchesSearchQuery, relaxSearchQuery } from "@/lib/search-match";
import { CANTONS, cantonFromAddress, matchesCanton, nearestCantonCode } from "@/lib/cantons";
import { readPreferredCanton, setPreferredCanton, readCantonView, setCantonView } from "@/lib/canton-pref";
import { regionPoint } from "@/lib/region-point";
import { usePreferredCountry } from "@/lib/country-pref";
import { getRegions, regionLabel } from "@/lib/regions";
import { getCountry, DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";
import { calculateBusinessHoursStatus, parseWorkingHoursStrict } from "@/lib/hours";
import { RecentBusinessesStrip } from "@/components/views/recent-businesses";
import { trackAction } from "@/components/usage-tracker";
import { haversineKm } from "@/lib/distance";
import { hasStreetAddress } from "@/lib/address";
import { relevanceScore } from "@/lib/listing-score";
import { SmartSearchBar } from "./smart-search-bar";
import { PushOptin } from "@/components/push-optin";
import { Skeleton } from "@/components/skeleton";

const RADIUS_OPTIONS_KM = [5, 10, 20, 50] as const;
type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];
const RADIUS_LS_KEY = "kinti_radius_km";

/**
 * Példa-város a kereső helyőrzőjébe, a mondatba illő (-ban/-ben) alakban.
 * ⚠️ Kézi lánc helyett tábla: a korábbi változat végén Zürich állt, így az
 * angliai és a spanyolországi felhasználó is „villanyszerelő Zürichben"
 * példát látott a saját városa helyett.
 */
const CITY_IN_EXAMPLE: Record<string, string> = {
  CH: "Zürichben",
  AT: "Bécsben",
  DE: "Berlinben",
  NL: "Amszterdamban",
  GB: "Londonban",
  ES: "Madridban",
};

// Ország-tudatos térkép-közép (ha nincs találat / „Egész ország" van kiválasztva).
// Eddig fix Zürich volt → DE/AT/NL-en is Svájcot mutatott.
const COUNTRY_MAP_CENTER: Record<string, [number, number]> = {
  CH: [46.82, 8.23],
  AT: [47.59, 14.14],
  DE: [51.1, 10.4],
  NL: [52.13, 5.29],
  // ⚠️ GB nélkül a lenti `?? COUNTRY_MAP_CENTER.CH` miatt az angliai user
  // térképe SVÁJCRA állt középre. Anglia közepe (Midlands), nem az egész UK-é.
  GB: [52.6, -1.3],
  // Spanyolország: a szárazföld mértani közepe (Madridtól kissé délnyugatra).
  // ⚠️ A Kanári-szigetek SZÁNDÉKOSAN nem befolyásolják a középpontot: ha úgy
  // állítanánk be a nézetet, hogy azok is látszódjanak, a felhasználók ~95%-át
  // adó szárazföld egy pici folttá zsugorodna a képernyő sarkában. Aki a
  // Kanári-szigeteken él, a régió-szűrővel egy kattintással odaugrik.
  ES: [40.0, -3.7],
};
const COUNTRY_MAP_ZOOM: Record<string, number> = { CH: 7, AT: 7, DE: 6, NL: 7, GB: 6, ES: 6 };

/**
 * Nagy keresletű szakmák, amiket akkor is KIÍRUNK, ha az adott országban nulla
 * a találat — így lesz belőlük ajánlás-kérés a zsákutca helyett.
 * Sorrend = prioritás (ld. [[business-directory-high-frequency-focus]]).
 */
const HIGH_DEMAND_CATEGORY_IDS = [
  "orvos",
  "fogorvos",
  "autoszer",
  "fodrasz",
  "elelmiszer",
  "etterem",
  "ugyved",
  "konyveles",
  "fordito",
  "koltoztetes",
] as const;

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
const SORT_OPTIONS: { id: SortMode; label: string; icon?: IconName }[] = [
  { id: "relevant", label: "Ajánlott" },
  { id: "rating", label: "Értékelés", icon: "star" },
  { id: "distance", label: "Közelség", icon: "pin" },
  { id: "newest", label: "Legújabb", icon: "sparkles" },
];
/** SQLite ("YYYY-MM-DD HH:MM:SS") vagy ISO dátum → ms. Hiányzó/hibás → 0. */
function tsOf(s?: string | null): number {
  if (!s) return 0;
  const t = Date.parse(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return Number.isNaN(t) ? 0 : t;
}

/** Van-e a cégnek elérhetősége: telefon (hasPhone — a lista scrape-védetten csak
 *  a MEGLÉTÉT adja, a számot nem) VAGY weboldal a bemutatkozóban. A „csak-cím"
 *  zsákutca-találatok kiszűréséhez (Elérhetőséggel szűrő). */
function hasContactInfo(b: { hasPhone?: boolean; blurb?: string | null }): boolean {
  if (b.hasPhone) return true;
  return /https?:\/\/|www\.|\.(ch|de|at|nl|com|hu|eu|be|org)\b/i.test(b.blurb ?? "");
}

/** Egyszerre ennyi kártya kerül a DOM-ba — görgetésre (vagy gombbal) bővül.
 *  1000+ kártya egyszerre = több másodperces main-thread blokk mobilon. */
/** Találatok laponként — lapozott lista (user-kérés: „az első százat mutassa
 *  1 oldalon, a második százat a másodikon", ne egy végtelen tekerés legyen). */
const PAGE_SIZE = 100;

export function ExploreView({
  categories,
  businesses: initialBusinesses,
  countryTotals,
}: {
  categories: Category[];
  /** Az SSR-ből érkező ELSŐ KÉPERNYŐNYI szelet (országonként limitált) — a
   *  teljes listát mount után töltjük be a /api/businesses/list-ből. */
  businesses: ListBusiness[];
  /** A VALÓDI országonkénti darabszám a szerverről (a szelet-számlálás
   *  mellékterméke, plusz lekérdezés nélkül) — a számlálót ebből írjuk ki,
   *  amíg a teljes lista tölt. */
  countryTotals?: Record<string, number>;
}) {
  // Lefelé görgetésre elrejti a billentyűzetet (a találatok fölött ül a kereső).
  useKeyboardDismissOnScroll();

  // A teljes lista betöltése — a KRITIKUS ÚTON KÍVÜL. Korábban a mount-effekt
  // AZONNAL lekérte MIND az 5 ország ~2000 rekordját (≈1,16 MB nyers JSON), így a
  // `JSON.parse` a hidratálással versengett a fő szálon.
  //
  // ⚠️ 2026-07-29 óta ORSZÁG-SZŰKÍTETT a kérés (`?country=`): a kliens úgyis egy
  // ország listáját mutatja, így a payload ~ötödére esett, és a „teljes lista
  // megjött" pillanat sokkal hamarabb jön el. Ez azért fontos, mert addig a
  // felhasználó csak az SSR-szeletet (30) látja — user-jelzés: „letölti, látja
  // csak 30 van, aztán le is törli". Ezért lett a watchdog is 2,5 s → 700 ms.
  //
  // Országonként külön tároljuk, hogy ország-váltáskor is legyen teljes lista
  // (és ne kelljen újratölteni azt, ami már megvan).
  const [fullByCountry, setFullByCountry] = useState<Record<string, ListBusiness[]>>({});
  const requestedRef = useRef<Set<string>>(new Set());
  // Hányszor futott már neki egy ország betöltése. KORLÁTOS (MAX_LIST_TRIES) —
  // egy tartós hiba ne pörgesse végtelenbe a kéréseket (a végpont IP/óra
  // rate-limitelt is), de egy pillanatnyi hálózati zökkenő magától gyógyuljon.
  const triesRef = useRef<Record<string, number>>({});
  const MAX_LIST_TRIES = 2;
  const loadFullList = useCallback((code: string) => {
    if (requestedRef.current.has(code)) return;
    if ((triesRef.current[code] ?? 0) >= MAX_LIST_TRIES) return;
    requestedRef.current.add(code);
    triesRef.current[code] = (triesRef.current[code] ?? 0) + 1;
    fetch(`/api/businesses/list?country=${encodeURIComponent(code)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ businesses?: ListBusiness[] }>) : null))
      .then((d) => {
        if (d?.businesses?.length) {
          setFullByCountry((prev) => ({ ...prev, [code]: d.businesses as ListBusiness[] }));
          return;
        }
        // Üres/hibás válasz → szabadítsuk fel, hogy a következő próba mehessen.
        requestedRef.current.delete(code);
      })
      .catch(() => {
        // Hálózati hiba → marad az SSR-szelet (működő, csak rövidebb lista).
        requestedRef.current.delete(code);
      });
  }, []);
  // Választott ország (6-ország rendszer) — ELÖL kell, mert a teljes lista
  // betöltése ország-szűkített. `null` = a preferencia még olvasás alatt.
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;

  useEffect(() => {
    type RIC = (cb: () => void, opts?: { timeout: number }) => number;
    const w = window as unknown as {
      requestIdleCallback?: RIC;
      cancelIdleCallback?: (h: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => loadFullList(country), { timeout: 700 });
      return () => w.cancelIdleCallback?.(id);
    }
    // requestIdleCallback nélkül (Safari): rövid késleltetés, hogy a hidratálás
    // előbb végezzen, csak azután fusson a fetch/parse.
    const t = window.setTimeout(() => loadFullList(country), 400);
    return () => clearTimeout(t);
  }, [loadFullList, country]);
  // Késleltetett újrapróba, ha az első kérés nem hozott listát: enélkül a
  // „lista töltődik…" felirat beragadna, és a user 30 kártyát látna. A
  // loadFullList guardja (MAX_LIST_TRIES) korlátozza, hányszor futhat.
  useEffect(() => {
    const t = window.setTimeout(() => loadFullList(country), 3000);
    return () => clearTimeout(t);
  }, [loadFullList, country, fullByCountry]);
  const fullList = fullByCountry[country] ?? null;
  // ⚠️ Ha megvan az ország teljes listája, CSAK azt használjuk — az SSR-szelet
  // többi országa amúgy is kiesne az ország-szűrőn, de így a szűrés is olcsóbb.
  const businesses = fullList ?? initialBusinesses;

  // Render-sapka: egyszerre legfeljebb ennyi kártya van a DOM-ban; a lista alján
  // lévő sentinel (vagy a gomb) bővíti. Szűrő-váltásra visszaáll az alapra.
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement | null>(null);
  // ?q és ?canton URL-paraméterek (a főoldalról / keresőből érkezve) → kezdő szűrők
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") ?? "";
  const initialCanton = searchParams?.get("canton") ?? "all";
  const initialFav = searchParams?.get("fav") === "1";
  const initialCat = searchParams?.get("cat") ?? "all";
  const initialPass = searchParams?.get("pass") === "1";

  // Deep-link szűrővel érkezve (?cat=/?q=/?canton=/?fav=/?pass= a főoldalról vagy a
  // keresőből) a user KERESNI jött → a pontos találathoz azonnal kell a teljes lista,
  // nem várunk az idle-watchdogra. Sima látogatásnál (alap szűrők) nem fut → marad
  // a deferrált betöltés.
  useEffect(() => {
    if (initialCat !== "all" || initialQ.trim() !== "" || initialCanton !== "all" || initialFav || initialPass) {
      loadFullList(country);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState(initialQ);
  const [canton, setCanton] = useState(initialCanton);
  const [showFavs, setShowFavs] = useState(initialFav);
  const [openNow, setOpenNow] = useState(false);
  const [passOnly, setPassOnly] = useState(initialPass);
  const [withContact, setWithContact] = useState(false);
  // Progresszív szűrő-felfedés: alapból csak a két hétköznapi szűrő (Régió +
  // Közelemben) látszik, a ritkábban használtak a „További szűrők" mögött.
  // Automatikusan nyitva, ha bármelyik rejtett szűrő aktív (pl. a menü
  // „Kedvenceim" ?fav=1 linkjéről érkezve) — aktív szűrő SOSEM tűnhet el.
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(initialFav || initialPass);
  const advancedActiveCount =
    (showFavs ? 1 : 0) + (passOnly ? 1 : 0) + (openNow ? 1 : 0) + (withContact ? 1 : 0);
  const filtersExpanded = moreFiltersOpen || advancedActiveCount > 0;
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
      // Ha a user mentett nézete a térkép, ott az ÖSSZES tű kell → azonnal
      // betöltjük a teljes listát (nem várunk az idle-watchdogra).
      if (saved === "map") loadFullList(country);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFullList]);
  const setViewPersist = (v: ViewMode) => {
    setView(v);
    // Térképre váltás → a teljes lista kell (minden tű); a guard miatt csak
    // egyszer kér. Lista-nézethez az SSR-szelet + idle-betöltés elég.
    if (v === "map") loadFullList(country);
    try { localStorage.setItem("kinti_szaknevsor_view", v); } catch { /* ignore */ }
  };
  const [cantonSheetOpen, setCantonSheetOpen] = useState(false);

  // A választott ország (`country`) FENT dől el (a teljes lista betöltése
  // ország-szűkített, ezért kell előbb). A régiók/feliratok ehhez igazodnak;
  // a régiók a lib/regions.ts-ből (CH: kantonok, AT: Bundeslandok, …).
  const countryName = getCountry(country)?.name ?? "Svájc";
  const regions = useMemo(() => getRegions(country), [country]);

  // Ország-/régió-tudatos térkép-közép a fallbackhez (találat nélkül se essen Svájcra).
  // ⚠️ MIND A HAT ország a KÖZÖS `regionPoint`-ból. Korábban itt csak CH/AT/DE
  // ága volt, ezért ES/GB/NL-ben a régió-választás nem mozgatta a térképet:
  // Galiciát választva a térkép Madridra zoomolt (a zoom 10-re ment, tehát a
  // ROSSZ helyre közelített is). A pont-modulok végig léteztek.
  const regioPont = useMemo(() => regionPoint(country, canton), [country, canton]);
  const mapCenter = useMemo<[number, number]>(() => {
    if (regioPont) return [regioPont.lat, regioPont.lng];
    return COUNTRY_MAP_CENTER[country] ?? COUNTRY_MAP_CENTER.CH;
  }, [country, regioPont]);
  // ⚠️ Csak akkor közelítünk régió-szintre, ha TÉNYLEG a régióra állt a térkép.
  // Ismeretlen kódnál az ország közepén maradunk — ott a 10-es zoom félrevezet.
  const mapZoom = regioPont ? 10 : (COUNTRY_MAP_ZOOM[country] ?? 7);
  // Ország-váltáskor a más országbeli régió-választás érvénytelen → vissza "all"-ra.
  // ⚠️ Az ország-preferencia KÉSVE érkezik (null = még töltődik): amíg nincs meg, NEM
  // törlünk — különben egy megosztott ?canton=W link régió-szűrője nem-CH usernél a
  // mount CH-default régiólistáján elveszne (audit-hiba, 2026-07-11).
  useEffect(() => {
    if (prefCountry === null) return;
    if (canton !== "all" && !regions.some((r) => r.code === canton)) setCanton("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, prefCountry]);

  /*
   * Kezdő régió-szűrő, ha nem URL-ből érkezett. Sorrend SZÁMÍT:
   *   1. amit a felhasználó UTOLJÁRA nézett ezen az oldalon — az „Egész
   *      országot" is beleértve,
   *   2. ha még sosem járt itt: a lakhely-preferenciája.
   *
   * ⚠️ Az 1. lépés hiányzott, és ez volt a jelentett hiba: aki tartományról
   * „Egész országra" váltott, majd visszajött, MEGINT a tartományt kapta —
   * mert a nézet a lakhely-preferenciából töltődött, az „all" pedig sehova
   * nem íródott. A hidratálás után futtatjuk, hogy ne legyen SSR-eltérés.
   */
  useEffect(() => {
    if (searchParams?.get("canton")) return;
    const nezet = readCantonView();
    if (nezet) {
      setCanton(nezet);
      return;
    }
    const pref = readPreferredCanton();
    if (pref) setCanton(pref);
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

  // Ékezet-hajtott kereső-index: cégenként egyszer előállított, normalizált blob
  // (név + kategória + bemutatkozó + cím) — így "becs"/"fodrasz"/"zurich" is
  // illeszkedik "Bécs"/"fodrász"/"Zürich"-re. Csak a `businesses` változásakor
  // épül újra, NEM minden billentyűleütésre.
  const searchIndex = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of businesses) {
      m.set(b.id, foldSearchText([b.name, b.categoryLabel, b.blurb, b.address].filter(Boolean).join(" ")));
    }
    return m;
  }, [businesses]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const foldedNeedle = foldSearchText(q.trim());
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
        // Kinti Pass elfogadóhely-szűrő (a kedvezménykártyát elfogadó helyek).
        const byPass = !passOnly || b.kintiPassActive === true;
        // Elérhetőséggel: csak azok, akiknek van telefonjuk vagy weboldaluk.
        const byContact = !withContact || hasContactInfo(b);
        const byText =
          !needle ||
          // ⚠️ SZÓ-SZINTŰ illesztés (nem összefüggő részlánc): minden szónak
          // szerepelnie kell, tetszőleges sorrendben, toldalék-tűréssel — így a
          // „bécsi fodrász" és a „fodrász wien" is talál. A korábbi
          // `blob.includes(needle)` ezekre NÉMÁN nullát adott.
          matchesSearchQuery(searchIndex.get(b.id) ?? "", foldedNeedle) ||
          // Svájci kanton-keresés szövegből is: pl. "Aargau", "ZH", "Tessin", …
          matchesCanton({ address: b.address ?? null }, needle);
        return byCountry && byCat && byCanton && byFav && byOpen && byPass && byContact && byText;
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
          // ⚠️ A korábbi képlet (0.6×közelség + 0.4×értékelés) a JELENLEGI
          // adatállapotban KONSTANS volt: 0 cégnek van véleménye, és
          // helymeghatározás nélkül a közelség is fix — vagyis MINDEN cég
          // 0.48-at kapott, és a rendezés a tömb eredeti (véletlen) sorrendjére
          // esett vissza. Az első látogató véletlen listát látott.
          //
          // Most a HASZNÁLHATÓSÁG is számít (telefon/cím/weboldal): a
          // felhasználó célja a kapcsolatfelvétel — ld. lib/listing-score.ts.
          const score = (it: typeof a) => {
            const prox = it.dist != null ? Math.max(0, 1 - it.dist / Math.max(radiusKm, 1)) : 0.4;
            return relevanceScore(it.b, prox, hasStreetAddress(it.b.address));
          };
          return score(b) - score(a);
        }
      }
    });

    return radiusFiltered;
  }, [businesses, searchIndex, country, cat, canton, q, showFavs, openNow, passOnly, withContact, favoriteIds, userPos, radiusKm, sortBy]);

  const locatedCount = useMemo(
    () => filtered.filter(({ b }) => b.lat != null && b.lng != null).length,
    [filtered],
  );

  /**
   * ⚠️ A KIÍRT találatszám. Amíg a teljes lista tölt, a `filtered.length` csak az
   * SSR-szeletből számol (országonként 30) — a friss felhasználó ilyenkor
   * „30 találat"-ot lát 413 helyett, és üresnek hiszi a szaknévsort. Ezért
   * SZŰRETLEN nézetben a szerverről kapott VALÓDI országos darabszámot írjuk ki.
   * Szűrés/keresés esetén marad a tényleges találatszám: ott a szerver-összeg
   * hazugság lenne (nem tudjuk, hány felel meg a szűrőnek).
   */
  const filtersActive =
    cat !== "all" || canton !== "all" || q.trim() !== "" ||
    showFavs || openNow || passOnly || withContact || userPos != null;
  const serverTotal = countryTotals?.[country] ?? 0;
  const displayCount =
    !fullList && !filtersActive && serverTotal > filtered.length ? serverTotal : filtered.length;

  const filteredBusinesses = useMemo(() => filtered.map(({ b }) => b), [filtered]);

  // Szűrő-váltás → vissza az 1. oldalra (a lapozás ne ragadjon be).
  useEffect(() => {
    setPage(1);
    // Bármely TÉNYLEGES szűkítés (kategória / szöveg / régió / kapcsoló) esetén a
    // pontos találathoz kell a teljes lista → azonnal betöltjük (a loader guardolt,
    // csak egyszer kér). Guard: friss mounton, ALAP szűrőkkel NEM fut, így a sima
    // böngészésnél megmarad a deferrált (idle) betöltés, és nem blokkolja a festést.
    if (cat !== "all" || q.trim() !== "" || canton !== "all" || showFavs || passOnly || openNow || withContact) {
      loadFullList(country);
    }
  }, [cat, canton, q, showFavs, openNow, passOnly, withContact, sortBy, country, loadFullList]);

  // Lapozás: oldal-váltáskor vissza a lista tetejére (a user ne a 100. kártya
  // után találja magát).
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    listTopRef.current?.scrollIntoView({ block: "start" });
  };

  // „0 találat" fallback: ha a régió/sugár-szűrő miatt üres a lista, de van az
  // adott KATEGÓRIÁRA/szövegre illeszkedő találat máshol, mutassuk a legközelebbieket
  // (GPS-szel 50 km-en belül; nélküle a kategória legjobbjait az országban) — ne a
  // semmit. Csak akkor, ha volt valódi keresési szándék (kategória vagy szöveg).
  const nearbyFallback = useMemo(() => {
    if (showFavs) return [] as { b: ListBusiness; dist: number | null }[];
    const needle = q.trim().toLowerCase();
    const foldedNeedle = foldSearchText(q.trim());
    if (cat === "all" && !needle) return [];
    const candidates = businesses.filter((b) => {
      if ((b.country ?? "CH") !== country) return false;
      if (cat !== "all" && b.categoryId !== cat) return false;
      if (needle) {
        // Ékezet-hajtott, SZÓ-SZINTŰ illesztés (ld. searchIndex) + kanton-szöveg.
        const hit =
          matchesSearchQuery(searchIndex.get(b.id) ?? "", foldedNeedle) ||
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
  }, [businesses, searchIndex, country, cat, q, userPos, showFavs]);

  // „Sosem üres kéz": ha a SZÖVEGES keresés nullát ad, elejtünk egy szót
  // (jellemzően a helynevet) és megmutatjuk, mi van nélküle. A szaknévsor
  // ritka (2248 tétel, 6 ország) — a „fogorvos bécs" simán nulla lehet
  // pusztán azért, mert abban a városban nincs. A puszta „nincs találat"
  // eltitkolná, hogy a szomszéd városban VAN.
  // ⚠️ A kategórianeveket ÁTADJUK védettként: a szakma a kérés lényege, a
  // helynév csak szűkítés — a szakmát elejteni használhatatlan ajánlást ad.
  const relaxed = useMemo(() => {
    if (filtered.length > 0 || showFavs) return null;
    const folded = foldSearchText(q.trim());
    if (!folded) return null;
    const pool = businesses.filter(
      (b) => (b.country ?? "CH") === country && (cat === "all" || b.categoryId === cat),
    );
    if (pool.length === 0) return null;
    const protectedTokens = categories
      .filter((c) => c.id !== "all")
      .map((c) => foldSearchText(c.label));
    const r = relaxSearchQuery(
      pool.map((b) => searchIndex.get(b.id) ?? ""),
      folded,
      protectedTokens,
    );
    if (!r) return null;
    const items = pool.filter((b) =>
      matchesSearchQuery(searchIndex.get(b.id) ?? "", r.kept.join(" ")),
    );
    return { dropped: r.dropped, items: items.slice(0, 12) };
  }, [filtered.length, showFavs, q, businesses, country, cat, categories, searchIndex]);

  // Kereslet-rés jel: a kategória-szűrős NULLA pontos találat eddig csak a
  // kliensen látszott — a szerver (és az operátor) semmit nem tudott róla.
  // Anonim, aggregált esemény a meglévő usage-csatornán (zero-<cc>-<kategória>),
  // sessionönként egyszer kulcsonként; az admin „Lefedettségi rések" panelje
  // ebből mutatja, HOVA kell kínálatot építeni. Csak betöltött adatnál mérünk
  // (átmeneti üres állapotra nem), és csak explicit kategória-választásnál.
  useEffect(() => {
    if (cat === "all" || showFavs || businesses.length === 0) return;
    if (filtered.length > 0) return;
    const key = `zero-${country.toLowerCase()}-${cat}`;
    try {
      const sk = `kinti_tracked:action:${key}`;
      if (sessionStorage.getItem(sk)) return;
      sessionStorage.setItem(sk, "1");
    } catch {
      /* private mode → mérés kihagyva */
    }
    trackAction(key);
  }, [cat, country, showFavs, businesses.length, filtered.length]);

  // Csak azokat a kategóriákat mutatjuk a pill-sorban, amikben TÉNYLEG van
  // vállalkozás (+ „Mind", + az épp kiválasztott) — így nincs üres, irreleváns
  // kategória, és a sor rövid/letisztult marad.
  const presentCatIds = useMemo(
    () =>
      new Set(businesses.filter((b) => (b.country ?? "CH") === country).map((b) => b.categoryId)),
    [businesses, country],
  );
  // Kategóriánkénti darabszám az AKTUÁLIS országban — a kereső javaslataihoz.
  // ⚠️ Ez szűri ki a nulla-találatos kategóriákat: azok felajánlása zsákutca.
  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of businesses) {
      if ((b.country ?? "CH") !== country) continue;
      m[b.categoryId] = (m[b.categoryId] ?? 0) + 1;
    }
    return m;
  }, [businesses, country]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.id === "all" || c.id === cat || presentCatIds.has(c.id)),
    [categories, cat, presentCatIds],
  );

  // ⚠️ A pill-sor elrejtése önmagában ZSÁKUTCA: ha egy szakmából nulla a
  // találat az adott országban, a user nem tudja kiválasztani → nem látja a
  // „nulla találat" állapot ajánló-CTA-it, és a kereslet-rés mérés
  // (zero-<cc>-<kat>) sem sül el SOHA. Vagyis pont azokról a szakmákról nem
  // kapunk se ajánlást, se jelzést, amik hiányoznak. Ezért a NAGY KERESLETŰ
  // szakmákat, amikből az adott országban nincs egy sem, külön kiírjuk a lista
  // alján — ott a hiány információ, nem zaj (ld. [[business-directory-high-
  // frequency-focus]]: fodrász/orvos/bolt/étterem/autószerelő a prioritás).
  const missingHighDemand = useMemo(() => {
    if (businesses.length === 0) return [];
    return HIGH_DEMAND_CATEGORY_IDS.filter((id) => !presentCatIds.has(id))
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is Category => Boolean(c))
      .slice(0, 6);
  }, [categories, presentCatIds, businesses.length]);

  // A térkép hely-pillhez: a kiválasztott régió neve, vagy "Egész <ország>"
  const locationLabel = useMemo(() => {
    if (canton === "all") return `Egész ${countryName}`;
    const found = regions.find((c) => c.code === canton);
    return found ? `${found.name} (${found.code})` : canton;
  }, [canton, regions, countryName]);

  // Csoportos ajánlatkérés CTA: kategória-szűrt lista-nézetben, ha van legalább 2
  // szolgáltató, akitől érdemes EGYSZERRE ajánlatot kérni (1-nél a kártya közvetlen
  // „Árajánlat" gombja a jobb út). A ?canton= továbbmegy az űrlap előválasztásába.
  const showGroupLeadCta = view === "list" && cat !== "all" && !showFavs && filtered.length >= 2;

  // Kontextuális „kevés a találat" supply-CTA: szűrt nézetben, 1–4 találatnál. Ha
  // ez vagy a csoportos-CTA látszik, a másik/általános CTA-t elnyomjuk (banner-halmozás ellen).
  const showLowCountCta =
    !showGroupLeadCta &&
    view === "list" && filtered.length > 0 && filtered.length <= 4 && (cat !== "all" || canton !== "all");

  return (
    <div className="space-y-3">
      {/* Honeypot (mézesbödön) — a felhasználó elől elrejtve (off-screen), de a
          HTML-t linkről linkre fésülő scraper-botok követik. Aki lekéri, az IP-je
          a tiltólistára kerül (a jó keresőrobotokat a robots.txt + UA-fehérlista
          védi). Lásd docs/anti-scraping.md. */}
      <a
        href="/api/businesses/honeypot-trigger"
        aria-hidden="true"
        tabIndex={-1}
        rel="nofollow"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        style={{ left: "-9999px", top: "-9999px" }}
      >
        Teljes vállalkozás-lista
      </a>

      {/* EGY kereső: kulcsszavas (élő) + ✨ AI (természetes nyelv → szűrők) */}
      <div className="px-5">
        <SmartSearchBar
          value={q}
          onChange={setQ}
          onApplyCategory={setCat}
          onApplyCanton={setCanton}
          onApplyQuery={setQ}
          categories={categories}
          categoryCounts={categoryCounts}
          // ⚠️ RÖVID placeholder KELL: a mező mellett ülő „AI-mód" gomb miatt a
          // beviteli sáv mobilon csak ~170px — a korábbi „Mit keresel? Pl.
          // villanyszerelő Berlinben" szó közepén vágódott el („…villanysze"),
          // ami törött benyomást keltett. Ez a változat elfér, ÉS továbbra is a
          // szakma+város mintát tanítja (a többszavas keresés most már működik,
          // ld. [[directory-search-tokenization]]).
          placeholder={`Pl. fodrász ${CITY_IN_EXAMPLE[country] ?? CITY_IN_EXAMPLE.CH}`}
        />
      </div>

      {/* Szűrők — 2 oszlopos rács (kettesével egymás alatt), hogy MINDEGYIK
          látszódjon egyszerre (a korábbi vízszintesen görgethető chip-sor
          végét a képernyő levágta — user-visszajelzés). */}
      <div className="grid grid-cols-2 gap-2 px-5 py-2">
        {/* Kanton szűrő — natív alsó lap (BottomSheet) */}
        <button
          type="button"
          onClick={() => setCantonSheetOpen(true)}
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-3 py-2 shadow-card transition hover:bg-surface-alt active:scale-[0.97]"
        >
          <Icon name="pin" size={14} strokeWidth={2.2} className="shrink-0 text-accent" />
          {/* ⚠️ FORDÍTVA VOLT: a KONSTANS „TARTOMÁNY" címke volt `shrink-0`, a
              VÁLTOZÓ érték pedig `truncate` — így a gomb „TARTOMÁNY E…"-t
              mutatott, vagyis pont az információt vágta le, a díszítést hagyta
              meg. A pin-ikon amúgy is jelzi, hogy helyről van szó, és a
              megnyíló alsó lap címe kimondja („Válassz tartományt”), ezért a
              címke csak akkor fér be, ha marad hely — az ÉRTÉK viszi a sort.
              Ország-illő megnevezés (user-jelzés: Ausztriában nincs kanton). */}
          {/* Natív szűrő-csip viselkedés: BEÁLLÍTATLANUL a szűrő NEVE, beállítva
              az ÉRTÉKE. Így egyik állapotban sem vágódik le semmi.

              ⚠️ Korábban a konstans „TARTOMÁNY" címke ÉS az érték egyszerre
              fértek volna a fél szélességű pirulába — nem fértek, és mivel a
              címke volt `shrink-0`, pont az információ csonkult: „TARTOMÁNY E…".
              Az „Egész Németország" önmagában is túl hosszú ide (17 karakter),
              ezért az alaphelyzet a rövid szűrőnév.

              ⚠️ A `locationLabel`-hez NEM nyúlunk: azt a térkép is megkapja
              (lásd lentebb), ott a teljes „Egész Németország" a helyes szöveg. */}
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold tracking-[-0.01em] text-ink">
            {canton === "all"
              ? regionLabel(country).charAt(0).toUpperCase() + regionLabel(country).slice(1)
              : locationLabel}
          </span>
          <Icon name="chevD" size={13} strokeWidth={2.2} className="shrink-0 text-ink-muted" />
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
                    // A NÉZETET mindig megjegyezzük — az „Egész országot" is,
                    // különben visszatéréskor újra a régi tartomány jönne fel
                    // (ez volt a jelentett hiba).
                    setCantonView(c.code);
                    // A LAKHELY-preferenciát viszont csak VALÓDI régióból
                    // tanuljuk. Az „Egész ország" nézet-szűrő, nem
                    // lakhely-nyilatkozat — törlésként kiütné a mentett
                    // tartományt (onboarding-lépés + push-célzás).
                    if (c.code !== "all") setPreferredCanton(c.code);
                    setCantonSheetOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-1 rounded-xl border px-3 py-2.5 text-left text-[13.5px] font-bold transition active:scale-[0.97]",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary-ink"
                      : "border-line bg-surface text-ink hover:bg-surface-alt",
                  )}
                >
                  <span className="truncate">
                    {c.name}
                    {c.code !== "all" ? ` (${c.code})` : ""}
                  </span>
                  {active && <Icon name="check" size={15} strokeWidth={3} className="shrink-0 text-primary-ink" />}
                </button>
              );
            })}
          </div>
        </BottomSheet>

        {/* Közelemben / radius-szűrő — a Régió mellett ez a másik hétköznapi szűrő */}
        <button
          type="button"
          onClick={userPos ? clearGeolocation : requestGeolocation}
          aria-pressed={userPos != null}
          disabled={geoState === "loading"}
          className={cn(
            "inline-flex min-w-0 items-center justify-center gap-2 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            userPos
              ? "bg-primary/10 border-primary/30 text-primary-ink font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
            geoState === "loading" && "opacity-60 cursor-wait",
          )}
        >
          <Icon
            name="pin"
            size={12}
            strokeWidth={2.4}
            className={cn("shrink-0", userPos ? "text-primary-ink" : "text-ink-muted")}
          />
          <span className="flex min-w-0 items-center gap-1 truncate text-[11.5px] font-bold tracking-wide select-none">
            {geoState === "loading"
              ? "Helymeghatározás…"
              : userPos
                ? (
                  <>
                    {radiusKm} km-en belül <Icon name="close" size={10} strokeWidth={3} className="shrink-0" />
                  </>
                )
                : "Közelemben"}
          </span>
        </button>

        {/* Radius választó — csak ha aktív a helymeghatározás */}
        {userPos && (
          <label className="relative inline-flex min-w-0 items-center justify-center gap-2 rounded-pill border border-primary/30 bg-primary/5 px-3 py-2 shadow-card cursor-pointer transition hover:bg-primary/10">
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-primary/70 select-none">
              Sugár
            </span>
            <span className="shrink-0 text-[13px] font-bold tracking-[-0.01em] text-primary-ink">
              {radiusKm} km
            </span>
            <Icon name="chevD" size={13} strokeWidth={2.2} className="shrink-0 text-primary/70" />
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

        {filtersExpanded && (
          <>
        {/* Kedvencek szűrő */}
        <button
          type="button"
          onClick={() => setShowFavs(!showFavs)}
          className={cn(
            "inline-flex min-w-0 items-center justify-center gap-2 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
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
          <span className="truncate text-[11.5px] font-bold tracking-wide select-none">
            Mentett kedvencek
          </span>
        </button>

        {/* Kinti Pass elfogadóhely-szűrő (arany) */}
        <button
          type="button"
          onClick={() => setPassOnly((v) => !v)}
          aria-pressed={passOnly}
          className={cn(
            "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            passOnly
              ? "bg-star/15 border-star/50 text-ink font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <Icon name="ticket" size={13} strokeWidth={2.2} className={cn("shrink-0", passOnly ? "text-star-ink" : "text-ink-muted")} />
          <span className="truncate text-[11.5px] font-bold tracking-wide select-none">
            Csak Kinti Pass helyek
          </span>
        </button>

        {/* Most nyitva szűrő */}
        <button
          type="button"
          onClick={() => setOpenNow((v) => !v)}
          aria-pressed={openNow}
          className={cn(
            "inline-flex min-w-0 items-center justify-center gap-2 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            openNow
              ? "bg-success/10 border-success/30 text-success-ink font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              openNow ? "bg-success animate-pulse" : "bg-ink-faint",
            )}
          />
          <span className="truncate text-[11.5px] font-bold tracking-wide select-none">
            Most nyitva
          </span>
        </button>

        {/* Elérhetőséggel szűrő — csak akinek van telefonja vagy weboldala (nem
            zsákutca csak-cím találat). A kontakt-dúsítás eredményét használja ki. */}
        <button
          type="button"
          onClick={() => setWithContact((v) => !v)}
          aria-pressed={withContact}
          className={cn(
            "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-pill border px-3 py-2 shadow-card transition cursor-pointer active:scale-[0.97]",
            withContact
              ? "bg-primary/10 border-primary/40 text-primary-ink font-bold"
              : "bg-surface border-line text-ink-muted hover:bg-surface-alt",
          )}
        >
          <Icon name="phone" size={13} strokeWidth={2.2} className={cn("shrink-0", withContact ? "text-primary-ink" : "text-ink-muted")} />
          <span className="truncate text-[11.5px] font-bold tracking-wide select-none">
            Elérhetőséggel
          </span>
        </button>

          </>
        )}

        {/* A ritkább szűrők kapcsolója — csak akkor látszik, ha egyik rejtett
            szűrő sem aktív (aktív szűrőt nem engedünk eltüntetni). */}
        {advancedActiveCount === 0 && (
          <button
            type="button"
            onClick={() => {
              setMoreFiltersOpen((v) => !v);
            }}
            aria-expanded={filtersExpanded}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-pill border border-dashed border-line bg-surface px-3 py-2 text-[11.5px] font-bold tracking-wide text-ink-muted transition hover:bg-surface-alt active:scale-[0.97]"
          >
            {filtersExpanded ? "Kevesebb szűrő" : "További szűrők"}
            <Icon
              name="chevD"
              size={13}
              strokeWidth={2.2}
              className={cn("shrink-0 transition-transform", filtersExpanded && "rotate-180")}
            />
          </button>
        )}
      </div>

      {/* Kinti Pass szűrő aktív → emlékeztető a saját digitális kártyára */}
      {passOnly && (
        <div className="px-5">
          <Link
            href="/profil/kinti-pass"
            className="flex items-center gap-3 rounded-card border border-star/40 bg-star/10 px-4 py-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-star/20 text-star-ink">
              <Icon name="ticket" size={18} strokeWidth={2} />
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
          {geoState === "denied" ? (
            <>
              Helymeghatározás letiltva.{" "}
              <Link href="/helymeghatarozas" className="font-bold underline">
                Így engedélyezed újra →
              </Link>
            </>
          ) : (
            "Nem sikerült lekérni a helyzeted. Próbáld újra később."
          )}
        </div>
      )}

      {/* ⚠️ ITT KORÁBBAN HÁROM BLOKK ÁLLT (2026-08-01-ig): a vállalkozás-
          regisztrációs CTA, az árajánlat-kérő CTA és a push-feliratkozás.
          Együtt ~200px-t vittek el a TALÁLATOK ELŐL, és emiatt az első
          cégkártya y=810px-re, azaz 1,2 képernyővel lejjebb került — a
          látogató a szaknévsor FŐ képernyőjén végiggörgetett egy teljes
          képernyőt, mire egyetlen céget látott.

          Mindhárom a lista ALJÁRA került (ld. lentebb):
          • a regisztrációs CTA a TULAJDONOSNAK szól, nem a keresőnek —
            ugyanaz a hibaosztály, mint a cégadatlap claim-kártyája volt;
          • a push-engedélykérés AZELŐTT kért értesítés-jogot, hogy az app
            bármit adott volna — natív appban is érték UTÁN kérünk engedélyt,
            és egy elutasított push-jogot nem lehet újra kérni;
          • az árajánlat-CTA maradna hasznos, de a lead-út KONTEXTUÁLISAN már
            le van fedve (zsákutca-pillanat, „kevés a találat", üres térkép) —
            azok jobban céloznak, mint egy fejléc-banner.

          A kategória-pillek SZÁNDÉKOSAN maradnak itt: azok a szaknévsor
          elsődleges navigációja, és a tördelt elrendezés user-döntés. */}

      {/* A kategória-pillek list-módban itt fent; map-módban a térképre úsztatva. */}
      {view === "list" && (
        <CategoryPills categories={visibleCategories} active={cat} onSelect={setCat} />
      )}

      {/* Lista / Térkép váltó + meta-sor */}
      <div className="flex items-center justify-between gap-3 px-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
          {displayCount} találat
          {/* Töltés közben jelezzük, hogy a lista még épül — a SZÁM viszont már
              a valódi (ld. displayCount), hogy ne tűnjön üresnek a szaknévsor. */}
          {!fullList && (
            <span className="ml-1 normal-case tracking-normal text-ink-faint">
              (lista töltődik…)
            </span>
          )}
          {view === "map" && locatedCount < filtered.length && (
            <span className="ml-1 normal-case tracking-normal text-ink-faint">
              ({locatedCount} térképen)
            </span>
          )}
        </p>
        <ViewSwitch value={view} onChange={setViewPersist} />
      </div>

      {/* Rendezés (csak lista-nézetben, ha van mit rendezni). A címke KÜLÖN
          sorban a pillek fölött — egy sorban a pillekkel a „Legújabb" 390px-es
          mobilon kicsordult és egyedül tört új sorba (user-jelzés). */}
      {view === "list" && filtered.length > 1 && (
        <div className="px-5">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-faint">Rendezés</span>
          <div className="flex flex-wrap items-center gap-2">
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
                  "inline-flex flex-none items-center gap-1 rounded-pill px-3 py-1.5 text-[12px] font-bold tracking-[-0.01em] transition",
                  on
                    ? "bg-primary text-white shadow-card"
                    : "bg-surface text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-alpha))]",
                )}
              >
                {o.icon && <Icon name={o.icon} size={12} strokeWidth={2.4} filled={o.icon === "star"} />}
                {o.label}
              </button>
            );
          })}
          </div>
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
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary-ink" />
            </Link>
          </div>
        )}

      {view === "list" ? (
        /* grid-cols-[minmax(0,1fr)]: az oszlop SOSEM nőhet a konténer fölé —
           mélységi védelem a „széles gyerek szétfeszíti a trackot, minden
           kártya levágódik" hiba-osztály ellen (ld. recent-businesses). */
        <div ref={listTopRef} className="grid grid-cols-[minmax(0,1fr)] gap-2.5 px-5 scroll-mt-4">
          {/* „Legutóbb megnézted" — csak az alap-nézetben (keresés/szűrés közben
              nem tolakszik a találatok elé). Kliens-oldali, hidratálás-biztos. */}
          {!q.trim() && cat === "all" && !showFavs && <RecentBusinessesStrip />}

          {/* Csoportos ajánlatkérés — a user-pitch: „ne kelljen egyenként mindenkinek
              írni"; egy űrlap → az összes helyi releváns cég versenyzik a leadért. */}
          {showGroupLeadCta && (
            <Link
              href={`/szaknevsor/ajanlatkeres?cat=${encodeURIComponent(cat)}${canton !== "all" ? `&canton=${encodeURIComponent(canton)}` : ""}`}
              onClick={() => trackAction("lead-group-cta")}
              className="flex items-center gap-3 rounded-card border-2 border-primary/25 bg-gradient-to-br from-primary/5 to-surface px-4 py-3.5 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary text-white"><Icon name="send" size={19} strokeWidth={2.2} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-primary-ink">Csoportos árajánlat</span>
                <span className="block text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-ink">
                  Ne írj mindenkinek külön — kérj ajánlatot egyszerre
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  Írd le egyszer, mire van szükséged — a helyi magyar szakik keresnek meg téged.
                </span>
              </span>
              <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-primary-ink" />
            </Link>
          )}

          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(({ b, dist }) => {
            const card = (
              <BusinessCard
                key={b.id}
                business={b}
                href={`/szaknevsor/${b.id}${q.trim() ? `?st=${encodeURIComponent(q.trim())}` : ""}`}
                distanceKm={dist}
                showFavorite
              />
            );
            // Kedvenceim-nézetben (showFavs) balra húzva eltávolítható a listáról —
            // a szív-gomb a kártyán marad, ez egy kiegészítő gesztus-út ugyanahhoz.
            if (!showFavs) return card;
            return (
              <SwipeAction
                key={b.id}
                actionLabel="Törlés"
                actionIcon="close"
                onAction={() => removeFavorite(b.id)}
                className={b.featured ? "border-2 border-pro shadow-pop bg-pro/[0.02]" : "border border-line shadow-card"}
              >
                <BusinessCard
                  business={b}
                  href={`/szaknevsor/${b.id}${q.trim() ? `?st=${encodeURIComponent(q.trim())}` : ""}`}
                  distanceKm={dist}
                  showFavorite
                  flat
                />
              </SwipeAction>
            );
          })}

          {/* Lapozó — 100 találat / oldal (Előző · „x/y. oldal" · Következő). */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 py-1">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink shadow-card transition active:scale-95 disabled:opacity-40"
              >
                <Icon name="arrowLeft" size={13} strokeWidth={2.4} /> Előző
              </button>
              <span className="text-[12px] font-bold text-ink-muted">
                {page}. oldal · összesen {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink shadow-card transition active:scale-95 disabled:opacity-40"
              >
                Következő <Icon name="arrowRight" size={13} strokeWidth={2.4} />
              </button>
            </div>
          )}

          {/* „Sosem üres kéz": a szöveges keresés nullát adott, de EGY szó
              elhagyásával van találat. Kiírjuk, MELYIK szót ejtettük el —
              különben a felhasználó nem értené, miért mást lát. */}
          {filtered.length === 0 && nearbyFallback.length === 0 && relaxed && relaxed.items.length > 0 && (
            <>
              <div className="rounded-card border border-star/30 bg-star/5 px-4 py-3 text-[12.5px] leading-snug text-ink-muted">
                Nincs pontos találat erre: <strong className="text-ink">„{q.trim()}"</strong>.
                A(z) <strong className="text-ink">„{relaxed.dropped}"</strong> szó nélkül ezeket találtuk:
              </div>
              {relaxed.items.map((b) => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  href={`/szaknevsor/${b.id}${q.trim() ? `?st=${encodeURIComponent(q.trim())}` : ""}`}
                  showFavorite
                />
              ))}
            </>
          )}

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
                  {/* Kereslet-befogás: a zsákutca-pillanatban ajánlatkérésre
                      fordítjuk a szándékot (a fan-out kategória-szinten céloz,
                      kanton nélkül országosan is). */}
                  {cat !== "all" && (
                    <Link
                      href={`/szaknevsor/ajanlatkeres?cat=${encodeURIComponent(cat)}`}
                      className="flex items-center gap-3 rounded-card border border-pro/30 bg-pro/5 px-4 py-3 text-left transition active:scale-[0.99]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-pro text-on-pro"><Icon name="send" size={15} strokeWidth={2.4} /></span>
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-bold text-ink">Kérj árajánlatot — ők keresnek meg</span>
                        <span className="block text-[12px] text-ink-muted">Egy űrlap, és a kategória magyar vállalkozói e-mailben kapják az igényed.</span>
                      </span>
                    </Link>
                  )}
                  <Link
                    href="/szaknevsor/ajanlas"
                    className="flex items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary-ink"><Icon name="plus" size={16} strokeWidth={2.6} /></span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold text-ink">Ismersz egyet{cantonLabel ? ` ${cantonLabel} környékén` : ""}?</span>
                      <span className="block text-[12px] text-ink-muted">Ajánlj egy magyar vállalkozót — pár kattintás, és felkerül.</span>
                    </span>
                  </Link>
                </>
              );
            })()
          )}

          {filtered.length === 0 && nearbyFallback.length === 0 && !(relaxed && relaxed.items.length > 0) && (
            (() => {
              const cantonLabel = canton !== "all" ? regions.find((c) => c.code === canton)?.name ?? null : null;
              const subject = !showFavs ? (cat !== "all" ? (categories.find((c) => c.id === cat)?.label ?? null) : (q.trim() || null)) : null;
              return (
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center shadow-card">
              {/* Ikon-halo — egységes „állapot" nyelv az EmptyState / RouteError-rel. */}
              <span
                aria-hidden
                className="kinti-pop mb-1 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary-ink shadow-[0_0_0_5px_rgb(var(--primary)/0.06),0_0_0_11px_rgb(var(--primary)/0.03)]"
              >
                <Icon name={showFavs ? "heart" : "pin"} size={24} strokeWidth={2.1} />
              </span>
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
                  {/* Kereslet-befogás a teljes zsákutcában is: kategória-választásnál
                      ajánlatkérés (a fan-out országosan céloz), egyébként Keresek-poszt. */}
                  {cat !== "all" ? (
                    <Link
                      href={`/szaknevsor/ajanlatkeres?cat=${encodeURIComponent(cat)}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-pro px-4 py-2.5 text-[13px] font-extrabold text-on-pro shadow-card-hover active:scale-[0.98]"
                    >
                      <Icon name="send" size={14} strokeWidth={2.4} /> Kérj árajánlatot — ők keresnek meg
                    </Link>
                  ) : (
                    <Link
                      href="/keresek"
                      className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-pro px-4 py-2.5 text-[13px] font-extrabold text-on-pro shadow-card-hover active:scale-[0.98]"
                    >
                      <Icon name="send" size={14} strokeWidth={2.4} /> Add fel a Keresek-be — jelentkeznek
                    </Link>
                  )}
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
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary-ink">
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
              <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary-ink" />
            </Link>
          )}

          {/* Hiányzó nagy-keresletű szakmák. Ezek a kategóriák NEM jelennek meg a
              pill-sorban (nincs bennük egy tétel sem), így a user eddig nem is
              tudta, hogy hiányoznak — és ajánlani sem tudott rájuk. A `?cat=`
              előválasztja a szakmát az ajánló-űrlapon. Csak akkor jelenik meg,
              ha van mit ajánlani, és nem szűkített nézetben (kedvencek/keresés). */}
          {missingHighDemand.length > 0 && cat === "all" && !showFavs && !q.trim() && (
            <section className="rounded-card border border-dashed border-line bg-surface px-4 py-3">
              <p className="text-[13px] font-extrabold tracking-[-0.01em] text-ink">
                Ezek a szakmák még hiányoznak {countryLocative(country)}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                Ismersz egyet? Koppints rá és ajánld be — mi ellenőrizzük és felvesszük.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {missingHighDemand.map((c) => (
                  <Link
                    key={c.id}
                    href={`/szaknevsor/ajanlas?cat=${encodeURIComponent(c.id)}`}
                    className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95"
                  >
                    <Icon name="plus" size={12} strokeWidth={2.6} className="text-primary-ink" />
                    {c.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Self-service CTA-k + push — a LISTA UTÁN. Fentről kerültek ide
              (ld. a fenti magyarázatot): a kereső dolga a találat, ezek pedig
              más közönségnek (tulajdonos) vagy későbbi pillanatnak (értesítés-
              engedély) szólnak. Aki végiggörgette a listát, az vagy megtalálta,
              amit keresett, vagy nyitott a következő lépésre — mindkét esetben
              ITT van a helyük. */}
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
            <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-primary-ink" />
          </Link>

          {/* Lead gen CTA — árajánlat-kérés */}
          <Link
            href="/szaknevsor/ajanlatkeres"
            className="flex items-center gap-3 rounded-card border border-accent/25 bg-accent/5 px-4 py-3 shadow-card transition active:scale-[0.99]"
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
          <PushOptin />
        </div>
      ) : (
        <div className="px-3">
          <Suspense
            fallback={
              // ⚠️ Shimmer-váz a nyers „Térkép betöltése…" szöveg helyett — a
              // térkép a szaknévsor MÁSODIK fő nézete, és ez a doboz 440px+
              // magas: szöveggel kitöltve az egész képernyő „weboldalnak" néz ki.
              <div className="relative mb-2 h-[calc(100dvh-300px)] min-h-[440px] max-h-[760px] overflow-hidden rounded-card border border-line shadow-card">
                <Skeleton className="h-full w-full rounded-none" />
                <span className="sr-only">Térkép betöltése…</span>
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
              {/* Kereslet-befogás a térkép-nézet zsákutcájában is (a lista-nézet
                  párja) — a fan-out kategória-szinten országosan is céloz. */}
              {cat !== "all" && (
                <Link
                  href={`/szaknevsor/ajanlatkeres?cat=${encodeURIComponent(cat)}`}
                  className="flex items-center gap-3 rounded-card border border-pro/30 bg-pro/5 px-4 py-3 text-left transition active:scale-[0.99]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-pro text-on-pro"><Icon name="send" size={15} strokeWidth={2.4} /></span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold text-ink">Kérj árajánlatot — ők keresnek meg</span>
                    <span className="block text-[12px] text-ink-muted">Egy űrlap, és a kategória magyar vállalkozói e-mailben kapják az igényed.</span>
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- nézet-váltó (natív szegmentált vezérlő, csúszó kapszulával) ------------
const NEZET_OPCIOK = [
  { id: "list" as const, label: "Lista", icon: "list" as const },
  { id: "map" as const, label: "Térkép", icon: "map" as const },
];

function ViewSwitch({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <SegmentedControl
      options={NEZET_OPCIOK}
      value={value}
      onChange={onChange}
      ariaLabel="Nézet"
      size="sm"
      fill={false}
    />
  );
}

