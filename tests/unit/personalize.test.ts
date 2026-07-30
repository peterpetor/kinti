import { describe, it, expect } from "vitest";
import {
  STAGE_OPTIONS,
  FOCUS_OPTIONS,
  PERSONALIZE_GUIDE_SLUGS,
  parsePersonalizeProfile,
  buildPersonalizedItems,
  type PersonalizeStage,
  type PersonalizeFocus,
} from "@/lib/personalize";
import { GUIDES } from "@/lib/guides";

// ⚠️ MIND A 6 ORSZÁG — korábban a lista csak CH/AT/DE/NL volt, ezért a GB/ES
// személyre-szabott kezdőlap NÉMA SVÁJCI-fallthrough hibája (binary-country-
// fallthrough) sosem bukott le tesztben. Most mind a 6-ot járjuk.
const COUNTRIES = ["CH", "AT", "DE", "NL", "GB", "ES"];

/** A „csupasz" (ország-előtag nélküli) CH-slugok — ezt EGY GB/ES-user SEM kaphatja. */
const BARE_CH_SLUGS = new Set(
  Object.values(PERSONALIZE_GUIDE_SLUGS).map((byCountry) => byCountry.CH),
);

describe("PERSONALIZE_GUIDE_SLUGS", () => {
  it("minden JELEN LÉVŐ guide-slug létezik a guides bankban (bármely ország)", () => {
    const known = new Set(GUIDES.map((g) => g.slug));
    for (const [topic, byCountry] of Object.entries(PERSONALIZE_GUIDE_SLUGS)) {
      for (const [c, slug] of Object.entries(byCountry)) {
        expect(known.has(slug), `nem létező slug: ${topic}/${c} → ${slug}`).toBe(true);
      }
    }
  });

  it("a bankszamla+munkavallalas téma MIND A 6 országra ki van kötve (nincs CH-fallthrough ott, ahol VAN cikk)", () => {
    for (const topic of ["bankszamla", "munkavallalas"]) {
      for (const c of COUNTRIES) {
        expect(PERSONALIZE_GUIDE_SLUGS[topic][c], `${topic}/${c} hiányzik`).toBeTruthy();
      }
    }
  });
});

describe("parsePersonalizeProfile", () => {
  it("érvényes profilt visszaad", () => {
    const raw = JSON.stringify({ v: 1, stage: "fresh", focus: "munka" });
    expect(parsePersonalizeProfile(raw)).toEqual({ v: 1, stage: "fresh", focus: "munka" });
  });

  it("null / sérült / ismeretlen érték → null", () => {
    expect(parsePersonalizeProfile(null)).toBeNull();
    expect(parsePersonalizeProfile("nem json")).toBeNull();
    expect(parsePersonalizeProfile(JSON.stringify({ v: 1, stage: "hacker", focus: "munka" }))).toBeNull();
    expect(parsePersonalizeProfile(JSON.stringify({ v: 2, stage: "fresh", focus: "munka" }))).toBeNull();
  });
});

describe("buildPersonalizedItems", () => {
  it("minden stage×focus×ország kombináció: 2-4 elem, href-dedup, teljes mezők", () => {
    for (const c of COUNTRIES) {
      for (const s of STAGE_OPTIONS) {
        for (const f of FOCUS_OPTIONS) {
          const items = buildPersonalizedItems(c, s.id, f.id);
          expect(items.length, `${c}/${s.id}/${f.id}`).toBeGreaterThanOrEqual(2);
          expect(items.length, `${c}/${s.id}/${f.id}`).toBeLessThanOrEqual(4);
          const hrefs = items.map((i) => i.href);
          expect(new Set(hrefs).size, `dup href: ${c}/${s.id}/${f.id}`).toBe(hrefs.length);
          for (const it of items) {
            expect(it.title.length).toBeGreaterThan(3);
            expect(it.desc.length).toBeGreaterThan(3);
            expect(it.href.startsWith("/")).toBe(true);
            expect(it.emoji.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("tervező: Kiköltözési teendőlista az első + Mennyi marad? bekerül", () => {
    const items = buildPersonalizedItems("AT", "planning", "munka");
    expect(items[0].href).toBe("/tudasbazis/kikoltozes");
    // 2026-07-16: a „Mennyi marad?" a /berkalkulator-ba olvadt (kalkulátor-összevonás).
    expect(items.map((i) => i.href)).toContain("/berkalkulator");
  });

  it("friss érkező: bejelentkezés-cikk az első (ország-helyes sluggal)", () => {
    const at = buildPersonalizedItems("AT", "fresh", "penzugy");
    expect(at[0].href).toBe("/tudasbazis/at-bejelentkezes");
    const ch = buildPersonalizedItems("CH", "fresh", "penzugy");
    expect(ch[0].href).toBe("/tudasbazis/bejelentkezes-letelepedes");
  });

  it("friss + papírmunka: a bejelentkezés-cikk NEM duplikálódik", () => {
    const items = buildPersonalizedItems("DE", "fresh", "papirmunka");
    const bej = items.filter((i) => i.href === "/tudasbazis/de-bejelentkezes");
    expect(bej).toHaveLength(1);
    expect(items[0].href).toBe("/tudasbazis/de-bejelentkezes");
  });

  it("NL munkakeresés: nincs német CV-ajánló; AT-ban van", () => {
    const nl = buildPersonalizedItems("NL", "settled", "munka").map((i) => i.href);
    expect(nl).not.toContain("/nemet-oneletrajz");
    const at = buildPersonalizedItems("AT", "settled", "munka").map((i) => i.href);
    expect(at).toContain("/nemet-oneletrajz");
  });

  it("régóta kint + szakember: Kinti Pass pontosan egyszer", () => {
    const items = buildPersonalizedItems("CH", "settled", "szakember");
    expect(items.filter((i) => i.href === "/profil/kinti-pass")).toHaveLength(1);
  });

  /**
   * ⚠️ ORSZÁG-FALLTHROUGH ŐR (a legdrágább hibaosztály): egy GB/ES-user a
   * személyre szabott kezdőlapon SOHA nem kaphat „csupasz" svájci cikket
   * (pl. /tudasbazis/bejelentkezes-letelepedes). Ahol nincs gb-/es- cikk
   * (bejelentkezes, egeszsegbiztositas), ott az adott elem KIMARAD — nem
   * cserélődik svájcira.
   */
  it("⚠️ GB/ES SOHA nem kap csupasz svájci guide-slugot (nincs néma CH-fallthrough)", () => {
    for (const c of ["GB", "ES"]) {
      for (const s of STAGE_OPTIONS) {
        for (const f of FOCUS_OPTIONS) {
          const items = buildPersonalizedItems(c, s.id, f.id);
          for (const it of items) {
            if (it.href.startsWith("/tudasbazis/")) {
              const slug = it.href.replace("/tudasbazis/", "");
              expect(
                BARE_CH_SLUGS.has(slug),
                `${c}/${s.id}/${f.id}: SVÁJCI cikk szivárgott be → ${it.href}`,
              ).toBe(false);
            }
          }
        }
      }
    }
  });

  it("GB/ES munka-fókusz: az ország-helyes bankszámla/munkavállalás cikk jelenik meg", () => {
    const gb = buildPersonalizedItems("GB", "settled", "munka").map((i) => i.href);
    expect(gb).toContain("/tudasbazis/gb-munkavallalas");
    const es = buildPersonalizedItems("ES", "settled", "penzugy").map((i) => i.href);
    expect(es).toContain("/tudasbazis/es-bankszamla");
  });
});
