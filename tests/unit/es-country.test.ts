import { describe, it, expect } from "vitest";
import { isFeatureAvailable, ES_ALLOWED_FEATURES } from "@/lib/feature-availability";
import {
  COUNTRIES,
  countryLocative,
  countryAdjective,
  countryIllative,
  countrySuperessive,
  countryResidentialAdjective,
  courseLanguageName,
  regionWord,
  isValidCountry,
} from "@/lib/countries";
import { getRegions, regionLabel } from "@/lib/regions";
import { isInCountryCoord } from "@/lib/business";
import { countryExamples, currencySymbol } from "@/lib/country-examples";
import { getGuides } from "@/lib/guides";
import { getChecklists } from "@/lib/admin-checklists";
import { getOfficialLinks, getConsulate, getEmergencyNumbers } from "@/lib/official-links";
import { GUIDE_COMPARISONS } from "@/lib/guide-comparisons";
import { nearestEsRegion, ES_REGION_POINTS } from "@/lib/es-points";
import { getRentConfig, regionsFor } from "@/lib/rent-cost";
import { getFlightConfig } from "@/lib/flights";
import { evaluatePermit, PERMITS } from "@/lib/permit-wizard";
import { ES_QUIZ_BANK, ES_QUIZ_CATEGORY_META } from "@/lib/quiz-bank-es";
import {
  isBudgetCountry,
  budgetCurrency,
  childBenefit,
  COST_BASELINE,
} from "@/lib/budget-plan";
import { BUDGET_LANDINGS, budgetLandingBySlug } from "@/lib/budget-landing";

describe("ES (Spanyolország) mint ország", () => {
  it("szerepel a COUNTRIES listában és érvényes", () => {
    expect(COUNTRIES.some((c) => c.code === "ES")).toBe(true);
    expect(isValidCountry("ES")).toBe(true);
  });

  /**
   * ⚠️ Ez a legfontosabb regresszió-őr új ország felvételekor: a countries.ts
   * MINDEN helperének `default` ága SVÁJCI. Ha egy ág kimarad, a spanyolországi
   * felhasználó „Svájcban", „svájci", „svájci német" feliratokat lát — némán,
   * hibaüzenet nélkül. Ld. [[binary-country-fallthrough]].
   */
  it("MINDEN grammatikai helper explicit ES-ágat ad (nem esik a svájci default-ra)", () => {
    expect(countryLocative("ES")).toBe("Spanyolországban");
    expect(countrySuperessive("ES")).toBe("Spanyolországon");
    expect(countryAdjective("ES")).toBe("spanyol");
    expect(countryIllative("ES")).toBe("Spanyolországba");
    expect(countryResidentialAdjective("ES")).toBe("spanyolországi");
    expect(courseLanguageName("ES")).toBe("spanyol");
    expect(regionWord("ES")).toBe("régió");
    for (const fn of [
      countryLocative,
      countrySuperessive,
      countryAdjective,
      countryIllative,
      countryResidentialAdjective,
      courseLanguageName,
    ]) {
      expect(fn("ES").toLowerCase()).not.toContain("svájc");
      expect(fn("ES").toLowerCase()).not.toContain("német");
    }
  });

  /**
   * ⚠️ A régió-szint magyar neve KÉT helyen él: `regionWord` (countries.ts) és
   * `regionLabel` (regions.ts). Külön modulban vannak szándékosan — a
   * countries.ts-t szinte minden oldal behúzza, a regions.ts viszont a teljes
   * régió-adatbázist is hozná —, ezért importtal nem, csak teszttel tartható
   * szinkronban. Ez a teszt élesben fogott hibát: az ES „tartomány" ÉS „régió"
   * volt egyszerre, attól függően, melyik függvényt hívta az adott képernyő.
   */
  it("⚠️ a régió-szint neve MINDEN országban EGYEZIK a két forrásban", () => {
    for (const c of COUNTRIES) {
      expect(regionWord(c.code), c.code).toBe(regionLabel(c.code));
    }
  });

  it("19 autonóm közösséget ad, ISO 3166-2:ES kódokkal", () => {
    const regions = getRegions("ES");
    expect(regions).toHaveLength(19); // 17 közösség + Ceuta + Melilla
    for (const code of ["MD", "CT", "AN", "VC", "IB", "CN", "PV", "CE", "ML"]) {
      expect(regions.map((r) => r.code)).toContain(code);
    }
    expect(regionLabel("ES")).toBe("régió");
  });

  it("a régió-aliasok feloldják a magyar közösség gócait", () => {
    const all = getRegions("ES").flatMap((r) => r.aliases ?? []);
    for (const place of [
      "madrid", "barcelona", "málaga", "malaga", "marbella", "alicante",
      "torrevieja", "benidorm", "mallorca", "tenerife", "gran canaria",
    ]) {
      expect(all, place).toContain(place);
    }
  });

  it("nincs alias-ütközés két közösség között (egyértelmű feloldás)", () => {
    const seen = new Map<string, string>();
    for (const r of getRegions("ES")) {
      for (const a of r.aliases ?? []) {
        const prev = seen.get(a);
        expect(prev, `"${a}": ${prev} ÉS ${r.code}`).toBeUndefined();
        seen.set(a, r.code);
      }
    }
  });
});

describe("ES engedélyező-lista (GB-modell)", () => {
  it("engedi a listán szereplő funkciókat", () => {
    for (const key of ES_ALLOWED_FEATURES) {
      expect(isFeatureAvailable(key, "ES"), key).toBe(true);
    }
  });

  /**
   * ⚠️ 2026-07-30: ez a lista KIÜRÜLT — a spanyol eszközkészlet teljes lett.
   * Sorrendben kikerült innen a „nyelvlecke", az „allampolgarsag" (CCSE-bank),
   * a „szolgaltato-valto", a „szakmai-szotar" és a „bussen" (DGT-sávok +
   * pronto pago). Az „akciok" nem elkészült, hanem MEGSZŰNT funkció — azt a
   * REMOVED_FEATURES zárja minden országban (ld. lentebb).
   *
   * A teszt ezért már nem egy kulcs-listát ellenőriz, hanem azt, hogy a
   * fail-closed modell ÉL: ami nincs az engedélyező-listán, az rejtve van.
   */
  it("⚠️ ami NINCS az engedélyező-listán, az REJTVE van (fail-closed)", () => {
    for (const key of ["valami-uj-eszkoz", "esemenyek", "telekocsi"]) {
      expect(isFeatureAvailable(key, "ES"), key).toBe(false);
    }
  });

  /**
   * ⚠️ Spanyolország EU-tag: Magyarország felé NINCS vámhatár. Egy
   * vám-kalkulátor itt nem csak felesleges, hanem félrevezető is lenne.
   */
  it("⚠️ a vám-kalkulátor REJTVE van (EU-tag, nincs vámhatár)", () => {
    expect(isFeatureAvailable("vam", "ES")).toBe(false);
  });

  it("ismeretlen kulcs ES-ben alapból REJTETT (fail-closed)", () => {
    expect(isFeatureAvailable("valami-uj-eszkoz", "ES")).toBe(false);
  });

  it("a többi ország viselkedése változatlan (nincs regresszió)", () => {
    expect(isFeatureAvailable("bussen", "CH")).toBe(true);
    expect(isFeatureAvailable("vam", "GB")).toBe(true);
    expect(isFeatureAvailable("vam", "DE")).toBe(false);
    expect(isFeatureAvailable("tudasbazis", "NL")).toBe(true);
  });
});

describe("ES tartalom-lefedettség", () => {
  it("a tudásbázis spanyol cikkeket ad, es- előtaggal", () => {
    const guides = getGuides("ES");
    expect(guides.length).toBeGreaterThanOrEqual(10);
    for (const g of guides) expect(g.slug.startsWith("es-"), g.slug).toBe(true);
    // A cita previa a vezető cikk — ez a spanyol ügyintézés kulcsa.
    expect(guides.map((g) => g.slug)).toContain("es-cita-previa");
  });

  it("minden ES-cikkhez tartozik legalább egy hivatalos forrás", () => {
    for (const g of getGuides("ES")) {
      expect(g.sources.length, g.slug).toBeGreaterThan(0);
      for (const src of g.sources) expect(src.url, g.slug).toMatch(/^https:\/\//);
    }
  });

  it("a csekklisták spanyolok, és mind ad forrást", () => {
    const lists = getChecklists("ES");
    expect(lists.length).toBeGreaterThanOrEqual(5);
    for (const c of lists) {
      expect(c.slug.startsWith("es-"), c.slug).toBe(true);
      expect(c.sources.length, c.slug).toBeGreaterThan(0);
    }
  });

  it("a hivatalos linkek a spanyol hatóságokra és a madridi nagykövetségre mutatnak", () => {
    const links = getOfficialLinks("ES");
    expect(links.length).toBeGreaterThanOrEqual(10);
    for (const l of links) expect(l.url, l.trigger).toMatch(/^https:\/\//);
    expect(getConsulate("ES").city).toBe("Madrid");
    expect(getConsulate("ES").website).toContain("madrid.mfa.gov.hu");
    // 112 az egységes uniós segélyhívó — ennek mindenképp ott kell lennie.
    expect(getEmergencyNumbers("ES").map((e) => e.number)).toContain("112");
  });

  /**
   * ⚠️ Az összehasonlító tábla oszlop-listája és a sor-adatok külön helyen
   * élnek. Ha elcsúsznak, a tábla ÜRES cellákat renderel — élesben ez már
   * előfordult (5 zászló a linksorban, „4 ország" a címben).
   */
  it("MINDEN összehasonlító sorban van ES-cella", () => {
    for (const c of GUIDE_COMPARISONS) {
      for (const row of c.rows) {
        expect(row.es, `${c.id} / ${row.label}`).toBeTruthy();
      }
    }
  });

  it("ahol van ES-slug az összehasonlításban, az LÉTEZŐ cikkre mutat", () => {
    const slugs = new Set(getGuides("ES").map((g) => g.slug));
    for (const c of GUIDE_COMPARISONS) {
      if (c.slugs.es) expect(slugs.has(c.slugs.es), `${c.id}: ${c.slugs.es}`).toBe(true);
    }
  });

  it("a kvíz-bank kitölti mind a 8 kategóriát", () => {
    expect(ES_QUIZ_BANK.length).toBeGreaterThanOrEqual(40);
    for (const cat of Object.keys(ES_QUIZ_CATEGORY_META)) {
      expect(ES_QUIZ_BANK.some((q) => q.category === cat), cat).toBe(true);
    }
    // Minden kérdésnek 4 opciója van, és a helyes index érvényes.
    for (const q of ES_QUIZ_BANK) {
      expect(q.options, q.id).toHaveLength(4);
      expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.id).toBeLessThanOrEqual(3);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
    }
  });

  it("a kvíz-kérdések azonosítói egyediek", () => {
    const ids = ES_QUIZ_BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("ES földrajz", () => {
  /**
   * ⚠️ A spanyol doboz KÉT részből áll, mert a Kanári-szigetek ~1000 km-re
   * vannak a szárazföldtől. Egyetlen befoglaló doboz fél Marokkót elnyelné —
   * ez a teszt rögzíti, hogy mindkét rész működik, és hogy a szűrő tényleg szűr.
   */
  it("elfogadja a szárazföldet ÉS a szigeteket, elutasítja a távoli pontokat", () => {
    const inside: [number, number][] = [
      [40.4168, -3.7038],  // Madrid
      [41.3874, 2.1686],   // Barcelona
      [36.7213, -4.4214],  // Málaga
      [39.5696, 2.6502],   // Palma (Baleárok)
      [28.4636, -16.2518], // Santa Cruz de Tenerife (Kanárik)
      [35.8894, -5.3213],  // Ceuta
      [35.2923, -2.9381],  // Melilla
    ];
    for (const [lat, lng] of inside) {
      expect(isInCountryCoord("ES", lat, lng), `${lat},${lng}`).toBe(true);
    }
    const outside: [number, number][] = [
      [47.3769, 8.5417],   // Zürich
      [51.5074, -0.1278],  // London
      [52.3676, 4.9041],   // Amszterdam
      [48.2082, 16.3738],  // Bécs
    ];
    for (const [lat, lng] of outside) {
      expect(isInCountryCoord("ES", lat, lng), `${lat},${lng}`).toBe(false);
    }
  });

  it("a svájci koordináta-ellenőrzés VÁLTOZATLAN (nincs regresszió)", () => {
    expect(isInCountryCoord("CH", 47.3769, 8.5417)).toBe(true);
    expect(isInCountryCoord("CH", 40.4168, -3.7038)).toBe(false);
  });

  it("a régió-pontok kódjai LÉTEZŐ regions.ts-kódok", () => {
    const valid = new Set(getRegions("ES").map((r) => r.code));
    for (const code of Object.keys(ES_REGION_POINTS)) {
      expect(valid.has(code), code).toBe(true);
    }
    expect(Object.keys(ES_REGION_POINTS)).toHaveLength(19);
  });

  it("a legközelebbi közösség a nagyvárosokra helyesen old fel", () => {
    expect(nearestEsRegion(40.4168, -3.7038).code).toBe("MD"); // Madrid
    expect(nearestEsRegion(41.3874, 2.1686).code).toBe("CT");  // Barcelona
    expect(nearestEsRegion(28.4636, -16.2518).code).toBe("CN"); // Tenerife → Kanárik
    expect(nearestEsRegion(39.5696, 2.6502).code).toBe("IB");  // Palma → Baleárok
  });
});

describe("ES eszköz-konfigurációk", () => {
  it("a lakbérlés-konfig spanyol, 1 havi kaucióval", () => {
    const cfg = getRentConfig("ES");
    expect(cfg.currency).toBe("EUR");
    expect(cfg.depositMonths).toBe(1);
    expect(cfg.officialSources.length).toBeGreaterThan(0);
    // A régió-választónak is kell ES-tétel, különben üres a lista.
    expect(regionsFor("ES").length).toBeGreaterThan(0);
  });

  it("a járat-konfig spanyol reptereket ad, BUD-dal mint céllal", () => {
    const cfg = getFlightConfig("ES");
    expect(cfg).not.toBeNull();
    expect(cfg!.home.code).toBe("BUD");
    expect(cfg!.currency).toBe("€");
    const codes = cfg!.origins.map((o) => o.code);
    for (const code of ["MAD", "BCN", "AGP", "ALC", "PMI", "TFS"]) {
      expect(codes, code).toContain(code);
    }
  });

  it("a példa-értékek spanyolok (nem svájciak)", () => {
    const ex = countryExamples("ES");
    expect(ex.phone).toContain("+34");
    expect(ex.city).toBe("Madrid");
    expect(ex.currency).toBe("EUR");
    expect(currencySymbol(ex.currency)).toBe("€");
    expect(ex.companyIdExample).not.toContain("CHE");
  });

  /**
   * ⚠️ Uniós polgárként a spanyol letelepedés jogilag egyszerű, de a varázsló
   * akkor is ES-specifikus eredményt kell adjon — nem svájci engedélytípust.
   */
  it("a letelepedés-varázsló ES-specifikus engedélytípust ad", () => {
    const r = evaluatePermit(
      { citizenship: "eu", duration: "long", purpose: "work", previousStay: "none" },
      "ES",
    );
    expect(r.primary.startsWith("es-"), r.primary).toBe(true);
    expect(PERMITS[r.primary]).toBeDefined();
    for (const alt of r.alternatives) {
      expect(PERMITS[alt], alt).toBeDefined();
    }
    // A cita previa figyelmeztetés a spanyol ág lényege — ne tűnjön el.
    expect(r.notes.join(" ")).toContain("cita previa");
  });

  it("a rövid tartózkodás NEM követel regisztrációt", () => {
    const r = evaluatePermit(
      { citizenship: "eu", duration: "short", purpose: "work", previousStay: "none" },
      "ES",
    );
    expect(r.primary).toBe("es-libre");
  });

  it("a svájci varázsló VÁLTOZATLAN (nincs regresszió)", () => {
    const r = evaluatePermit(
      { citizenship: "eu", duration: "long", purpose: "work", previousStay: "none" },
      "CH",
    );
    expect(r.primary.startsWith("es-")).toBe(false);
  });
});

/**
 * ⚠️ A KÖLTSÉGTERVEZŐ KÜLÖN HIBAOSZTÁLY.
 *
 * A tervező NEM a `feature-availability` kapuját használja, hanem saját
 * `isBudgetCountry` szűrőjét — és ha az adott ország nincs benne, NEM elrejti
 * magát, hanem a `useState<BudgetCountry>("DE")` alapértelmezésre esik. Ez azt
 * jelenti, hogy a spanyolországi felhasználó NÉMET költségeket és német
 * Kindergeldet látott volna, hibaüzenet nélkül. Angliánál ugyanez a hiba
 * élesben elő is fordult (svájci költségek + frank).
 *
 * Ezért itt MINDEN app-országra kimondjuk a szabályt, nem csak az ES-re.
 */
describe("költségtervező ország-lefedettség", () => {
  it("⚠️ MINDEN app-ország költségtervezhető (egy sem esik idegen alapértelmezésre)", () => {
    for (const c of COUNTRIES) {
      expect(isBudgetCountry(c.code), `${c.code} nincs a költségtervezőben`).toBe(true);
    }
  });

  it("minden országhoz van teljes költség-alapvonal, azonos kategóriákkal", () => {
    const ref = COST_BASELINE.CH.map((r) => r.id).sort();
    for (const c of COUNTRIES) {
      const rows = COST_BASELINE[c.code as keyof typeof COST_BASELINE];
      expect(rows, c.code).toBeDefined();
      expect(rows.map((r) => r.id).sort(), c.code).toEqual(ref);
    }
  });

  it("minden országhoz van SEO-céloldal, létező slug-gal", () => {
    for (const c of COUNTRIES) {
      const landing = BUDGET_LANDINGS.find((l) => l.cc === c.code);
      expect(landing, `${c.code}: nincs céloldal`).toBeDefined();
      expect(budgetLandingBySlug(landing!.slug)?.cc, landing!.slug).toBe(c.code);
      expect(landing!.faq.length, landing!.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("ES: euró a pénznem, és a spanyol költségek nem a németek", () => {
    expect(budgetCurrency("ES")).toBe("EUR");
    const es = COST_BASELINE.ES.map((r) => r.firstAdult);
    const de = COST_BASELINE.DE.map((r) => r.firstAdult);
    expect(es).not.toEqual(de);
  });

  /**
   * ⚠️ A 0 itt NEM hiányzó adat, hanem MAGA A TÉNY: Spanyolországban nincs
   * alanyi jogon járó havi családi pótlék (a támogatás az adóban jön).
   * Egy „becsült" összeg hamis biztonságot adna a költségtervben.
   */
  it("⚠️ ES családi pótlék = 0 (nincs alanyi jogú havi ellátás)", () => {
    expect(childBenefit("ES", 2)).toBe(0);
    // A többi ország viselkedése változatlan.
    expect(childBenefit("DE", 2)).toBeGreaterThan(0);
    expect(childBenefit("GB", 2)).toBeGreaterThan(0);
  });
});
