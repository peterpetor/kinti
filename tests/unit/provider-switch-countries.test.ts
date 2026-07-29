import { describe, it, expect } from "vitest";
import {
  getProviderCategories,
  getCategoryInfo,
  PROVIDER_CATEGORIES_BY_COUNTRY,
  formatDateDe,
  formatDateEn,
  formatDateEs,
} from "@/lib/provider-switch";
import { COUNTRIES } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

const PARAMS = {
  customerName: "Teszt Elek",
  customerAddress: "Calle Mayor 1, 28013 Madrid",
  providerName: "Szolgáltató",
  contractNumber: "ABC123",
  dateOfTermination: "2026-09-01",
  todayDate: "2026-07-29",
};

/**
 * ⚠️ A Szolgáltató Váltó a legkockázatosabb ország-tudatos modul: NEM csak
 * megjelenít, hanem FELMONDÓLEVELET generál, amit a felhasználó tényleg elküld.
 * Egy rossz nyelvű vagy rossz jogi hivatkozású levél nem kozmetikai hiba —
 * élesben elő is fordult, hogy Angliában „német nyelvű" levelet ígért a UI
 * Einschreiben-utasítással.
 */
describe("Szolgáltató Váltó — ország-lefedettség", () => {
  it("MINDEN app-országhoz van saját kategória-készlet", () => {
    for (const c of COUNTRIES) {
      expect(PROVIDER_CATEGORIES_BY_COUNTRY[c.code], `${c.code}: nincs adat`).toBeDefined();
      expect(getProviderCategories(c.code).length, c.code).toBeGreaterThan(0);
    }
  });

  it("⚠️ egyik ország sem a SVÁJCI listát kapja (a CH kivételével)", () => {
    const swiss = JSON.stringify(getProviderCategories("CH").map((c) => c.id + c.label));
    for (const c of COUNTRIES) {
      if (c.code === "CH") continue;
      const own = JSON.stringify(getProviderCategories(c.code).map((x) => x.id + x.label));
      expect(own, `${c.code} a svájci készletet kapta`).not.toBe(swiss);
    }
  });

  /**
   * ⚠️ Angliában (NHS) és Spanyolországban (Seguridad Social) a közellátást
   * közteher fedezi — NINCS biztosító, amit váltani lehetne. Ez nem üres
   * kategória, hanem egyáltalán nem kínáljuk: egy „váltsd le a biztosítód"
   * ajánlat ott értelmezhetetlen lenne.
   */
  it("⚠️ GB és ES NEM kínál egészségbiztosító-váltást", () => {
    for (const cc of ["GB", "ES"]) {
      const ids = getProviderCategories(cc).map((c) => c.id);
      expect(ids, `${cc}: van krankenkasse`).not.toContain("krankenkasse");
    }
    // A többinél viszont VAN (nincs regresszió).
    for (const cc of ["CH", "NL"]) {
      expect(getProviderCategories(cc).map((c) => c.id), cc).toContain("krankenkasse");
    }
  });

  it("minden kategória kitöltött, valódi szolgáltatókkal és forrásokkal", () => {
    for (const c of COUNTRIES) {
      for (const cat of getProviderCategories(c.code)) {
        const where = `${c.code}/${cat.id}`;
        expect(cat.label.trim(), where).not.toBe("");
        expect(cat.description.trim().length, where).toBeGreaterThan(40);
        expect(cat.tips.length, `${where}: tippek`).toBeGreaterThanOrEqual(3);
        expect(cat.providers.length, `${where}: szolgáltatók`).toBeGreaterThanOrEqual(3);
        expect(cat.officialLinks.length, `${where}: források`).toBeGreaterThanOrEqual(1);
        for (const l of cat.officialLinks) expect(l.url, where).toMatch(/^https:\/\//);
        for (const pr of cat.providers) expect(pr.url, `${where}/${pr.id}`).toMatch(/^https:\/\//);
      }
    }
  });

  it("nincs duplikált szolgáltató-azonosító egy kategórián belül", () => {
    for (const c of COUNTRIES) {
      for (const cat of getProviderCategories(c.code)) {
        const ids = cat.providers.map((p) => p.id);
        expect(new Set(ids).size, `${c.code}/${cat.id}`).toBe(ids.length);
      }
    }
  });
});

describe("felmondólevél — a nyelv az ORSZÁGÉ", () => {
  /**
   * ⚠️ A `germanTemplate` mező NEVE történeti. A levél nyelve MINDIG az adott
   * országé — ezt a teszt szó szerint kikényszeríti, mert a mezőnév alapján
   * bárki jóhiszeműen németül írhatná meg egy új ország sablonját.
   */
  it("a spanyol sablon SPANYOLUL van, német/angol szöveg nélkül", () => {
    for (const cat of getProviderCategories("ES")) {
      const letter = cat.germanTemplate(PARAMS);
      expect(letter, `${cat.id}: nem spanyol megszólítás`).toContain("Estimados señores");
      expect(letter, `${cat.id}: nem spanyol elköszönés`).toContain("Atentamente");
      for (const german of ["Sehr geehrte", "Kündigung", "Mit freundlichen Grüßen", "hiermit"]) {
        expect(letter.includes(german), `${cat.id}: német szöveg — „${german}"`).toBe(false);
      }
      for (const english of ["Dear Sir or Madam", "Yours faithfully"]) {
        expect(letter.includes(english), `${cat.id}: angol szöveg — „${english}"`).toBe(false);
      }
    }
  });

  it("az angol sablon ANGOLUL van (nincs regresszió)", () => {
    for (const cat of getProviderCategories("GB")) {
      const letter = cat.germanTemplate(PARAMS);
      expect(letter).toContain("Yours faithfully");
      expect(letter.includes("Mit freundlichen Grüßen"), cat.id).toBe(false);
    }
  });

  it("a levél tartalmazza a megadott adatokat (nem nyeli el a helyőrzőket)", () => {
    for (const c of COUNTRIES) {
      for (const cat of getProviderCategories(c.code)) {
        const letter = cat.germanTemplate(PARAMS);
        expect(letter, `${c.code}/${cat.id}: név`).toContain(PARAMS.customerName);
        expect(letter, `${c.code}/${cat.id}: szerződésszám`).toContain(PARAMS.contractNumber);
      }
    }
  });

  /**
   * ⚠️ SPANYOL SAJÁTOSSÁG: a felmondáshoz jár egy „número de referencia de
   * baja". Ha nem kéri el a felhasználó, semmivel nem tudja bizonyítani, hogy
   * egyáltalán kérte a felmondást — ezért a távközlési és energia-sablonokban
   * ez KÖTELEZŐ elem.
   */
  it("⚠️ az ES távközlési és energia-levél kéri a baja-referenciaszámot", () => {
    for (const id of ["mobile", "internet", "electricity"]) {
      const cat = getCategoryInfo(id as never, "ES");
      expect(cat, `ES/${id} hiányzik`).not.toBeNull();
      expect(
        cat!.germanTemplate(PARAMS).toLowerCase(),
        `ES/${id}: nem kéri a referenciaszámot`,
      ).toContain("referencia de la baja");
    }
  });
});

describe("dátumformázás", () => {
  const d = new Date(2026, 3, 3); // 2026. április 3.

  it("minden nyelv a saját levélformáját használja", () => {
    expect(formatDateDe(d)).toBe("03.04.2026");
    expect(formatDateEn(d)).toBe("3 April 2026");
    expect(formatDateEs(d)).toBe("3 de abril de 2026");
  });

  /**
   * ⚠️ A csak számjegyes dátum félreérthető (03/04 = április 3. a briteknél,
   * március 4. az USA-ban) — egy felmondólevélben pedig a dátum a bizonyíték.
   * Az angol és a spanyol forma ezért KIÍRJA a hónapnevet.
   */
  it("⚠️ az angol és a spanyol forma kiírja a hónapnevet", () => {
    expect(formatDateEn(d)).toMatch(/[A-Za-z]{3,}/);
    expect(formatDateEs(d)).toMatch(/[a-záéíóúñ]{3,}/);
  });
});

describe("funkció-kapu", () => {
  it("a szolgáltató-váltó MINDEN app-országban elérhető", () => {
    for (const c of COUNTRIES) {
      expect(isFeatureAvailable("szolgaltato-valto", c.code), c.code).toBe(true);
    }
  });
});
