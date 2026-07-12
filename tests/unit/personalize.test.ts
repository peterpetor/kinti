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

const COUNTRIES = ["CH", "AT", "DE", "NL"];

describe("PERSONALIZE_GUIDE_SLUGS", () => {
  it("minden hivatkozott guide-slug létezik a guides bankban", () => {
    const known = new Set(GUIDES.map((g) => g.slug));
    for (const [topic, byCountry] of Object.entries(PERSONALIZE_GUIDE_SLUGS)) {
      for (const c of COUNTRIES) {
        const slug = byCountry[c];
        expect(slug, `${topic}/${c} hiányzik`).toBeTruthy();
        expect(known.has(slug), `nem létező slug: ${topic}/${c} → ${slug}`).toBe(true);
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
    expect(items[0].href).toBe("/kikoltozes");
    expect(items.map((i) => i.href)).toContain("/mennyi-marad");
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
});
