import { describe, it, expect } from "vitest";
import { encodeContact, decodeContact } from "@/lib/contact-obfuscate";
import { hasContactInfo } from "@/lib/address";

describe("contact-obfuscate — reverzibilis elhomályosítás", () => {
  it("oda-vissza kódol (round-trip)", () => {
    for (const raw of ["+41 79 123 45 67", "+36301234567", "044 555 66 77", "0"]) {
      expect(decodeContact(encodeContact(raw))).toBe(raw);
    }
  });

  it("a kódolt token NEM tartalmazza nyersen a számot (anti-regex)", () => {
    const raw = "+41791234567";
    const enc = encodeContact(raw);
    expect(enc).not.toContain("791234567");
    expect(enc).not.toBe(raw);
    // klasszikus telefon-regex a kódolt tokenen NEM talál egybefüggő számot
    expect(/\+?\d[\d ]{6,}/.test(enc)).toBe(false);
  });

  it("hibás token → üres string (nem dob)", () => {
    expect(decodeContact("!!!not-base64!!!")).toBe("");
  });
});

describe("hasContactInfo — a hasPhone bool is számít (bulk lista-vetület)", () => {
  it("ListBusiness alak: hasPhone=true elérhetőségnek számít", () => {
    expect(hasContactInfo({ address: null, blurb: null, hasPhone: true })).toBe(true);
    expect(hasContactInfo({ address: null, blurb: null, hasPhone: false })).toBe(false);
  });

  it("full alak: a nyers phone továbbra is számít", () => {
    expect(hasContactInfo({ address: null, blurb: null, phone: "+41 79 000" })).toBe(true);
    expect(hasContactInfo({ address: null, blurb: null, phone: "  " })).toBe(false);
  });

  it("cím vagy weboldal önmagában is elég", () => {
    expect(hasContactInfo({ address: "Bahnhofstrasse 1, 8001 Zürich", hasPhone: false })).toBe(true);
  });
});
