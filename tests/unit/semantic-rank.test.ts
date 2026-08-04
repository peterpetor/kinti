import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  HOLTVERSENY_SAV,
  MAX_TALALAT,
  MIN_PONT,
  RELATIV_SAV,
  elerhetoE,
  rangsorolSzemantikus,
  type SzemantikusTalalat,
} from "../../src/lib/semantic-rank";
import type { ListBusiness } from "../../src/lib/types";

/**
 * Jelentés alapú keresés — rangsorolás.
 *
 * ⚠️ A vektor-kereső MINDIG ad vissza `topK` találatot, akár van értelme, akár
 * nincs, és NEM tud a rejtésről meg az országokról. Vagyis a helyesség itt
 * teljes egészében a szűrésen múlik, nem az indexen. Ezért a tesztek a NÉMA
 * hibákra mennek: idegen ország beszivárgása, rejtett cég feltámadása, és a
 * „magabiztosan tálalt szemét" (küszöb nélküli találatok).
 */

function ceg(over: Partial<ListBusiness> & { id: string }): ListBusiness {
  return {
    id: over.id,
    name: over.name ?? `Cég ${over.id}`,
    categoryId: over.categoryId ?? "fodrasz",
    categoryLabel: over.categoryLabel ?? "Fodrász",
    rating: 0,
    reviews: 0,
    address: null,
    hasPhone: over.hasPhone ?? false,
    lat: null,
    lng: null,
    featured: false,
    verified: false,
    blurb: over.blurb ?? null,
    openText: null,
    workingHours: null,
    yearsHere: null,
    languages: [],
    photo: null,
    logoKey: null,
    country: over.country ?? "CH",
    canton: over.canton ?? null,
    kintiPassActive: false,
    kintiPassOffer: null,
    createdAt: null,
  } as ListBusiness;
}

const T = (id: string, score: number): SzemantikusTalalat => ({ id, score });

describe("elérhetőség felismerése", () => {
  it("telefon", () => {
    expect(elerhetoE({ hasPhone: true, blurb: null })).toBe(true);
  });

  it("weboldal a leírás VÉGÉN, protokoll nélkül", () => {
    // A seed-pipeline így fűzi hozzá — ez az alak a gyakori, nem a http://.
    expect(elerhetoE({ hasPhone: false, blurb: "Magyar fodrászat · maosz.org.uk" })).toBe(true);
  });

  it("weboldal a leírás HELYETT (elválasztó nélkül)", () => {
    // 35 sornál a leírás mezőbe CSAK a webcím került.
    expect(elerhetoE({ hasPhone: false, blurb: "www.example.at" })).toBe(true);
  });

  it("e-mail a leírás végén", () => {
    expect(elerhetoE({ hasPhone: false, blurb: "Ügyvédi iroda · info@pelda.de" })).toBe(true);
  });

  it("zsákutca: se telefon, se web, se e-mail", () => {
    expect(elerhetoE({ hasPhone: false, blurb: "Magyar egyesület, 1998 óta" })).toBe(false);
  });
});

describe("rangsorolás — szűrés", () => {
  const lista = [ceg({ id: "ch1" }), ceg({ id: "gb1", country: "GB" })];

  it("üres bemenetre üres", () => {
    expect(rangsorolSzemantikus([], lista, "CH")).toEqual([]);
  });

  it("⚠️ IDEGEN ORSZÁG NEM SZIVÁROGHAT BE", () => {
    // Az index minden országot egyben tárol; ha ez elbukik, az angliai
    // keresésre svájci cég jön — ez az app legdrágább hibaosztálya.
    const r = rangsorolSzemantikus([T("gb1", 0.9), T("ch1", 0.88)], lista, "GB");
    expect(r.map((x) => x.id)).toEqual(["gb1"]);
  });

  it("ismeretlen id-t (rejtett/törölt cég) eldob", () => {
    // A vektor-index nem tud a rejtésről; az EGYETLEN láthatósági forrás a lista.
    const r = rangsorolSzemantikus([T("regen-torolt", 0.95), T("ch1", 0.9)], lista, "CH");
    expect(r.map((x) => x.id)).toEqual(["ch1"]);
  });

  it("a küszöb alatti pontot eldobja (nem tálal szemetet)", () => {
    const r = rangsorolSzemantikus([T("ch1", MIN_PONT - 0.01)], lista, "CH");
    expect(r).toEqual([]);
  });

  it("a küszöbön lévő pont még bent van", () => {
    expect(rangsorolSzemantikus([T("ch1", MIN_PONT)], lista, "CH")).toHaveLength(1);
  });

  it("érvénytelen pontszámot (NaN) eldob", () => {
    expect(rangsorolSzemantikus([{ id: "ch1", score: NaN }], lista, "CH")).toEqual([]);
  });
});

describe("rangsorolás — sorrend", () => {
  it("a relatív sávon kívüli, gyengébb találatot levágja", () => {
    const lista = [ceg({ id: "a" }), ceg({ id: "b" })];
    // Mindkettő a padló FÖLÖTT van, de a második jóval a legjobb alatt.
    const r = rangsorolSzemantikus([T("a", 0.9), T("b", 0.9 - RELATIV_SAV - 0.01)], lista, "CH");
    expect(r.map((x) => x.id)).toEqual(["a"]);
  });

  it("holtversenyben az ELÉRHETŐ cég megy előre", () => {
    const lista = [
      ceg({ id: "zsakutca", hasPhone: false, blurb: "Egyesület" }),
      ceg({ id: "hivhato", hasPhone: true }),
    ];
    // A zsákutca pontszáma egy hajszállal jobb — de a sávon belül van.
    const r = rangsorolSzemantikus(
      [T("zsakutca", 0.9), T("hivhato", 0.9 - HOLTVERSENY_SAV / 3)],
      lista,
      "CH",
    );
    expect(r.map((x) => x.id)).toEqual(["hivhato", "zsakutca"]);
  });

  it("⚠️ ÉRDEMBEN jobb pontszámot az elérhetőség NEM előz meg", () => {
    // Ha ez elbukik, a rangsor már nem a jelentésről szól: egy odaillő, de
    // telefon nélküli találat mögé kerülne egy oda nem illő, hívható cég.
    const lista = [
      ceg({ id: "talalo", hasPhone: false, blurb: "Egyesület" }),
      ceg({ id: "hivhato", hasPhone: true }),
    ];
    const r = rangsorolSzemantikus(
      [T("talalo", 0.92), T("hivhato", 0.92 - HOLTVERSENY_SAV * 2)],
      lista,
      "CH",
    );
    expect(r[0].id).toBe("talalo");
  });

  it("azonos pont + azonos elérhetőség → determinisztikus sorrend", () => {
    // Enélkül két futás más sorrendet adhatna ugyanarra a kérdésre.
    const lista = [ceg({ id: "b2", hasPhone: true }), ceg({ id: "a1", hasPhone: true })];
    const r = rangsorolSzemantikus([T("b2", 0.8), T("a1", 0.8)], lista, "CH");
    expect(r.map((x) => x.id)).toEqual(["a1", "b2"]);
  });

  it("legfeljebb MAX_TALALAT elemet ad vissza", () => {
    const lista = Array.from({ length: 20 }, (_, i) => ceg({ id: `c${i}`, hasPhone: true }));
    const r = rangsorolSzemantikus(
      lista.map((b, i) => T(b.id, 0.9 - i * 0.001)),
      lista,
      "CH",
    );
    expect(r).toHaveLength(MAX_TALALAT);
  });
});

describe("jelentés alapú keresés — bekötés", () => {
  const routeSrc = readFileSync(
    resolve(__dirname, "../../src/app/api/ai/semantic-search/route.ts"),
    "utf8",
  );

  it("⚠️ IP-korlát van, ÉS a drága hívás ELŐTT foglal", () => {
    // A tulajdonos kikötése: az AI-utak IP-korlátja marad. A sorrend sem
    // mindegy — ha a naplózás az embedding UTÁN lenne, párhuzamos kérések
    // mind átcsúsznának a számláló-ellenőrzésen.
    const rl = routeSrc.indexOf('checkAiRateLimit("semantic-search"');
    const log = routeSrc.indexOf('logAiRateLimit("semantic-search"');
    // A hívás neve változhat (Diag-változat), a SORREND nem — ezért mintára megyünk.
    const ai = routeSrc.search(/semanticBusinessIds\w*\(/);
    expect(rl).toBeGreaterThan(-1);
    expect(log).toBeGreaterThan(rl);
    expect(ai).toBeGreaterThan(log);
  });

  it("⚠️ NEM nyit új D1-olvasást: a lista a gyorsítótárból jön", () => {
    // A 2026-08-04-i kiesést épp a lista-lekérdezés okozta.
    expect(routeSrc).toContain("getBusinessesForList");
    expect(routeSrc).not.toMatch(/getDB\(\)|\.prepare\(/);
  });

  it("index nélkül nem éget kvótát", () => {
    const idx = routeSrc.indexOf("getVectorize()");
    const rl = routeSrc.indexOf('checkAiRateLimit("semantic-search"');
    expect(idx).toBeGreaterThan(-1);
    expect(idx).toBeLessThan(rl);
  });

  it("az országot `isValidCountry` dönti el, nem kézi lista", () => {
    expect(routeSrc).toContain("isValidCountry");
  });

  it("edge runtime (enélkül a deploy némán befagy)", () => {
    expect(routeSrc).toContain('runtime = "edge"');
  });
});

describe("jelentés alapú keresés — kliens", () => {
  const barSrc = readFileSync(
    resolve(__dirname, "../../src/components/views/smart-search-bar.tsx"),
    "utf8",
  );

  it("csak akkor kér jelentés-találatot, ha nem volt ráhúzható szakma", () => {
    // Enélkül minden AI-keresés két hívást égetne, holott a szűrők önmagukban
    // már megoldották a kérést.
    expect(barSrc).toMatch(/if \(!data\.categoryId\) await keressJelentesAlapjan/);
  });

  it("a tartalék-út hibája nem ír hibaüzenetet a felhasználónak", () => {
    const fn = barSrc.slice(
      barSrc.indexOf("async function keressJelentesAlapjan"),
      barSrc.indexOf("async function runAi"),
    );
    expect(fn.length).toBeGreaterThan(0);
    expect(fn).not.toContain("setError");
  });
});
