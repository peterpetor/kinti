/**
 * quota-guard.ts — napi keret-őr a D1 olvasott sorokra.
 *
 * ⚠️ VALÓS KIESÉSBŐL SZÜLETETT (2026-08-04). A D1 napi olvasott-sor kerete
 * elfogyott (7,6 millió az 5 milliós keretből), és attól kezdve MINDEN
 * adatbázisból olvasó lap 500/503-at adott — a kezdőlap és a szaknévsor is.
 * A kiesés úgy derült ki, hogy a tulajdonos megnyitotta az oldalt.
 * Riasztás nem volt: a hibafigyelés (ERROR_WEBHOOK_URL) a KIVÉTELEKET
 * továbbítja, a lassan elfogyó keretet nem látja.
 *
 * ⚠️ MIÉRT SAJÁT MÉRÉS, ÉS NEM A CLOUDFLARE API?
 * A tényleges `rows_read_24h` csak a Cloudflare Analytics API-ból kérdezhető
 * le, amihez külön API-token kellene (új titok, új lejárat, új hibalehetőség).
 * A fogyasztás viszont NÉHÁNY ismert, drága lekérdezésből áll — azokat meg
 * tudjuk számolni ott, ahol ténylegesen D1-re mennek. Ez kevesebb mozgó
 * alkatrész, és pont azt méri, ami a kiesést okozta.
 *
 * A becslés SZÁNDÉKOSAN felfelé kerekít: inkább szóljon feleslegesen, mint
 * hogy elhallgasson egy közelgő kiesést.
 */

/**
 * A napi sor-keret, amihez mérünk.
 *
 * ⚠️ EZ MOST ÖNKÉNT VÁLLALT KERET, NEM A CLOUDFLARE KEMÉNY LIMITJE.
 * A kiesés idején az ingyenes csomag napi 5 millió olvasott soránál jártunk;
 * azóta a fizetős Workers-csomag él, ahol a keret havi 25 milliárd sor (kb.
 * napi 833 millió), és túllépéskor NEM áll le semmi — csak számláznak
 * (~0,001 USD / millió sor).
 *
 * A régi értéket SZÁNDÉKOSAN tartjuk meg költség-küszöbként. A javított,
 * 30 perces gyorsítótár mellett a tényleges fogyasztás ~700 ezer sor/nap
 * (14%), tehát ez a szám nem szólal meg üzemszerűen — viszont azonnal
 * megszólal, ha a fogyasztás hétszeresére nő. Ez pedig mindig ugyanazt
 * jelenti: valahol elromlott a gyorsítótárazás, vagy új drága lekérdezés
 * került a fő útra. Pont ezt akarjuk időben megtudni, nem a számlából.
 */
export const D1_NAPI_SOR_KERET = 5_000_000;

/** Ennyi százalék fölött riasztunk. */
export const RIASZTAS_KUSZOB = 0.7;

/**
 * A drága lekérdezések becsült sor-költsége.
 *
 * ⚠️ MÉRT ÉRTÉKEK, nem tippek (2026-08-04, `--json` kimenet `rows_read` mezője).
 * Ha a lekérdezés vagy az adatmennyiség változik, MÉRD ÚJRA — egy elavult
 * szorzó csendben alábecsüli a fogyasztást, ami pont a riasztás értelmét veszi el.
 */
export const SOR_KOLTSEG: Record<string, number> = {
  /** A teljes vállalkozás-lista (kezdőlap + szaknévsor + /api/businesses/list). */
  "biz-list": 4815,
  /** A kategória-tábla. */
  "categories": 249,
};

/** Az esemény-név, amivel a `feature_usage_daily`-be írjuk. */
export function kvotaEsemeny(kulcs: string): string {
  return `quota:${kulcs}`;
}

export interface KvotaAllapot {
  /** Becsült olvasott sor ma. */
  becsultSor: number;
  /** A keret hány százaléka (0–1+). */
  arany: number;
  /** Riasztási küszöb fölött van-e. */
  riasztando: boolean;
  /** Lekérdezésenkénti bontás — hogy tudni lehessen, MI eszi a keretet. */
  bontas: { kulcs: string; futas: number; sor: number }[];
}

/**
 * A mai becsült fogyasztás a rögzített találatokból.
 * `sorok`: a `feature_usage_daily` mai `quota:*` sorai.
 */
export function kvotaAllapot(sorok: { event: string; count: number }[]): KvotaAllapot {
  const bontas: { kulcs: string; futas: number; sor: number }[] = [];
  let becsultSor = 0;
  for (const [kulcs, koltseg] of Object.entries(SOR_KOLTSEG)) {
    const futas = sorok.find((s) => s.event === kvotaEsemeny(kulcs))?.count ?? 0;
    if (futas === 0) continue;
    const sor = futas * koltseg;
    becsultSor += sor;
    bontas.push({ kulcs, futas, sor });
  }
  bontas.sort((a, b) => b.sor - a.sor);
  const arany = becsultSor / D1_NAPI_SOR_KERET;
  return { becsultSor, arany, riasztando: arany >= RIASZTAS_KUSZOB, bontas };
}

/** Emberi összefoglaló a riasztáshoz. */
export function kvotaUzenet(a: KvotaAllapot): string {
  const szazalek = Math.round(a.arany * 100);
  const reszletek = a.bontas.map((b) => `${b.kulcs}: ${b.futas}× ≈ ${szam(b.sor)} sor`).join(" · ");
  return `D1 napi keret: ~${szam(a.becsultSor)} / ${szam(D1_NAPI_SOR_KERET)} sor (${szazalek}%). ${reszletek}`;
}

/**
 * ⚠️ Determinisztikus formázás — NEM `toLocaleString`. A prerender-környezetben
 * nincs teljes ICU, ott más eredményt adna (ez okozott már hidratálási törést
 * a /berkalkulator lapon). Riasztás-szövegben ugyan nem törne el semmit, de a
 * szabály egységes: SSR-t is látó kódban nincs locale-függő formázás.
 */
function szam(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** A riasztás naponta EGYSZER menjen ki — az esemény jelzi, hogy ma már szóltunk. */
export const RIASZTAS_JELZO = "quota:alerted";
