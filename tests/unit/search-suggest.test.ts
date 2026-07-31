import { describe, it, expect } from "vitest";
import {
  buildSearchSuggestions,
  editDistanceWithin,
  MIN_QUERY,
} from "@/lib/search-suggest";

/**
 * A kereső-javaslatok őre.
 *
 * ⚠️ MIÉRT LÉTEZIK A FUNKCIÓ: 70 szakma van az adatbázisban, de a pill-sor
 * csak néhányat mutat. Aki nem tudja a szó PONTOS alakját, nem talál rá —
 * pedig ott van. Az előző kör ragozás-tűrést hozott („bécsi"→„bécs"), de
 * BETŰHIBÁT nem kezel: a „fogorovs" ma is nulla.
 */
const CATS = [
  { id: "all", label: "Mind" },
  { id: "fogorvos", label: "Fogorvos" },
  { id: "fodrasz", label: "Fodrász" },
  { id: "fordito", label: "Fordító" },
  { id: "orvos", label: "Háziorvos" },
  { id: "etterem", label: "Étterem" },
  { id: "ures", label: "Üres kategória" },
];
const COUNTS: Record<string, number> = {
  fogorvos: 185,
  fodrasz: 58,
  fordito: 144,
  orvos: 332,
  etterem: 118,
  ures: 0, // ⚠️ nulla találat — sosem ajánlható
};

describe("kereső-javaslatok — alapviselkedés", () => {
  it("túl rövid bemenetre nem ajánl", () => {
    expect(MIN_QUERY).toBe(2);
    expect(buildSearchSuggestions("f", CATS, COUNTS)).toEqual([]);
    expect(buildSearchSuggestions("", CATS, COUNTS)).toEqual([]);
  });

  it("szó-eleji egyezésre ajánl, darabszám szerint rendezve", () => {
    const s = buildSearchSuggestions("fo", CATS, COUNTS);
    expect(s.map((x) => x.categoryId)).toEqual(["fogorvos", "fordito", "fodrasz"]);
    expect(s[0].count).toBe(185);
    expect(s.every((x) => !x.fuzzy)).toBe(true);
  });

  it("ékezet nélkül is talál (fold)", () => {
    expect(buildSearchSuggestions("etter", CATS, COUNTS)[0].categoryId).toBe("etterem");
    expect(buildSearchSuggestions("fodras", CATS, COUNTS)[0].categoryId).toBe("fodrasz");
  });

  it("⚠️ NULLA találatú kategóriát SOSEM ajánl (zsákutca)", () => {
    const s = buildSearchSuggestions("üres", CATS, COUNTS);
    expect(s.map((x) => x.categoryId)).not.toContain("ures");
  });

  it("a Mind kategória nem javaslat", () => {
    expect(buildSearchSuggestions("min", CATS, COUNTS).map((x) => x.categoryId)).not.toContain("all");
  });

  it("az UTOLSÓ szóra ajánl (a felhasználó azt gépeli épp)", () => {
    const s = buildSearchSuggestions("bécs fogor", CATS, COUNTS);
    expect(s[0].categoryId).toBe("fogorvos");
  });
});

describe("kereső-javaslatok — elgépelés-javítás", () => {
  it("⚠️ betűhibát javít, és MEGJELÖLI, hogy javítás volt", () => {
    const s = buildSearchSuggestions("fogorovs", CATS, COUNTS); // betűcsere
    expect(s.length).toBeGreaterThan(0);
    expect(s[0].categoryId).toBe("fogorvos");
    expect(s[0].fuzzy).toBe(true);
  });

  it("hiányzó betűt is elvisel", () => {
    expect(buildSearchSuggestions("fogorvs", CATS, COUNTS)[0].categoryId).toBe("fogorvos");
  });

  it("rövid szónál NEM javít (túl zajos lenne)", () => {
    // 3 betű: a fuzzy-ág be sem kapcsol, és nincs prefix/részlánc egyezés sem.
    expect(buildSearchSuggestions("xyz", CATS, COUNTS)).toEqual([]);
  });

  it("a pontos egyezés MEGELŐZI a betűhibás találgatást", () => {
    const s = buildSearchSuggestions("fodrasz", CATS, COUNTS);
    expect(s[0].categoryId).toBe("fodrasz");
    expect(s[0].fuzzy).toBe(false);
  });
});

describe("szerkesztési távolság", () => {
  it("a korláton belül a valódi távolságot adja", () => {
    expect(editDistanceWithin("fogorvos", "fogorvos", 2)).toBe(0);
    expect(editDistanceWithin("fogorvos", "fogorvs", 2)).toBe(1);
  });

  it("a korláton túl null (korai kilépés)", () => {
    expect(editDistanceWithin("fogorvos", "asztalos", 1)).toBeNull();
    // Hossz-különbség alapján azonnal elvethető:
    expect(editDistanceWithin("fo", "fogorvos", 1)).toBeNull();
  });
});
