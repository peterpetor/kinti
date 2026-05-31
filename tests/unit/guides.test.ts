import { describe, it, expect } from "vitest";
import { relatedCategoriesForGuide, guidesForCategory } from "@/lib/guides";

describe("relatedCategoriesForGuide", () => {
  it("adózás cikk → adótanácsadó kategória", () => {
    const cats = relatedCategoriesForGuide("adozas-quellensteuer");
    expect(cats.some((c) => c.id === "adotanacsado")).toBe(true);
  });
  it("ismeretlen slug → üres tömb", () => {
    expect(relatedCategoriesForGuide("___nincs___")).toEqual([]);
  });
});

describe("guidesForCategory", () => {
  it("fordított irány: adótanácsadó → adózás cikk", () => {
    const guides = guidesForCategory("adotanacsado");
    expect(guides.some((g) => g.slug === "adozas-quellensteuer")).toBe(true);
  });
  it("üres kategória → üres tömb", () => {
    expect(guidesForCategory("")).toEqual([]);
  });
});
