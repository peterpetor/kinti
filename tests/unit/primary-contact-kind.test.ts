import { describe, it, expect } from "vitest";
import { primaryContactKind, extractContactFromBlurb } from "@/lib/contact-links";

/**
 * A cégadatlap KIEMELT (kék) gombjának kiválasztása.
 *
 * Miért van erre teszt: a tényleges forgalomban a megnézett cégek nagyjából
 * felénél NINCS telefonszám, és amíg kizárólag a telefon kaphatta a kiemelt
 * stílust, ezeken az adatlapokon egyetlen gomb sem jelölte ki a következő
 * lépést. A sorrend tehát terméktulajdonság, nem kozmetika.
 */
describe("primaryContactKind — a kiemelt kapcsolat-gomb kiválasztása", () => {
  it("a telefon mindent megelőz", () => {
    expect(
      primaryContactKind({ phone: "+43 1 234", website: "https://a.hu", email: "a@b.hu" }),
    ).toBe("phone");
  });

  it("telefon nélkül a weboldal lép elő", () => {
    expect(primaryContactKind({ phone: null, website: "https://a.hu", email: "a@b.hu" })).toBe(
      "website",
    );
  });

  it("telefon és weboldal nélkül az e-mail", () => {
    expect(primaryContactKind({ phone: null, website: null, email: "a@b.hu" })).toBe("email");
  });

  it("semmilyen elérhetőség nélkül null (zsákutca-adatlap)", () => {
    expect(primaryContactKind({})).toBe(null);
    expect(primaryContactKind({ phone: null, website: null, email: null })).toBe(null);
  });

  it("a CSUPA SZÓKÖZ mező nem számít elérhetőségnek", () => {
    // A D1-ben több sor tárol üres helyett szóközt — enélkül egy üres gomb
    // kapná a kiemelt stílust, és a valódi csatorna maradna szürkén.
    expect(primaryContactKind({ phone: "   ", website: "https://a.hu" })).toBe("website");
    expect(primaryContactKind({ phone: "", website: "  ", email: "a@b.hu" })).toBe("email");
    expect(primaryContactKind({ phone: " ", website: " ", email: " " })).toBe(null);
  });

  it("együtt működik a blurb-ből kinyert kontakttal (a valódi hívási mód)", () => {
    // Ez a tipikus seedelt sor: a weboldal a leírás végén áll, protokoll nélkül.
    const c = extractContactFromBlurb("Magyar egyesület · Salzburg · magyaregylet.at");
    expect(c.website).toBe("https://magyaregylet.at");
    expect(primaryContactKind({ phone: null, website: c.website, email: c.email })).toBe("website");
  });
});

/**
 * ⚠️ A seed-pipeline több száz sornál CSAK a webcímet írta a leírásba,
 * ` · ` elválasztó NÉLKÜL. A régi parser legalább két szegmenst várt, ezért
 * 35 élő cégnél a weboldal nyers szövegként állt a leírás helyén, és nem lett
 * belőle „Weboldal" gomb — kívülről zsákutcának látszottak.
 */
describe("extractContactFromBlurb — az EGYSZEGMENSŰ, csupa-URL leírás", () => {
  it("a csak webcímet tartalmazó leírásból weboldal lesz, nem szöveg", () => {
    const c = extractContactFromBlurb("www.gasthaus-nachbarn.at");
    expect(c.website).toBe("https://www.gasthaus-nachbarn.at");
    expect(c.blurb).toBe(null);
  });

  it("teljes URL-t is felismer, és nem tesz elé második sémát", () => {
    const c = extractContactFromBlurb("https://budapestbagel.com");
    expect(c.website).toBe("https://budapestbagel.com");
    expect(c.blurb).toBe(null);
  });

  it("egyszegmensű e-mailt is felismer (mailto: prefix nélkül adja vissza)", () => {
    const c = extractContactFromBlurb("mailto:info@pelda.hu");
    expect(c.email).toBe("info@pelda.hu");
    expect(c.website).toBe(null);
    expect(c.blurb).toBe(null);
  });

  it("VALÓDI leírást NEM nyel le, még ha van benne pont is", () => {
    // Ez a legfontosabb regresszió-védelem: a mondat nem lehet „weboldal".
    for (const prose of [
      "Magyar autószerviz Salzburgban. Általános javítás, diagnosztika.",
      "Integratív pszichoterápia, coaching. www.psychotherapie-lak.at",
      "Bécs",
    ]) {
      const c = extractContactFromBlurb(prose);
      expect(c.website).toBe(null);
      expect(c.blurb).toBe(prose);
    }
  });

  it("a többszegmensű viselkedés változatlan", () => {
    expect(extractContactFromBlurb("Leírás · Bécs").website).toBe(null);
    expect(extractContactFromBlurb("Leírás · Bécs").blurb).toBe("Leírás · Bécs");
    expect(extractContactFromBlurb("Leírás · pelda.hu").blurb).toBe("Leírás");
  });
});
