import { describe, it, expect } from "vitest";
import { evaluatePermit, type WizardAnswers } from "@/lib/permit-wizard";

function answers(partial: Partial<WizardAnswers> = {}): WizardAnswers {
  return {
    citizenship: "eu",
    duration: "permanent",
    purpose: "work",
    previousStay: "none",
    ...partial,
  };
}

describe("evaluatePermit", () => {
  it("ingázó (cross-border) → G, bármi mástól függetlenül", () => {
    const r = evaluatePermit(answers({ purpose: "cross-border", duration: "short", citizenship: "non-eu" }));
    expect(r.primary).toBe("G");
    expect(r.alternatives).toEqual([]);
  });

  it("rövid + EU → nincs engedély (vízummentes 90 nap)", () => {
    const r = evaluatePermit(answers({ duration: "short", citizenship: "eu" }));
    expect(r.primary).toBe("none");
  });

  it("rövid + nem-EU → Schengen-vízum", () => {
    const r = evaluatePermit(answers({ duration: "short", citizenship: "non-eu" }));
    expect(r.primary).toBe("schengen");
  });

  it("tartós + 5+ év előzmény + EU → C, alternatíva B", () => {
    const r = evaluatePermit(answers({ duration: "permanent", previousStay: "5-or-more", citizenship: "eu" }));
    expect(r.primary).toBe("C");
    expect(r.alternatives).toContain("B");
  });

  it("tartós + EU, de még nincs 5 év → B", () => {
    const r = evaluatePermit(answers({ duration: "permanent", previousStay: "less-than-5", citizenship: "eu" }));
    expect(r.primary).toBe("B");
    expect(r.alternatives).toContain("L");
  });

  it("hosszú táv + EU → B (a C-küszöb nem teljesül 'long'-nál)", () => {
    const r = evaluatePermit(answers({ duration: "long", previousStay: "5-or-more", citizenship: "eu" }));
    expect(r.primary).toBe("B");
  });

  it("tartós + nem-EU → B, de kvótás figyelmeztetéssel", () => {
    const r = evaluatePermit(answers({ duration: "permanent", citizenship: "non-eu", previousStay: "none" }));
    expect(r.primary).toBe("B");
    expect(r.notes.join(" ")).toMatch(/kvótás/i);
  });

  it("középtáv → L", () => {
    const r = evaluatePermit(answers({ duration: "medium" }));
    expect(r.primary).toBe("L");
    expect(r.alternatives).toContain("B");
  });

  it("a cél (purpose) befolyásolja a tanácsokat (study → egyetem)", () => {
    const r = evaluatePermit(answers({ duration: "permanent", purpose: "study", citizenship: "eu" }));
    expect(r.notes.join(" ")).toMatch(/egyetem|fogad/i);
  });
});
