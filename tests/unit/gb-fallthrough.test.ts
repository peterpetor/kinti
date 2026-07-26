import { describe, it, expect } from "vitest";
import { getConsulate, getEmergencyNumbers, getOfficialLinks } from "@/lib/official-links";
import { isInCountryCoord } from "@/lib/business";
import { getDailyQuestions } from "@/lib/quiz-daily";
import { nearestGbRegion, gbPoint, GB_REGION_POINTS } from "@/lib/gb-points";
import { getRegions } from "@/lib/regions";

describe("⚠️ Hivatalos linkek — GB nem eshet a svájci ágra", () => {
  it("a SEGÉLYHÍVÓ számok britek, nem svájciak", () => {
    const e = getEmergencyNumbers("GB");
    const numbers = e.map((x) => x.number);
    expect(numbers).toContain("999");
    expect(numbers).toContain("112");
    // ⚠️ a svájci számok SEMMIKÉPP nem jelenhetnek meg
    for (const swiss of ["117", "118", "144", "1414"]) {
      expect(numbers, `svájci szám szivárgott: ${swiss}`).not.toContain(swiss);
    }
  });

  it("a konzulátus London, nem Bern", () => {
    const c = getConsulate("GB");
    expect(c.city).toBe("London");
    expect(c.website).toContain("london");
  });

  it("a hivatalos linkek gov.uk/nhs.uk-ra mutatnak (nem ch.ch-ra)", () => {
    const links = getOfficialLinks("GB");
    expect(links.length).toBeGreaterThan(8);
    for (const l of links) {
      const ok = /gov\.uk|nhs\.uk|mfa\.gov\.hu|kormany\.hu/.test(l.url);
      expect(ok, `${l.trigger} → ${l.url}`).toBe(true);
      // svájci/osztrák/holland forrás nem kerülhet ide
      expect(l.url).not.toMatch(/ch\.ch|oesterreich\.gv\.at|rijksoverheid/);
    }
  });

  it("a többi ország változatlan (nincs regresszió)", () => {
    expect(getConsulate("CH").city).not.toBe("London");
    expect(getEmergencyNumbers("CH").map((e) => e.number)).not.toContain("999");
    // ismeretlen ország → CH (a régi viselkedés)
    expect(getConsulate("XX")).toEqual(getConsulate("CH"));
  });
});

describe("⚠️ Szaknévsor koordináta-ellenőrzés GB-re", () => {
  it("angol városokat ELFOGAD", () => {
    const cities: [string, number, number][] = [
      ["London", 51.5074, -0.1278],
      ["Manchester", 53.4808, -2.2426],
      ["Birmingham", 52.4862, -1.8904],
      ["Newcastle", 54.9783, -1.6178],
      ["Bristol", 51.4545, -2.5879],
    ];
    for (const [name, lat, lng] of cities) {
      expect(isInCountryCoord("GB", lat, lng), name).toBe(true);
    }
  });

  it("⚠️ REGRESSZIÓ-ŐR: GB nélkül a svájci doboz utasította volna el őket", () => {
    // Ugyanazok a londoni koordináták CH-ként ELUTASÍTVA — ez volt a bug.
    expect(isInCountryCoord("CH", 51.5074, -0.1278)).toBe(false);
  });

  it("távoli koordinátákat elutasít", () => {
    expect(isInCountryCoord("GB", 47.3769, 8.5417)).toBe(false);  // Zürich
    expect(isInCountryCoord("GB", 52.3676, 4.9041)).toBe(false);  // Amszterdam
    expect(isInCountryCoord("GB", 40.7128, -74.006)).toBe(false); // New York
  });

  it("a többi ország ellenőrzése változatlan", () => {
    expect(isInCountryCoord("CH", 47.3769, 8.5417)).toBe(true);
    expect(isInCountryCoord("NL", 52.3676, 4.9041)).toBe(true);
    expect(isInCountryCoord("DE", 52.52, 13.405)).toBe(true);
  });
});

describe("GB napi kvíz", () => {
  it("GB-re ANGOL kérdéseket ad, nem svájcit", () => {
    const q = getDailyQuestions("2026-07-26", "GB");
    expect(q.length).toBeGreaterThan(0);
    for (const x of q) expect(x.id, x.question).toMatch(/^gb-/);
  });

  it("ugyanaz a nap ugyanazt adja, más nap mást (determinisztikus)", () => {
    const a = getDailyQuestions("2026-07-26", "GB").map((q) => q.id);
    const b = getDailyQuestions("2026-07-26", "GB").map((q) => q.id);
    expect(a).toEqual(b);
    const c = getDailyQuestions("2026-08-15", "GB").map((q) => q.id);
    expect(c).not.toEqual(a);
  });

  it("minden GB-kérdés 4 különböző opcióval és érvényes indexszel", async () => {
    const { GB_QUIZ_BANK } = await import("@/lib/quiz-bank-gb");
    expect(GB_QUIZ_BANK.length).toBeGreaterThanOrEqual(30);
    for (const q of GB_QUIZ_BANK) {
      expect(q.options.length, q.id).toBe(4);
      expect(new Set(q.options).size, `${q.id} — azonos opciók`).toBe(4);
      expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.id).toBeLessThanOrEqual(3);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
    }
    expect(new Set(GB_QUIZ_BANK.map((q) => q.id)).size).toBe(GB_QUIZ_BANK.length);
  });
});

describe("GB régió-pontok", () => {
  it("a kódok EGYEZNEK a regions.ts GB-kódjaival", () => {
    const geo = getRegions("GB").map((r) => r.code).sort();
    expect(Object.keys(GB_REGION_POINTS).sort()).toEqual(geo);
  });

  it("a legközelebbi régió helyesen oldódik fel", () => {
    expect(nearestGbRegion(51.5074, -0.1278).code).toBe("LDN"); // London
    expect(nearestGbRegion(53.4808, -2.2426).code).toBe("NW");  // Manchester
    expect(nearestGbRegion(52.4862, -1.8904).code).toBe("WM");  // Birmingham
  });

  it("ismeretlen kód → London (nem svájci alapérték)", () => {
    expect(gbPoint(null).code).toBe("LDN");
    expect(gbPoint("XX").code).toBe("LDN");
  });
});

describe("GB budget-tervező (Mennyi marad?)", () => {
  it("GB érvényes budget-ország, fonttal", async () => {
    const { isBudgetCountry, budgetCurrency } = await import("@/lib/budget-plan");
    expect(isBudgetCountry("GB")).toBe(true);
    expect(budgetCurrency("GB")).toBe("GBP");
    // ⚠️ nem eshet euróra/frankra
    expect(budgetCurrency("GB")).not.toBe("EUR");
    expect(budgetCurrency("CH")).toBe("CHF");
  });

  it("⚠️ a GB költség-alap NHS miatt 0 egészségbiztosítást tartalmaz", async () => {
    const { COST_BASELINE } = await import("@/lib/budget-plan");
    const kk = COST_BASELINE.GB.find((c) => c.id === "krankenkasse")!;
    expect(kk.firstAdult).toBe(0);
    expect(kk.extraAdult).toBe(0);
    // …miközben CH-ban és NL-ben VAN havi díj
    expect(COST_BASELINE.CH.find((c) => c.id === "krankenkasse")!.firstAdult).toBeGreaterThan(0);
    expect(COST_BASELINE.NL.find((c) => c.id === "krankenkasse")!.firstAdult).toBeGreaterThan(0);
  });

  it("a GB rezsi-sor tartalmazza a council taxet (a többi országban nincs ilyen)", async () => {
    const { COST_BASELINE } = await import("@/lib/budget-plan");
    const rezsi = COST_BASELINE.GB.find((c) => c.id === "rezsi")!;
    expect(rezsi.label.toLowerCase()).toContain("council tax");
    expect(rezsi.firstAdult).toBeGreaterThan(0);
  });

  it("minden ország ugyanazokat a költség-kategóriákat használja", async () => {
    const { COST_BASELINE } = await import("@/lib/budget-plan");
    const ids = (c: keyof typeof COST_BASELINE) => COST_BASELINE[c].map((x) => x.id).sort();
    for (const cc of ["AT", "DE", "NL", "GB"] as const) {
      expect(ids(cc), cc).toEqual(ids("CH"));
    }
  });

  it("van GB gyerek-juttatás és ország-céloldal", async () => {
    const { childBenefit } = await import("@/lib/budget-plan");
    const { budgetLandingBySlug, BUDGET_LANDINGS } = await import("@/lib/budget-landing");
    expect(childBenefit("GB", 2)).toBeGreaterThan(0);
    expect(childBenefit("GB", 0)).toBe(0);
    const gb = budgetLandingBySlug("anglia");
    expect(gb?.cc).toBe("GB");
    expect(gb?.faq.length).toBeGreaterThan(3);
    // minden landing-slug egyedi
    const slugs = BUDGET_LANDINGS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
