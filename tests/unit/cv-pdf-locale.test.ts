import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * A generátor VALÓDI kimenetét ellenőrzi (nem csak a címke-táblát): a jsPDF-et
 * mockoljuk, és összegyűjtjük, milyen szöveget rajzol ki a lapra. Így kiderül,
 * ha a holland CV-be német szakaszcím vagy „Seite" lábléc szivárogna vissza.
 * (A projekt vitest-környezete böngésző NÉLKÜLI — ezért kell a mock, jsdom nem
 * telepítendő; ld. auto-update-safety.test.ts ugyanezt az elvet.)
 */
const drawn: string[] = [];
const images: string[] = [];

vi.mock("jspdf", () => {
  class FakeDoc {
    setFont() {}
    setFontSize() {}
    setTextColor() {}
    setFillColor() {}
    setDrawColor() {}
    setLineWidth() {}
    rect() {}
    line() {}
    addPage() {}
    setPage() {}
    getNumberOfPages() { return 1; }
    addImage(data: string) { images.push(data); }
    splitTextToSize(text: string) { return [text]; }
    text(t: string | string[]) { drawn.push(...(Array.isArray(t) ? t : [t])); }
    save() {}
  }
  return { jsPDF: FakeDoc };
});

import { generateCvPdf, type CvData } from "@/lib/cv-pdf";

const base: CvData = {
  fullName: "Kovács János",
  professionDe: "Heftruckchauffeur",
  birthYear: "1990",
  city: "Amsterdam",
  phone: "+31 6 1234 5678",
  email: "janos@email.com",
  summary: "Ervaren heftruckchauffeur.",
  experience: [{ role: "Heftruckchauffeur", employer: "Logistiek BV", from: "2020", to: "heden", desc: "" }],
  education: [{ school: "Szakközépiskola", qualification: "mbo-diploma", from: "2005", to: "2009" }],
  languages: [{ name: "Nederlands", level: "B1 (Gevorderd)" }],
  skills: "Rijbewijs C+E, VCA",
  photo: "data:image/jpeg;base64,AAAA",
};

beforeEach(() => {
  drawn.length = 0;
  images.length = 0;
});

describe("generateCvPdf — holland konvenció", () => {
  it("holland szakaszcímeket ír, és NEM németet", () => {
    return generateCvPdf({ ...base, locale: "nl" }).then(() => {
      for (const label of ["PERSOONLIJKE GEGEVENS", "PROFIEL", "WERKERVARING", "OPLEIDING", "VAARDIGHEDEN"]) {
        expect(drawn).toContain(label);
      }
      for (const german of ["PERSÖNLICHE DATEN", "BERUFSERFAHRUNG", "AUSBILDUNG", "KENNTNISSE"]) {
        expect(drawn).not.toContain(german);
      }
      expect(drawn).toContain("Geboortejaar");
      expect(drawn).toContain("Woonplaats");
      expect(drawn).toContain("Taal");
    });
  });

  it("a bevett holland záró sort és lábléceket teszi rá", async () => {
    await generateCvPdf({ ...base, locale: "nl" });
    expect(drawn).toContain("Referenties op aanvraag beschikbaar.");
    expect(drawn).toContain("Curriculum Vitae"); // lábléc-cím
    expect(drawn).toContain("Pagina 1/1");
    expect(drawn).not.toContain("Seite 1/1");
  });

  it("⚠️ a holland CV-ben MEGENGEDETT a fotó és a születési év (a britben nem)", async () => {
    await generateCvPdf({ ...base, locale: "nl" });
    expect(images).toHaveLength(1);
    expect(drawn).toContain("1990");

    drawn.length = 0;
    images.length = 0;
    await generateCvPdf({ ...base, locale: "en" });
    expect(images).toHaveLength(0);
    expect(drawn).not.toContain("1990");
  });

  it("locale nélkül változatlanul német (visszafelé kompatibilis)", async () => {
    await generateCvPdf({ ...base, professionDe: "Gabelstaplerfahrer/in" });
    expect(drawn).toContain("BERUFSERFAHRUNG");
    expect(drawn).toContain("Seite 1/1");
  });
});
