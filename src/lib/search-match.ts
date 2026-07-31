/**
 * Szó-szintű kereső-illesztés a szaknévsorhoz.
 *
 * ⚠️ MIÉRT KELL: a kereső korábban EGYETLEN összefüggő részláncot keresett
 * (`blob.includes(needle)`). Emiatt a természetes többszavas lekérdezések
 * NÉMÁN nullát adtak — mérve, 3 bécsi fodrászon:
 *
 *     "fodrász"        → 3 találat
 *     "fodrász bécs"   → 1  (csak ahol véletlenül egymás mellett állt)
 *     "bécsi fodrász"  → 0  ← a természetes magyar szórend
 *     "fodrász wien"   → 0
 *
 * Ez az app legfőbb útvonala (találj magyar szakembert), tehát a legdrágább
 * helyen hibázott. A Google ezt alapból tudja: a lekérdezést szavakra bontja,
 * és MINDEN szónak szerepelnie kell — tetszőleges sorrendben.
 *
 * ⚠️ TOLDALÉK-TŰRÉS: a magyar ragoz („bécsi" ⊃ „bécs", „münchenben" ⊃
 * „münchen", „fodrászt" ⊃ „fodrász"). A lekérdezés szava tipikusan HOSSZABB,
 * mint a tárolt tő — ezért ha nincs pontos találat, a szó VÉGÉT rövidítjük
 * (legfeljebb `MIN_STEM`-ig). Fordítva nem csinálunk semmit: a tő bővítése
 * találgatás lenne.
 */

/** Ennél rövidebbre nem vágunk vissza — különben zajos találatok jönnének. */
export const MIN_STEM = 4;

/**
 * Legfeljebb ennyi karaktert vágunk le a szó végéről.
 *
 * ⚠️ EZ A KORLÁT NEM DÍSZ. Nélküle a csonkolás átlő a célon: a „becsületes"
 * szót visszavágná „bécs"-ig, és minden bécsi céget találatnak jelezne. A
 * magyar toldalékok jellemzően 1–4 karakteresek („-i", „-ban", „-ben", „-nál",
 * „-t"), tehát 4 fölé menni már nem ragozás-tűrés, hanem találgatás.
 * Ellenőrzött esetek: bécsi→bécs (1), münchenben→münchen (3), fodrászt→fodrász (1).
 */
export const MAX_TRIM = 4;

/** A lekérdezés szavakra bontása (a fold már megtörtént a hívóban). */
export function searchTokens(foldedQuery: string): string[] {
  return foldedQuery.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/**
 * Illeszkedik-e EGY szó a (már foldolt) blobra — toldalék-tűréssel.
 * Rövid szavaknál (< MIN_STEM) nincs csonkolás, csak pontos részlánc.
 */
export function tokenMatches(blob: string, token: string): boolean {
  if (!token) return true;
  if (blob.includes(token)) return true;
  // „bécsi" → „bécs", „münchenben" → „münchen", „fodrászt" → „fodrász".
  // A csonkolás KÉT korlát közül a szigorúbbig megy: MIN_STEM (abszolút alsó
  // hossz) és MAX_TRIM (mennyit szabad egyáltalán levágni).
  const floor = Math.max(MIN_STEM, token.length - MAX_TRIM);
  for (let len = token.length - 1; len >= floor; len--) {
    if (blob.includes(token.slice(0, len))) return true;
  }
  return false;
}

/**
 * A teljes lekérdezés illeszkedik-e: MINDEN szónak szerepelnie kell
 * (AND-kapcsolat), tetszőleges sorrendben és pozícióban.
 *
 * @param blob         a cég előszámolt, foldolt kereső-blobja
 * @param foldedQuery  a foldolt keresőszöveg
 */
export function matchesSearchQuery(blob: string, foldedQuery: string): boolean {
  const tokens = searchTokens(foldedQuery);
  if (tokens.length === 0) return true;
  return tokens.every((t) => tokenMatches(blob, t));
}

export interface RelaxedSearch {
  /** Az elhagyott szó — EZT írjuk ki a felhasználónak, hogy értse, mi történt. */
  dropped: string;
  /** A megmaradt szavak (foldolt alak). */
  kept: string[];
  /** Hány találatot ad a lazított keresés. */
  count: number;
}

/**
 * Lekérdezés-lazítás nulla találat esetén — „sosem üres kéz".
 *
 * ⚠️ MIÉRT: a szaknévsor RITKA (2248 tétel, 6 ország). Egy teljesen jogos
 * keresés — „fogorvos bécs" — simán adhat nullát pusztán azért, mert abban a
 * városban nincs magyar fogorvos. A puszta „nincs találat" viszont eltitkolja,
 * hogy a MÁSIK városban van. A Google ilyenkor elejt egy szót és szól róla;
 * ezt vesszük át.
 *
 * ⚠️⚠️ AMIT NEM SZABAD: pusztán a „legtöbb találat" elvén választani, hogy mit
 * ejtsünk el. Az első változatom ezt tette, és a „fogorvos bécs"-ből a
 * SZAKMÁT dobta el (mert bécsi fodrászból több van, mint londoni fogorvosból)
 * — vagyis fodrászokat ajánlott annak, aki fogorvost keres. Használhatatlan.
 *
 * A helyes elv: a SZAKMA a kérés lényege, a helynév csak szűkítés. Ezért a
 * kategórianevekre illeszkedő szavakat VÉDJÜK, és elsősorban a nem-védett
 * (jellemzően helynév) szót ejtjük el. Ha csak védett szó van, akkor esünk
 * vissza a találatszám szerinti választásra.
 *
 * @param protectedTokens foldolt kategórianevek/szakmaszavak — ezeket kíméljük
 * @returns null, ha egy szavas a keresés, vagy semmilyen elhagyás nem segít.
 */
export function relaxSearchQuery(
  blobs: string[],
  foldedQuery: string,
  protectedTokens: readonly string[] = [],
): RelaxedSearch | null {
  const tokens = searchTokens(foldedQuery);
  if (tokens.length < 2) return null;

  // Egy szó „védett", ha egy kategórianév szavára illik (pl. „fogorvos").
  const isProtected = (t: string) =>
    protectedTokens.some((p) => p === t || tokenMatches(p, t) || tokenMatches(t, p));

  const candidates: { rec: RelaxedSearch; guarded: boolean }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const kept = tokens.filter((_, j) => j !== i);
    const count = blobs.reduce((n, b) => n + (kept.every((t) => tokenMatches(b, t)) ? 1 : 0), 0);
    if (count === 0) continue;
    candidates.push({ rec: { dropped: tokens[i], kept, count }, guarded: isProtected(tokens[i]) });
  }
  if (candidates.length === 0) return null;

  // ELŐSZÖR a nem-védett szavak közül választunk (a helynevet ejtjük),
  // és csak azon belül nézzük a találatszámot.
  const pool = candidates.some((c) => !c.guarded)
    ? candidates.filter((c) => !c.guarded)
    : candidates;

  return pool.reduce((best, c) => (c.rec.count > best.rec.count ? c : best)).rec;
}
