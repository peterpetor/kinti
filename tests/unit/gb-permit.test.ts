import { describe, it, expect } from "vitest";
import { evaluatePermit, PERMITS, type WizardAnswers } from "@/lib/permit-wizard";

const ask = (p: Partial<WizardAnswers>): WizardAnswers => ({
  citizenship: "eu", duration: "long", purpose: "work", previousStay: "none", ...p,
});
const gb = (p: Partial<WizardAnswers>) => evaluatePermit(ask(p), "GB");

describe("⚠️ GB letelepedés-varázsló — Brexit után NINCS szabad mozgás", () => {
  it("ÚJ érkező EU-állampolgárnak VÍZUM kell (nem szabad mozgás!)", () => {
    const r = gb({ previousStay: "none", purpose: "work" });
    expect(r.primary).toBe("gb-skilled");
    // a kritikus üzenetnek szerepelnie KELL
    expect(r.notes.join(" ")).toMatch(/Brexit óta.*nem jogosít|nem jogosít/i);
  });

  it("⚠️ REGRESSZIÓ-ŐR: GB-nél SOHA nem jöhet vissza 'szabad mozgás' eredmény", () => {
    const combos: Partial<WizardAnswers>[] = [];
    for (const duration of ["short", "medium", "long", "permanent"] as const)
      for (const purpose of ["work", "study", "family", "retired", "cross-border"] as const)
        for (const previousStay of ["none", "less-than-5", "5-or-more"] as const)
          combos.push({ duration, purpose, previousStay });

    for (const c of combos) {
      const r = gb(c);
      // csak GB-permit jöhet vissza — semmilyen NL/CH/AT/DE típus
      expect(r.primary, JSON.stringify(c)).toMatch(/^gb-/);
      for (const alt of r.alternatives) expect(alt, JSON.stringify(c)).toMatch(/^gb-/);
      // Egyik szöveg sem ÍGÉRHET szabad mozgást. (A „nincs szabad mozgás"
      // tagadó alak viszont helyes és elvárt — ezért csak az ÁLLÍTÓ
      // megfogalmazásokra szűrünk, amiket a CH/NL ágak használnak.)
      const text = r.notes.join(" ").toLowerCase();
      for (const claim of ["szabad mozgásod van", "szabad mozgás alapján", "vrij verkeer", "nincs szükség tartózkodási engedélyre"]) {
        expect(text, `${JSON.stringify(c)} — tiltott állítás: ${claim}`).not.toContain(claim);
      }
    }
  });

  it("2021 ELŐTT érkezett, 5+ év → settled status", () => {
    const r = gb({ previousStay: "5-or-more", duration: "permanent" });
    expect(r.primary).toBe("gb-settled");
    expect(r.notes.join(" ")).toContain("2020. december 31.");
  });

  it("2021 előtt érkezett, 5 év alatt → pre-settled, a váltás kiemelve", () => {
    const r = gb({ previousStay: "less-than-5" });
    expect(r.primary).toBe("gb-presettled");
    // a leggyakoribb hiba: azt hiszik, automatikus a settledre váltás
    expect(r.notes.join(" ")).toMatch(/KÜLÖN kell jelentkezni|nem automatikus/i);
  });

  it("rövid látogatásnál kimondja, hogy DOLGOZNI TILOS", () => {
    const r = gb({ duration: "short", purpose: "study" });
    expect(r.notes.join(" ")).toMatch(/DOLGOZNI TILOS/);
  });

  it("ingázásnál kimondja, hogy nincs ilyen út (nem hallgat róla)", () => {
    const r = gb({ purpose: "cross-border" });
    expect(r.notes.join(" ")).toMatch(/nincs.*ingázó|nincs a svájcihoz hasonló/i);
  });

  it("nyugdíjasnál NEM ígér nem létező vízumot", () => {
    const r = gb({ purpose: "retired" });
    expect(r.notes.join(" ")).toMatch(/NINCS általános/);
  });

  it("tanulónál a Graduate vízum útját is felkínálja", () => {
    const r = gb({ purpose: "study" });
    expect(r.notes.join(" ")).toContain("Graduate");
  });

  it("munkavállalásnál figyelmeztet a munkáltatóhoz kötöttségre és az IHS-re", () => {
    const notes = gb({ purpose: "work" }).notes.join(" ");
    expect(notes).toMatch(/60 nap/);
    expect(notes).toContain("Immigration Health Surcharge");
  });

  it("minden GB-permit-típushoz van teljes leírás", () => {
    for (const t of ["gb-settled", "gb-presettled", "gb-skilled", "gb-other"] as const) {
      const p = PERMITS[t];
      expect(p, t).toBeTruthy();
      expect(p.name.length, t).toBeGreaterThan(3);
      expect(p.pros.length, t).toBeGreaterThan(0);
      expect(p.cons.length, t).toBeGreaterThan(0);
      expect(p.links.length, t).toBeGreaterThan(0);
      // gov.uk-ra kell mutatnia, nem svájci/EU forrásra
      expect(p.links.some((l) => l.url.includes("gov.uk")), t).toBe(true);
    }
  });

  it("a többi ország kiértékelése változatlan (nincs regresszió)", () => {
    expect(evaluatePermit(ask({}), "NL").primary).toMatch(/^nl-/);
    expect(evaluatePermit(ask({}), "CH").primary).not.toMatch(/^gb-/);
  });
});
