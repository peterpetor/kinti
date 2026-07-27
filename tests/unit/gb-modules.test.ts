import { describe, it, expect } from "vitest";
import { calculateGbTravel, GB_TARIF_SYSTEMS, GB_TICKET_TYPES } from "@/lib/transport";
import { getChecklists, CHECKLISTS_GB, getChecklist } from "@/lib/admin-checklists";
import { isFeatureAvailable } from "@/lib/feature-availability";

describe("GB közlekedés — TfL capping", () => {
  const CAP = { dailyCap: 8.9, weeklyCap: 44.7 };

  it("kevés utazásnál nincs plafon, a nyers ár érvényes", () => {
    const r = calculateGbTravel({ daysPerWeek: 1, tripsPerDay: 2, singleFare: 2.9, ...CAP });
    expect(r.rawWeekly).toBeCloseTo(5.8, 2);
    expect(r.actualWeekly).toBeCloseTo(5.8, 2);
    expect(r.cappedBy).toBe("none");
    expect(r.savedWeekly).toBe(0);
  });

  it("sok napon belüli utazásnál a NAPI plafon lép életbe", () => {
    // 6 út/nap × 2,90 = 17,40 → napi plafon 8,90
    const r = calculateGbTravel({ daysPerWeek: 2, tripsPerDay: 6, singleFare: 2.9, ...CAP });
    expect(r.rawWeekly).toBeCloseTo(34.8, 2);
    expect(r.afterDailyCap).toBeCloseTo(17.8, 2); // 8,90 × 2 nap
    expect(r.actualWeekly).toBeCloseTo(17.8, 2);
    expect(r.cappedBy).toBe("daily");
    expect(r.savedWeekly).toBeCloseTo(17, 2);
  });

  it("napi ingázásnál a HETI plafon lép életbe", () => {
    // 5 nap × napi plafon 8,90 = 44,50 → heti plafon 44,70 fölött nem
    const r = calculateGbTravel({ daysPerWeek: 7, tripsPerDay: 6, singleFare: 2.9, ...CAP });
    expect(r.actualWeekly).toBeCloseTo(44.7, 2);
    expect(r.cappedBy).toBe("weekly");
    expect(r.actualWeekly).toBeLessThan(r.afterDailyCap);
  });

  it("a tényleges összeg SOHA nem több a nyersnél és nem negatív", () => {
    for (const days of [0, 1, 3, 5, 7])
      for (const trips of [0, 2, 4, 10])
        for (const fare of [0, 1.75, 2.9, 6]) {
          const r = calculateGbTravel({ daysPerWeek: days, tripsPerDay: trips, singleFare: fare, ...CAP });
          expect(r.actualWeekly).toBeLessThanOrEqual(r.rawWeekly + 1e-9);
          expect(r.actualWeekly).toBeGreaterThanOrEqual(0);
          expect(Number.isNaN(r.actualWeekly)).toBe(false);
        }
  });

  it("0 plafon = nincs plafonozás (nem nullázza le a díjat)", () => {
    const r = calculateGbTravel({ daysPerWeek: 5, tripsPerDay: 2, singleFare: 3, dailyCap: 0, weeklyCap: 0 });
    expect(r.actualWeekly).toBeCloseTo(30, 2);
    expect(r.cappedBy).toBe("none");
  });

  it("a tarifa-rendszerek és jegytípusok fontban, brit forrással", () => {
    expect(GB_TARIF_SYSTEMS.length).toBeGreaterThanOrEqual(4);
    expect(GB_TICKET_TYPES.some((t) => t.id === "contactless")).toBe(true);
    for (const t of GB_TARIF_SYSTEMS) {
      expect(t.websiteUrl, t.id).toMatch(/^https:\/\//);
      // ⚠️ nem szivároghat be svájci/EU-s tartalom
      expect(t.description.toLowerCase(), t.id).not.toContain("chf");
    }
  });
});

describe("GB ügyintézés-csekklisták", () => {
  it("a getChecklists GB-re a GB-listát adja (nem a svájcit)", () => {
    const gb = getChecklists("GB");
    expect(gb).toBe(CHECKLISTS_GB);
    expect(gb.length).toBe(6);
    for (const c of gb) expect(c.slug).toMatch(/^gb-/);
  });

  it("minden GB-csekklista teljes és brit forrásra mutat", () => {
    for (const c of CHECKLISTS_GB) {
      expect(c.steps.length, c.slug).toBeGreaterThan(2);
      expect(c.sources.length, c.slug).toBeGreaterThan(0);
      expect(c.warnings?.length ?? 0, c.slug).toBeGreaterThan(0);
      const urls = [...c.sources.map((s) => s.url), ...c.steps.flatMap((s) => (s.link ? [s.link.url] : []))];
      for (const u of urls) {
        expect(u, `${c.slug}: ${u}`).toMatch(/gov\.uk|nhs\.uk|shelter\.org\.uk/);
      }
    }
  });

  it("a slug alapján visszakereshető", () => {
    expect(getChecklist("gb-nin")?.title).toContain("National Insurance");
    expect(getChecklist("gb-council-tax")).toBeTruthy();
  });

  it("a többi ország csekklistái változatlanok", () => {
    expect(getChecklists("NL").every((c) => c.slug.startsWith("nl-"))).toBe(true);
    expect(getChecklists("CH").some((c) => c.slug.startsWith("gb-"))).toBe(false);
  });
});

describe("GB feature-gate — az új modulok engedélyezve", () => {
  it("ügyintézés, iskolarendszer, közlekedés nyitva GB-n", () => {
    for (const f of ["ugyintezes", "iskolarendszer", "kozlekedes"]) {
      expect(isFeatureAvailable(f, "GB"), f).toBe(true);
    }
  });
});

describe("GB Life in the UK kvíz", () => {
  it("a menet 24 kérdés, ismétlés nélkül", async () => {
    const { generateQuizGB, GB_QUIZ_LENGTH } = await import("@/lib/gb-lifeintheuk-bank");
    expect(GB_QUIZ_LENGTH).toBe(24);
    for (const region of ["LDN", "NW", "YH", null]) {
      const q = generateQuizGB(region);
      expect(q.length, `region=${region}`).toBe(24);
      expect(new Set(q.map((x) => x.id)).size, `region=${region} — duplikátum`).toBe(24);
    }
  });

  it("minden kérdésnek 4 opciója van és érvényes a helyes index", async () => {
    const { GB_BANK } = await import("@/lib/gb-lifeintheuk-bank");
    for (const q of GB_BANK) {
      expect(q.options.length, q.id).toBe(4);
      expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.id).toBeLessThanOrEqual(3);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
      expect(new Set(q.options).size, `${q.id} — azonos opciók`).toBe(4);
    }
  });

  it("a régió-kódok EGYEZNEK a regions.ts GB-kódjaival", async () => {
    const { GB_QUIZ_REGIONS, GB_BANK } = await import("@/lib/gb-lifeintheuk-bank");
    const { getRegions } = await import("@/lib/regions");
    const geo = new Set(getRegions("GB").map((r) => r.code));
    for (const r of GB_QUIZ_REGIONS) expect(geo.has(r.code), r.code).toBe(true);
    for (const q of GB_BANK) {
      if (q.cantonCode) expect(geo.has(q.cantonCode), `${q.id}: ${q.cantonCode}`).toBe(true);
    }
  });

  it("a küszöb a valódi vizsgát követi (75%)", async () => {
    const { GB_PASS_THRESHOLD } = await import("@/lib/gb-lifeintheuk-bank");
    expect(GB_PASS_THRESHOLD).toBe(75);
  });
});

describe("GB szolgáltató-váltó", () => {
  it("⚠️ NINCS egészségbiztosítás-kategória (az NHS adóból megy)", async () => {
    const { getProviderCategories } = await import("@/lib/provider-switch");
    const gb = getProviderCategories("GB");
    expect(gb.some((c) => c.id === "krankenkasse")).toBe(false);
    // …miközben a többi országban VAN
    expect(getProviderCategories("CH").some((c) => c.id === "krankenkasse")).toBe(true);
  });

  it("a négy releváns kategória megvan, brit szolgáltatókkal", async () => {
    const { getProviderCategories } = await import("@/lib/provider-switch");
    const gb = getProviderCategories("GB");
    expect(gb.map((c) => c.id).sort()).toEqual(["bank", "electricity", "internet", "mobile"]);
    for (const c of gb) {
      expect(c.providers.length, c.id).toBeGreaterThanOrEqual(4);
      expect(c.tips.length, c.id).toBeGreaterThan(2);
      for (const pr of c.providers) expect(pr.url, `${c.id}/${pr.id}`).toMatch(/^https:\/\//);
    }
  });

  it("a felmondó-sablon ANGOLUL van és kitölti a paramétereket", async () => {
    const { getCategoryInfo } = await import("@/lib/provider-switch");
    const cat = getCategoryInfo("internet", "GB")!;
    const letter = cat.germanTemplate({
      customerName: "Teszt Elek", customerAddress: "1 Test Road, London",
      providerName: "BT", contractNumber: "ABC123",
      dateOfTermination: "2026-09-01", todayDate: "2026-07-26",
    });
    expect(letter).toContain("Dear Sir or Madam");
    expect(letter).toContain("Teszt Elek");
    expect(letter).toContain("ABC123");
    // ⚠️ nem szivároghat be német sablon-szöveg
    expect(letter).not.toContain("Sehr geehrte");
    expect(letter).not.toContain("Kündigung");
  });

  it("a többi ország kategóriái változatlanok", async () => {
    const { getProviderCategories } = await import("@/lib/provider-switch");
    expect(getProviderCategories("NL").length).toBeGreaterThan(0);
    expect(getProviderCategories("CH").length).toBeGreaterThan(0);
    // ismeretlen ország → CH (a régi viselkedés)
    expect(getProviderCategories("XX")).toEqual(getProviderCategories("CH"));
  });
});

describe("GB repülőjegy-konfig", () => {
  it("van GB járat-konfig, angol reptérekkel és fonttal", async () => {
    const { FLIGHT_CONFIG } = await import("@/lib/flights");
    const gb = FLIGHT_CONFIG.GB;
    expect(gb).toBeTruthy();
    expect(gb.currency).toBe("£");
    const codes = gb.origins.map((o) => o.code);
    for (const c of ["LTN", "STN", "LHR", "MAN", "BHX"]) expect(codes, c).toContain(c);
    // ⚠️ skót/walesi reptér NEM kerülhet be (a Kinti GB-je csak Anglia)
    for (const c of ["EDI", "GLA", "CWL", "BFS"]) expect(codes, c).not.toContain(c);
  });

  it("minden GB-légitársaság útvonala létező reptérre mutat", async () => {
    const { FLIGHT_CONFIG } = await import("@/lib/flights");
    const codes = new Set(FLIGHT_CONFIG.GB.origins.map((o) => o.code));
    for (const a of FLIGHT_CONFIG.GB.airlines) {
      for (const r of a.routes) expect(codes.has(r), `${a.id} → ${r}`).toBe(true);
      expect(a.url).toMatch(/^https:\/\//);
    }
  });

  it("⚠️ a tippek kimondják, hogy Brexit óta ÚTLEVÉL kell", async () => {
    const { FLIGHT_CONFIG } = await import("@/lib/flights");
    const all = FLIGHT_CONFIG.GB.tips.map((t) => t.title + " " + t.body).join(" ");
    expect(all).toMatch(/útlevél/i);
    expect(all).toMatch(/személyi igazolvánnyal már nem|SZEMÉLYI IGAZOLVÁNNYAL/i);
  });
});

describe("GB lakhatás-konfig", () => {
  it("fontban számol, és a kaució-védelmet kiemeli", async () => {
    const { getRentConfig } = await import("@/lib/rent-cost");
    const gb = getRentConfig("GB");
    expect(gb.currency).toBe("GBP");
    expect(gb.depositTip).toMatch(/kaució-védelem|TDP/i);
    expect(gb.nkTip.toLowerCase()).toContain("council tax");
    // ⚠️ nem eshet a svájci configra
    const ch = getRentConfig("CH");
    expect(gb.currency).not.toBe(ch.currency);
    expect(gb.officialSources.every((s) => /gov\.uk|shelter/.test(s.url))).toBe(true);
  });
});
