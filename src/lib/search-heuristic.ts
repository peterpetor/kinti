/**
 * search-heuristic.ts — pehelysúlyú, KLIENS-OLDALI kereső-értelmező.
 *
 * A SmartSearchBar ✨ AI-módja minden Enterre/kattintásra a Workers AI-hoz fordul
 * (`/api/ai/parse-search`), ami drága és rate-limitált (20 kérés/óra/IP). A tipikus
 * keresés viszont EGYSZERŰ minta: „kategória + helyszín" (pl. „fodrász Zürich",
 * „orvos Bécsben", „villanyszerelő Aargauban"). Ezt regex/szótár alapon HELYBEN
 * fel tudjuk oldani a meglévő statikus listákból (kategória-labelek + régió-nevek),
 * AI-hívás nélkül.
 *
 * Csak akkor tér vissza eredménnyel (≠ null), ha a query TISZTA „kat + hely" minta:
 * minden érdemi tokent elnyelt egy kategória, egy régió, vagy egy stopszó. Ha marad
 * bármi értelmes maradék (természetes nyelv: „aki angolul beszél", „hétvégén nyitva",
 * cégnév, stb.), null-t ad → a hívó ilyenkor az AI-hoz fordul. Így az AI kvótát a
 * gyakori esetekre megspóroljuk, a bonyolult kéréseket pedig továbbra is az AI viszi.
 *
 * PURE (nincs se React, se Cloudflare függés) → unit-tesztelhető, és a kliens
 * bundle-be is olcsón belefér. A régió-illesztéshez a `getRegions()` (ország-tudatos)
 * és CH-nál a `cantonFromAddress()` (város/PLZ → kanton) listákat használja.
 */
import { getRegions } from "./regions";
import { cantonFromAddress } from "./cantons";

export interface HeuristicCategory {
  id: string;
  label: string;
}

export interface HeuristicResult {
  categoryId: string | null;
  cantonCode: string | null;
  /** A heurisztikában mindig üres: a struktúra-szűrők nyelik el a szöveget. */
  keywords: string;
  /** Rövid magyar visszajelzés a felhasználónak (a SmartSearchBar jegyzet-sora). */
  explanation: string;
}

/** Ékezet-hajtás + kisbetű; a nem-alfanumerikus karaktereket megtartjuk elválasztónak. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Foldolt tokenek (csak betű/szám blokkok). */
function tokenize(s: string): string[] {
  return fold(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

/**
 * Magyar toldalék-fehérlista: egy hely-/kategórianév után CSAK ezek a végződések
 * engedhetők meg prefix-illesztésnél. Így „Zürichben"→„zürich" ILLESZKEDIK, de
 * „Wiener" NEM illeszkedik a „Wien"-re (a maradék „er" nincs a listán). Foldolt
 * (ékezet-mentes) alakok: ből→bol, nál→nal, höz→hoz, őt→ot, stb.
 */
const SUFFIX_RE =
  /^(ban|ben|ba|be|bol|rol|tol|nal|nel|hoz|hez|ra|re|on|en|nak|nek|val|vel|ert|ig|kent|ok|ek|ak|t|ot|et|at|i)$/;

/** Illeszkedik-e a `token` a `cand` szótári alakra (pontos VAGY magyar-toldalékos)? */
function matchesWithSuffix(token: string, cand: string): boolean {
  if (token === cand) return true;
  // Prefix + megengedett toldalék: csak elég hosszú tövnél (rövidnél zaj lenne).
  if (cand.length >= 4 && token.length > cand.length && token.startsWith(cand)) {
    return SUFFIX_RE.test(token.slice(cand.length));
  }
  return false;
}

/**
 * Stopszavak (foldolt): töltelék + lágy minősítők + hely-elöljárók + keresés-igék.
 * FONTOS: ide CSAK olyan szó kerülhet, ami NEM hordoz struktúra-szűrő jelentést.
 * Ami igen (nyelv: „angolul", „németül"; nyitvatartás: „nyitva", „hétvégén",
 * „vasárnap", „este") SZÁNDÉKOSAN kimarad → azt maradéknak vesszük → AI dönt.
 */
const STOPWORDS = new Set<string>([
  // névelők / névmások / kötőszók / létige
  "a", "az", "egy", "es", "s", "meg", "aki", "akit", "aki", "ami", "amit", "amely",
  "ez", "ezt", "ott", "itt", "ilyen", "olyan", "van", "volt", "levo", "valo", "vagy",
  // keresés / szándék igék
  "keresek", "keres", "keresem", "keresnek", "kene", "kell", "kellene", "kellhet",
  "szeretnek", "szeretnem", "akarok", "tudsz", "tudna", "ajanlj", "ajanljatok",
  "ajanlana", "ajanlast", "kerek", "kerem",
  // lágy minősítők (struktúrában úgysem kifejezhetők → nyugodtan elnyelhetők)
  "magyar", "magyarul", "jo", "joo", "olcso", "olcson", "gyors", "gyorsan",
  "megbizhato", "ugyes", "profi", "legjobb", "kozeli", "legkozelebbi", "rendes",
  "korrekt", "tapasztalt", "ajanlott",
  // hely-elöljárók / közelség
  "kozeleben", "kozelben", "kornyeken", "kornyeke", "kornyekbeli", "kozel",
  "koruli", "mellett", "mellette", "kornyeken",
  // általános „szakember" szinonimák
  "valaki", "valakit", "valami", "szakember", "szakembert", "szaki", "szakit",
  "vallalkozo", "vallalkozot", "vallalkozas", "ceg", "ceget", "szolgaltatas",
]);

/**
 * Ország-tudatos régió-illesztő. Végigmegy a tokeneken, és az elsőnek talált
 * régióra (kanton/tartomány/provincia) állítja a `code`-ot; a hozzá tartozó
 * tokent „elfogyasztottnak" jelöli (`consumed[i]=true`), hogy a maradék-kapu
 * pontos legyen. Többszavas aliasokat (pl. „den haag") is felismer.
 */
function matchRegion(
  country: string,
  tokens: string[],
  consumed: boolean[],
): { code: string; name: string } | null {
  const regions = getRegions(country);
  if (regions.length === 0) return null;

  // A régiónkénti szótári alakok: név + aliasok, foldolva, tokenekre bontva.
  // Hosszabb (specifikusabb) nevek előrébb, hogy a „Niederösterreich" megelőzze
  // egy esetleges rövidebb ütközőt.
  const cands = regions
    .map((r) => ({
      code: r.code,
      name: r.name,
      forms: [r.name, ...(r.aliases ?? [])]
        .map((n) => fold(n).split(/[^a-z0-9]+/).filter(Boolean))
        .filter((parts) => parts.length > 0),
    }))
    .sort((a, b) => {
      const la = Math.max(0, ...a.forms.map((f) => f.join(" ").length));
      const lb = Math.max(0, ...b.forms.map((f) => f.join(" ").length));
      return lb - la;
    });

  // 1) Többszavas alakok: egymást követő, még szabad tokenek pontos egyezése.
  for (const c of cands) {
    for (const form of c.forms) {
      if (form.length < 2) continue;
      for (let i = 0; i + form.length <= tokens.length; i++) {
        let ok = true;
        for (let k = 0; k < form.length; k++) {
          if (consumed[i + k] || tokens[i + k] !== form[k]) { ok = false; break; }
        }
        if (ok) {
          for (let k = 0; k < form.length; k++) consumed[i + k] = true;
          return { code: c.code, name: c.name };
        }
      }
    }
  }

  // 2) Egyszavas alakok: token = név/alias (pontos vagy magyar-toldalékos).
  for (const c of cands) {
    for (const form of c.forms) {
      if (form.length !== 1) continue;
      const word = form[0];
      for (let i = 0; i < tokens.length; i++) {
        if (consumed[i]) continue;
        if (matchesWithSuffix(tokens[i], word)) {
          consumed[i] = true;
          return { code: c.code, name: c.name };
        }
      }
    }
  }

  // 3) CH kiegészítés: ismert város / PLZ token → kanton (a kanton-neveken túl).
  if (country === "CH") {
    for (let i = 0; i < tokens.length; i++) {
      if (consumed[i]) continue;
      const byAddr = cantonFromAddress(tokens[i]);
      if (byAddr) {
        consumed[i] = true;
        const r = regions.find((x) => x.code === byAddr.code);
        return { code: byAddr.code, name: r?.name ?? byAddr.name };
      }
    }
  }

  return null;
}

/**
 * Kategória-illesztő két szinten:
 *   1) EGÉSZ-LABEL: a query egy tokenje = egy label (»/«-re bontott) része,
 *      pontosan vagy magyar-toldalékkal. Ez a legerősebb jel („fodrász"→Fodrász,
 *      nem az „Alkalmi fodrász / Sminkes").
 *   2) DISZTINKTÍV TOKEN: ha az 1. üres, egy olyan label-token, ami PONTOSAN EGY
 *      kategóriában fordul elő (az ambivalens tokeneket eldobjuk).
 * Ha a szint egynél több KÜLÖNBÖZŐ kategóriát ad → ambivalens → null (menjen AI-hoz).
 */
function matchCategory(
  categories: HeuristicCategory[],
  tokens: string[],
  consumed: boolean[],
): { id: string; label: string; tokenIndex: number } | null {
  // --- 1) Egész-label (»/«-részek) ---
  interface Part { id: string; label: string; parts: string[][] }
  const catParts: Part[] = categories
    .filter((c) => c.id !== "all")
    .map((c) => ({
      id: c.id,
      label: c.label,
      parts: c.label
        .split("/")
        .map((p) => fold(p).split(/[^a-z0-9]+/).filter(Boolean))
        .filter((p) => p.length > 0),
    }));

  {
    const hits = new Map<string, { label: string; tokenIndex: number }>();
    for (let i = 0; i < tokens.length; i++) {
      if (consumed[i]) continue;
      const tok = tokens[i];
      for (const c of catParts) {
        for (const part of c.parts) {
          if (part.length === 1) {
            if (matchesWithSuffix(tok, part[0])) hits.set(c.id, { label: c.label, tokenIndex: i });
          }
        }
      }
    }
    // Többszavas label-részek (pl. „alkalmi fodrasz") mint összefüggő token-sor.
    for (const c of catParts) {
      for (const part of c.parts) {
        if (part.length < 2) continue;
        for (let i = 0; i + part.length <= tokens.length; i++) {
          let ok = true;
          for (let k = 0; k < part.length; k++) {
            if (consumed[i + k] || tokens[i + k] !== part[k]) { ok = false; break; }
          }
          if (ok) hits.set(c.id, { label: c.label, tokenIndex: i });
        }
      }
    }
    if (hits.size === 1) {
      const [id, v] = [...hits.entries()][0];
      consumed[v.tokenIndex] = true;
      return { id, label: v.label, tokenIndex: v.tokenIndex };
    }
    if (hits.size > 1) return null; // egyértelműsíthetetlen → AI
  }

  // --- 2) Disztinktív token ---
  // token → az őt tartalmazó kategóriák halmaza (label-tokenenként).
  const tokenToCats = new Map<string, Set<string>>();
  const labelById = new Map<string, string>();
  for (const c of catParts) {
    labelById.set(c.id, c.label);
    const seen = new Set<string>();
    for (const part of c.parts) {
      for (const w of part) {
        if (w.length < 4 || STOPWORDS.has(w)) continue;
        if (seen.has(w)) continue;
        seen.add(w);
        if (!tokenToCats.has(w)) tokenToCats.set(w, new Set());
        tokenToCats.get(w)!.add(c.id);
      }
    }
  }

  const matchedCats = new Map<string, number>(); // catId → tokenIndex
  for (let i = 0; i < tokens.length; i++) {
    if (consumed[i]) continue;
    const tok = tokens[i];
    if (STOPWORDS.has(tok)) continue;
    for (const [word, cats] of tokenToCats) {
      if (cats.size !== 1) continue; // csak egyértelmű label-token számít
      if (matchesWithSuffix(tok, word)) {
        const only = [...cats][0];
        if (!matchedCats.has(only)) matchedCats.set(only, i);
      }
    }
  }
  if (matchedCats.size === 1) {
    const [id, idx] = [...matchedCats.entries()][0];
    consumed[idx] = true;
    return { id, label: labelById.get(id) ?? id, tokenIndex: idx };
  }
  return null; // 0 vagy >1 → nincs egyértelmű kategória
}

/**
 * Vészhelyzet-kulcsszó → kategória, MÉG a teljes „kat+hely" heurisztika és az
 * AI előtt. Ok: pár gyakori háztartási vészhelyzet (pl. „Csőtörés van, a
 * főbérlő nem veszi fel — ki segít?") szabad MONDATBAN jelenik meg, nem tiszta
 * „kat+hely" mintában, ezért a fenti token-elnyelős heurisztika null-t ad rá →
 * eddig ilyenkor az AI döntött, és a „cső" szót néha tévesen a Bádogos
 * (tetőfedés/ereszcsatorna) kategóriához társította a Víz-gáz szerelő helyett.
 * Csak akkor ad vissza találatot, ha a kategória TÉNYLEG szerepel a hívó
 * categories listájában (ne törjön el, ha egy kategória törlődik/átnevezik).
 */
function matchEmergencyKeyword(
  rawQuery: string,
  categories: HeuristicCategory[],
): { categoryId: string; explanation: string } | null {
  const folded = fold(rawQuery ?? "");
  const rules: { re: RegExp; categoryId: string; explanation: string }[] = [
    {
      re: /csotores|csorepedt|repedt cso|(cso|vizvezetek).{0,20}(szivarog|torott|repedt)|szivarog.{0,20}viz/,
      categoryId: "gazvez",
      explanation: "Csőtörésnél/vízszivárgásnál a víz-gáz szerelő segíthet.",
    },
  ];
  for (const r of rules) {
    if (r.re.test(folded) && categories.some((c) => c.id === r.categoryId)) {
      return { categoryId: r.categoryId, explanation: r.explanation };
    }
  }
  return null;
}

/**
 * A kliens-oldali heurisztikus előszűrő fő belépője.
 *
 * @returns HeuristicResult, ha a query TISZTA „kategória + helyszín" minta
 *          (minden érdemi tokent elnyelt kat/régió/stopszó), egyébként `null`
 *          (a hívó ilyenkor az AI-hoz fordul).
 */
export function heuristicParseSearch(
  rawQuery: string,
  country: string,
  categories: HeuristicCategory[],
): HeuristicResult | null {
  const q = (rawQuery ?? "").trim();
  if (q.length < 3 || q.length > 200) return null;

  // Vészhelyzet-kulcsszó akkor is talál, ha a mondat egyébként TERMÉSZETES
  // NYELV (a lenti token-elnyelős minta ilyenkor úgyis null-t adna) — ezért ez
  // FÜGGETLENÜL fut a token-hosszkorláttól/maradék-kaputól, csak régiót próbál
  // még hozzáilleszteni, ha van.
  const emergency = matchEmergencyKeyword(q, categories);
  if (emergency) {
    const emergencyTokens = tokenize(q);
    const emergencyConsumed = new Array<boolean>(emergencyTokens.length).fill(false);
    const emergencyRegion = matchRegion(country, emergencyTokens, emergencyConsumed);
    return {
      categoryId: emergency.categoryId,
      cantonCode: emergencyRegion?.code ?? null,
      keywords: "",
      explanation: emergency.explanation,
    };
  }

  const tokens = tokenize(q);
  if (tokens.length === 0 || tokens.length > 12) return null;
  const consumed = new Array<boolean>(tokens.length).fill(false);

  const region = matchRegion(country, tokens, consumed);
  const category = matchCategory(categories, tokens, consumed);

  // Stopszavak elnyelése (nem blokkolnak).
  for (let i = 0; i < tokens.length; i++) {
    if (!consumed[i] && STOPWORDS.has(tokens[i])) consumed[i] = true;
  }

  // Maradék-kapu: bármely el nem nyelt token → természetes nyelv → menjen AI-hoz.
  if (consumed.some((c) => !c)) return null;
  // Semmit nem ismertünk fel (csak stopszavak) → hagyd az AI-nak.
  if (!region && !category) return null;

  const explanation = buildExplanation(category, region);
  return {
    categoryId: category?.id ?? null,
    cantonCode: region?.code ?? null,
    keywords: "",
    explanation,
  };
}

function buildExplanation(
  category: { label: string } | null,
  region: { code: string; name: string } | null,
): string {
  if (category && region) {
    return `Beállítottam: ${category.label} · ${region.name} (${region.code}).`;
  }
  if (category) {
    return `Beállítottam a(z) „${category.label}" kategóriát.`;
  }
  if (region) {
    return `Szűrés erre: ${region.name} (${region.code}).`;
  }
  return "Beállítottam a szűrőket.";
}
