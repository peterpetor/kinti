/**
 * external-job-url.ts — STABIL azonosító kulcs egy külső álláshirdetés URL-jéből.
 *
 * ⚠️ MIÉRT KELL: az `external_jobs` tábla eredetileg a teljes `source_url`-re
 * volt egyedi (`ON CONFLICT(source_url)`). Csakhogy MINDKÉT nagy aggregátor
 * KÉRÉSENKÉNT ÚJ, követő-paraméteres URL-t ad UGYANARRA az állásra:
 *
 *   Jooble  …/desc/5648897931892607810?ckey=Warehouse&elckey=7475792915537581327
 *   Jooble  …/desc/5648897931892607810?ckey=Cleaner  &elckey=6804464727526641248
 *   Adzuna  …/land/ad/5809309067?se=9NEF…&utm_medium=api&v=DE43B0CE…
 *
 * Az `elckey`/`se`/`v` minden lekérésnél más, ezért az ütközés-feloldás SOHA nem
 * sült el: minden szinkron-futás ÚJRA beszúrta ugyanazt az állást. Mérve
 * (2026-07-31): 7227 sorból csak 3294 volt egyedi — az Adzuna-sorok 69%-a, a
 * Jooble-sorok 77%-a duplikátum. A felhasználó ugyanazt a hirdetést akár 23×
 * látta a listában. A job-room (SECO) forrás tiszta volt: az közvetlen
 * munkáltatói URL-t ad, query string nélkül — ez erősíti meg a diagnózist.
 *
 * A kulcs ezért: HOSZTNÉV + ÚTVONAL, query string és fragment NÉLKÜL.
 *
 * ⚠️ BIZTONSÁGI ELLENŐRZÉS, amit a bevezetés előtt lefuttattam: az útvonal
 * FINOMABB bontású, mint a cím+cég páros (Adzuna: 2942 egyedi útvonal vs 1776
 * egyedi cím+cég), tehát a kulcs NEM olvaszt össze különböző állásokat — csak
 * ugyanannak a hirdetésnek a követő-változatait. Ha valaha olyan forrás jön,
 * amelyik az állás azonosítóját a QUERY-ben adja (`?id=123`), annál ez a kulcs
 * mindent egyetlen sorra vonna össze — ezért a szinkron a ténylegesen beírt,
 * EGYEDI darabszámot jelenti vissza, hogy az összeomlás azonnal látszódjon.
 */

/**
 * Stabil dedup-kulcs: `hosztnév/útvonal` (kisbetűs, `www.` és záró `/` nélkül).
 * Nem parse-olható bemenetnél a nyers (trimmelt) string a kulcs — sort SOHA nem
 * dobunk el csak azért, mert az URL szokatlan.
 *
 * ⚠️ A 0142 migráció SQL-je ugyanezt az alakot állítja elő string-műveletekkel a
 * meglévő sorokra. A kettőnek KARAKTERRE egyeznie kell (ezért kisbetűs az EGÉSZ
 * kulcs, nem csak a hosztnév) — különben a visszatöltött sor nem találkozna a
 * következő szinkron beszúrásával, és a duplikátum újratermelődne.
 */
export function externalJobDedupeKey(sourceUrl: string | null | undefined): string {
  const raw = (sourceUrl ?? "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./i, "");
    const path = u.pathname.replace(/\/+$/, "");
    return `${host}${path}`.toLowerCase();
  } catch {
    // Séma nélküli/szokatlan bemenet: ugyanazokat a vágásokat végezzük el, mint
    // a migráció ELSE-ága, hogy a két oldal itt se térjen el.
    return raw.split("#")[0].split("?")[0].replace(/\/+$/, "").toLowerCase();
  }
}

/**
 * Egy köteg hirdetés szűkítése dedup-kulcs szerint, az ELSŐ előfordulást tartva.
 *
 * ⚠️ Az „első nyer" szándékos: a kategória a KERESŐSZÓBÓL származik, és a Jooble
 * ugyanazt az állást több kulcsszóra is visszaadja (egy Waffle House szakács
 * „egészségügy" és „takarítás" alatt is előjött). Egyik keresőszó sem
 * megbízhatóbb a másiknál, de a STABIL választás igen: így a hirdetés nem
 * ugrál kategóriák között két látogatás vagy két szinkron-futás között.
 */
export function dedupeByKey<T extends { sourceUrl: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const key = externalJobDedupeKey(it.sourceUrl);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}
