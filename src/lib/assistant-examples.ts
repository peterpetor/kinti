/**
 * assistant-examples.ts — a Kinti Asszisztens példakérdései ORSZÁGONKÉNT.
 *
 * ⚠️ VALÓS HIBÁBÓL SZÜLETETT. A példák korábban EGYETLEN, ország-független
 * tömbben álltak, és az első példa ez volt:
 *
 *     „Csőtörés van, a főbérlő nem veszi fel — ki segít?"
 *
 * A `gazvez` (víz-gáz szerelő) kategóriában viszont ANGLIÁBAN, SPANYOL-
 * ORSZÁGBAN és HOLLANDIÁBAN NULLA vállalkozásunk van (2026-08-04-i mérés:
 * AT 5, DE 2, CH 1, GB/ES/NL 0). A heurisztika ott is FELISMERI a kérdést és
 * `gazvez`-t ad — csak nincs mögötte egyetlen szakember sem, cikk sem illik rá,
 * így a válasz: „Erre így nem találtam pontos találatot." Az app tehát maga
 * ajánlott egy kérdést, amire a saját adata nem tud válaszolni.
 *
 * SZABÁLY: példaként CSAK olyat kínálunk, ami MÉRHETŐEN válaszolható az adott
 * országban — vagy a szerver-heurisztika determinisztikusan felismeri a
 * kategóriát ÉS van benne elég tételünk, vagy a kérdés talál útmutató-cikket.
 *
 * ⚠️ ÚJ PÉLDA FELVÉTELE ELŐTT MÉRJ, ne tippelj. Ugyanaz a kérdés országonként
 * MÁST ad: a „Hogyan működik az adóbevallás?" Svájcban talál cikket (a címben
 * ott van az „adóbevallás" szó), Ausztriában és Németországban NEM — azok a
 * cikkek a helyi kifejezést használják (Lohnsteuer, Anmeldung). A tesztek
 * ezért minden példát a VALÓDI pontozóval és heurisztikával ellenőriznek.
 *
 * Mért kategória-lefedettség (2026-08-04, hidden=0 + jóváhagyott):
 *   CH orvos 72 · ügyvéd 38 · fogorvos 33
 *   AT pszichológus 80 · ügyvéd 57 · orvos 51
 *   DE orvos 178 · étterem 93 · fogorvos 85
 *   NL étterem 11 · fogorvos 10 · élelmiszer 9 · fodrász 8
 *   GB magyar-közösség 37 · pszichológus 28 · élelmiszer 18 · étterem 14 · fogorvos 10
 *   ES fordító 15 · ingatlan 7 · étterem 7 · ügyvéd 6 · cukrász 6
 */

export interface AssistantExample {
  /** A példakérdés, ahogy a felhasználó látja. */
  text: string;
  /**
   * Ha SZAKEMBER-kérdés: a kategória, amit a heurisztikának fel kell ismernie,
   * és amiben van adatunk. Útmutató-kérdésnél `null`.
   */
  categoryId: string | null;
}

export const ASSISTANT_EXAMPLES: Record<string, AssistantExample[]> = {
  CH: [
    { text: "Magyar orvost keresek", categoryId: "orvos" },
    { text: "Hogyan működik az adóbevallás?", categoryId: null },
    { text: "Mennyi időm van bejelentkezni?", categoryId: null },
  ],
  AT: [
    { text: "Magyar pszichológust keresek", categoryId: "pszichologus" },
    { text: "Hogyan jelentkezem be a Meldeamtnál?", categoryId: null },
    { text: "Hogyan igényeljem a családi pótlékot?", categoryId: null },
  ],
  DE: [
    { text: "Magyar orvost keresek", categoryId: "orvos" },
    { text: "Mi az az Anmeldung?", categoryId: null },
    { text: "Mi az a Kindergeld?", categoryId: null },
  ],
  NL: [
    { text: "Magyar fogorvost keresek", categoryId: "fogorvos" },
    { text: "Mi az a BSN?", categoryId: null },
    { text: "Mi az a zorgverzekering?", categoryId: null },
  ],
  GB: [
    { text: "Magyar pszichológust keresek", categoryId: "pszichologus" },
    { text: "Hogyan igényeljek National Insurance számot?", categoryId: null },
    { text: "Mi az a Council Tax?", categoryId: null },
  ],
  ES: [
    { text: "Magyar fordítót keresek", categoryId: "fordito" },
    { text: "Mi az a NIE?", categoryId: null },
    { text: "Hogyan működik az empadronamiento?", categoryId: null },
  ],
};

/**
 * Az ország példakérdései.
 *
 * ⚠️ Ismeretlen országra ÜRES lista — NEM esünk vissza a svájci példákra.
 * Üres listánál a felület egyszerűen nem kínál példát; ez jobb, mint olyat
 * ajánlani, amire nem tudunk válaszolni (pontosan ez volt az eredeti hiba).
 */
export function assistantExamples(country: string): AssistantExample[] {
  return ASSISTANT_EXAMPLES[country] ?? [];
}
