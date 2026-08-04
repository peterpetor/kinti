/**
 * semantic-rank.ts — a szemantikus (jelentés alapú) találatok rangsorolása.
 *
 * ⚠️ MIÉRT VAN EZ EGYÁLTALÁN?
 * A Vectorize-index, az embedding-készítés és a napi indexelő cron RÉGÓTA
 * kész volt, de a `semanticBusinessIds()` függvénynek NULLA hívója volt —
 * a felhasználó soha, semmilyen úton nem kapott jelentés alapú találatot.
 * A kereső AI-módja ugyanis SZŰRŐKET állít (kategória / régió / nyelv): ha az
 * AI a kérést egyik meglévő szakmára sem tudta ráhúzni, a felhasználó nem
 * „gyengébb", hanem NULLA találatot kapott. Ez a modul ezt a lyukat tömi be.
 *
 * ⚠️ Ez a fájl TISZTA (nincs D1, nincs hálózat, nincs AI) — a rangsor-szabályok
 * így unit-tesztelhetők. A beszerzés a route dolga.
 */

import { extractContactFromBlurb } from "./contact-links";
import type { ListBusiness } from "./types";

/** Egy nyers találat a vektor-indexből. */
export interface SzemantikusTalalat {
  id: string;
  /** Koszinusz-hasonlóság (0–1). */
  score: number;
}

export interface RangsoroltTalalat {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string | null;
  canton: string | null;
  score: number;
  /** Van-e BÁRMILYEN elérhetősége (telefon / weboldal / e-mail). */
  elerheto: boolean;
}

/**
 * Abszolút alsó pont-küszöb.
 *
 * ⚠️ A vektor-kereső MINDIG ad vissza `topK` találatot, akkor is, ha a kérésnek
 * semmi köze a szaknévsorhoz („milyen idő lesz holnap"). Küszöb nélkül a
 * felhasználó magabiztosan tálalt, teljesen oda nem illő céglistát kapna —
 * ami rosszabb, mint a nulla találat, mert elhiszi.
 *
 * ⚠️⚠️ MÉRT ÉRTÉK, NEM TIPP (2026-08-05, éles index, 2251 vektor, bge-m3).
 * Az első változatban 0,55 volt — tippelve —, és ez NÉMÁN levágta a valódi
 * találatokat is. A mérés (a végpont `Bearer <CRON_SECRET>`-es diagnosztikája):
 *
 *   ZAJ  „milyen idő lesz holnap"        → legjobb 0,4197
 *   ZAJ  „asdfgh qwerty zxcvb"           → legjobb 0,4236
 *   VALÓS „kinek tudom levágatni a hajam" → 0,5284 … a CH-beli fodrászok 0,4927–0,5011
 *   VALÓS „fáj a fogam, kihez menjek"     → 0,5584 (fogorvos)
 *   VALÓS „magyar fodrász"                → 0,5773
 *   VALÓS „…német adóbevallásomban"       → 0,6403 (adótanácsadók)
 *   VALÓS „hol kapok magyar kolbászt"     → 0,6799 (magyar boltok)
 *
 * A zaj plafonja ~0,424, a leggyengébb VALÓDI találat 0,4927. A küszöb a kettő
 * közé kerül, a valós oldalhoz közelebb. ⚠️ Ha az embedding-modell vagy az
 * indexelt szöveg változik, EZT ÚJRA KELL MÉRNI — egy elcsúszott küszöb némán
 * nullázza a funkciót (pontosan ez történt).
 */
export const MIN_PONT = 0.48;

/**
 * A legjobb találathoz képest ekkora esésig tartjuk meg a többit.
 *
 * ⚠️ Az abszolút küszöb önmagában kevés: ha a legjobb 0,86, akkor egy 0,57-es
 * tétel már nem „majdnem olyan jó", csak épp átcsúszott a padlón. A relatív
 * sáv tartja együtt a listát.
 */
export const RELATIV_SAV = 0.12;

/** Ennél többet nem mutatunk — a kereső alatti lenyíló nem eredmény-oldal. */
export const MAX_TALALAT = 6;

/**
 * Holtverseny-sáv: ekkora pont-különbségen belül a találatokat egyenrangúnak
 * tekintjük, és köztük az ELÉRHETŐSÉG dönt.
 *
 * ⚠️ Ugyanaz a szabály, mint a szaknévsor-lista rendezésében: a mért tölcsérben
 * a szakadék a kapcsolatfelvételnél van, és a szaknévsor ~12%-ának SEMMILYEN
 * elérhetősége nincs. Egy hajszállal jobb pontszámú zsákutcát fölétenni egy
 * hívható cégnek rossz csere.
 */
export const HOLTVERSENY_SAV = 0.03;

/** Van-e a tételnek bármilyen elérhetősége (a lista-vetület mezőiből). */
export function elerhetoE(b: Pick<ListBusiness, "hasPhone" | "blurb">): boolean {
  if (b.hasPhone) return true;
  // ⚠️ A weboldal/e-mail a leírás VÉGÉBE van fűzve (` · ` elválasztóval, sőt
  // 35 sornál a leírás HELYETT) — a kanonikus felismerő a contact-links.ts.
  // Saját mintát NE írj ide: a két oldal némán elcsúszna egymástól.
  const c = extractContactFromBlurb(b.blurb);
  return !!(c.website || c.email);
}

/**
 * Nyers vektor-találatokból megjeleníthető, rangsorolt lista.
 *
 * @param talalatok a vektor-index találatai (pont szerint bármilyen sorrendben)
 * @param lista     a publikus vállalkozás-lista (gyorsítótárból — NEM olvas D1-et)
 * @param orszag    a KÉRT ország; kizárólag az ide tartozó tételek maradnak
 *
 * ⚠️ AZ ORSZÁG-SZŰRÉS SZIGORÚ EGYENLŐSÉG, nincs „ha nem stimmel, akkor
 * alapértelmezett" ág. A hallgatólagos ország-visszaesés az app legdrágább
 * hibaosztálya volt (angliai keresésre svájci tartalom).
 */
export function rangsorolSzemantikus(
  talalatok: SzemantikusTalalat[],
  lista: ListBusiness[],
  orszag: string,
  max: number = MAX_TALALAT,
): RangsoroltTalalat[] {
  if (talalatok.length === 0) return [];

  const szerint = new Map(lista.map((b) => [b.id, b]));
  const nyers: RangsoroltTalalat[] = [];

  for (const t of talalatok) {
    if (!Number.isFinite(t.score) || t.score < MIN_PONT) continue;
    const b = szerint.get(t.id);
    // Hiányzó id = a cég azóta rejtett/törölt lett, VAGY más országban van.
    // A vektor-index nem tud a rejtésről; a publikus lista viszont igen —
    // ezért az EGYETLEN láthatósági forrás itt a lista, nem az index.
    if (!b || b.country !== orszag) continue;
    nyers.push({
      id: b.id,
      name: b.name,
      categoryId: b.categoryId,
      categoryLabel: b.categoryLabel,
      canton: b.canton,
      score: t.score,
      elerheto: elerhetoE(b),
    });
  }
  if (nyers.length === 0) return [];

  const legjobb = Math.max(...nyers.map((x) => x.score));
  const megmarad = nyers.filter((x) => x.score >= legjobb - RELATIV_SAV);

  // Sáv szerint egyenrangú → az elérhető megy előre; azon belül a jobb pont.
  const sav = (s: number) => Math.round(s / HOLTVERSENY_SAV);
  megmarad.sort(
    (a, b) =>
      sav(b.score) - sav(a.score) ||
      Number(b.elerheto) - Number(a.elerheto) ||
      b.score - a.score ||
      a.id.localeCompare(b.id),
  );

  return megmarad.slice(0, Math.max(1, max));
}
