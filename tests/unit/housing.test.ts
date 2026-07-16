import { describe, it, expect } from "vitest";
import {
  validateHousingInput,
  formatHousingPrice,
  housingAgeLabel,
  HOUSING_TYPE_LABELS,
  HOUSING_TYPES,
} from "@/lib/housing";

const valid = {
  type: "room_offered",
  country: "CH",
  city: "Zürich",
  price: 850,
  currency: "CHF",
  description: "Világos szoba a belvárosban, azonnal költözhető, rezsivel együtt.",
  contact: "teszt@example.com",
  consent: true,
};

describe("validateHousingInput", () => {
  it("boldog út: minden mező validál, az ár kerekítve", () => {
    const v = validateHousingInput({ ...valid, price: 850.4 });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.value.price).toBe(850);
      expect(v.value.type).toBe("room_offered");
    }
  });

  it("stringként érkező ár (űrlap-input) is elfogadott", () => {
    const v = validateHousingInput({ ...valid, price: "850" });
    expect(v.ok).toBe(true);
  });

  it("ismeretlen típus / ország / deviza → hiba", () => {
    expect(validateHousingInput({ ...valid, type: "villa_offered" }).ok).toBe(false);
    expect(validateHousingInput({ ...valid, country: "HU" }).ok).toBe(false);
    expect(validateHousingInput({ ...valid, currency: "USD" }).ok).toBe(false);
  });

  it("ár-határok: 0, negatív, 20000 felett és NaN elutasítva", () => {
    for (const price of [0, -5, 20001, "nem szám"]) {
      const v = validateHousingInput({ ...valid, price });
      expect(v.ok).toBe(false);
      if (!v.ok) expect(v.error).toContain("valós havi árat");
    }
  });

  it("rövid leírás / kontakt / település → magyar hibaüzenet", () => {
    const d = validateHousingInput({ ...valid, description: "rövid" });
    expect(d.ok).toBe(false);
    const c = validateHousingInput({ ...valid, contact: "x" });
    expect(c.ok).toBe(false);
    const t = validateHousingInput({ ...valid, city: "Z" });
    expect(t.ok).toBe(false);
  });

  it("kiadó hirdetésnél a főbérlői-engedély nyilatkozat KÖTELEZŐ", () => {
    for (const type of ["room_offered", "apartment_offered"]) {
      const v = validateHousingInput({ ...valid, type, consent: false });
      expect(v.ok).toBe(false);
      if (!v.ok) expect(v.error).toContain("nyilatkozat");
    }
  });

  it("kereső hirdetésnél nincs nyilatkozat-kényszer", () => {
    const v = validateHousingInput({ ...valid, type: "looking_for_room", consent: false });
    expect(v.ok).toBe(true);
  });

  it("regionCode: opcionális — üres/hiányzó → null, megadva átmegy (max 8 char)", () => {
    const nincs = validateHousingInput(valid);
    expect(nincs.ok && nincs.value.regionCode).toBe(null);
    const ures = validateHousingInput({ ...valid, regionCode: "  " });
    expect(ures.ok && ures.value.regionCode).toBe(null);
    const van = validateHousingInput({ ...valid, regionCode: "ZH" });
    expect(van.ok && van.value.regionCode).toBe("ZH");
    const hosszu = validateHousingInput({ ...valid, regionCode: "TULHOSSZUKOD" });
    expect(hosszu.ok && hosszu.value.regionCode).toBe("TULHOSSZ");
  });

  it("hosszú mezők levágva (city 60 / description 1200 / contact 200)", () => {
    const v = validateHousingInput({
      ...valid,
      city: "V".repeat(100),
      description: "D".repeat(2000),
      contact: "c".repeat(300),
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.value.city.length).toBe(60);
      expect(v.value.description.length).toBe(1200);
      expect(v.value.contact.length).toBe(200);
    }
  });

  it("minden hirdetés-típusnak van magyar címkéje", () => {
    for (const t of HOUSING_TYPES) expect(HOUSING_TYPE_LABELS[t]).toBeTruthy();
  });
});

describe("formatHousingPrice", () => {
  it("kiadó: „ár deviza / hó”; kereső: „max …”", () => {
    expect(formatHousingPrice("room_offered", 850, "CHF")).toBe("850 CHF / hó");
    expect(formatHousingPrice("looking_for_room", 850, "EUR")).toBe("max 850 EUR / hó");
  });
});

describe("housingAgeLabel", () => {
  const now = Date.now();
  const daysAgo = (d: number) => Math.floor(now / 1000) - d * 86_400;
  it("ma / tegnap / napok / hetek / hónapok", () => {
    expect(housingAgeLabel(daysAgo(0), now)).toBe("ma");
    expect(housingAgeLabel(daysAgo(1), now)).toBe("tegnap");
    expect(housingAgeLabel(daysAgo(3), now)).toBe("3 napja");
    expect(housingAgeLabel(daysAgo(14), now)).toBe("2 hete");
    expect(housingAgeLabel(daysAgo(45), now)).toBe("2 hónapja");
  });
});
