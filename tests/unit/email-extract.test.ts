import { describe, it, expect } from "vitest";
import { extractEmails, pickBestEmail, companyDomainCandidates, findImpressumLink } from "@/lib/email-extract";

/**
 * A közvetítői eszköz e-mail-kinyerője: a hirdetés-oldal HTML-jéből a legjobb
 * kapcsolattartó címet választja (mailto + szerep-prefix + céghez illő domain),
 * a tracking/no-reply/adatvédelmi címeket kiszűrve.
 */

describe("extractEmails", () => {
  it("mailto-t és nyers szöveges e-mailt is megtalál, dedup", () => {
    const html = `<a href="mailto:bewerbung@boeck.de">Bewerben</a> vagy írj ide: info@boeck.de. bewerbung@boeck.de`;
    const emails = extractEmails(html).map((e) => e.email).sort();
    expect(emails).toEqual(["bewerbung@boeck.de", "info@boeck.de"]);
  });

  it("a mailto-forrást megjelöli (viaMailto)", () => {
    const html = `<a href="mailto:jobs@firma.de">x</a> kontakt@firma.de`;
    const map = Object.fromEntries(extractEmails(html).map((e) => [e.email, e.viaMailto]));
    expect(map["jobs@firma.de"]).toBe(true);
    expect(map["kontakt@firma.de"]).toBe(false);
  });

  it("HTML-entitásos mailto-t dekódol", () => {
    const html = `<a href="mailto:karriere&#64;firma.de">x</a>`;
    expect(extractEmails(html).map((e) => e.email)).toContain("karriere@firma.de");
  });

  it("kép/asset-fájlneveket nem szed fel e-mailként", () => {
    const html = `background:url(logo@2x.png); valos@ceg.de`;
    expect(extractEmails(html).map((e) => e.email)).toEqual(["valos@ceg.de"]);
  });

  it("obfuszkált formákat visszafejt: (at), [dot], (punkt)", () => {
    expect(extractEmails(`bewerbung(at)firma(dot)de`).map((e) => e.email)).toContain("bewerbung@firma.de");
    expect(extractEmails(`info [at] cegnev [dot] de`).map((e) => e.email)).toContain("info@cegnev.de");
    expect(extractEmails(`jobs(at)firma(punkt)at`).map((e) => e.email)).toContain("jobs@firma.at");
  });
});

describe("pickBestEmail — rangsor + szűrés", () => {
  it("a szerep-prefixet (bewerbung@) preferálja az általános fölött", () => {
    const html = `info@boeck.de és bewerbung@boeck.de`;
    expect(pickBestEmail(html, "boeck GmbH")).toBe("bewerbung@boeck.de");
  });

  it("a mailto-forrás megelőzi a nyers szöveges címet holtversenyben", () => {
    const html = `Szöveg: kontakt@firma.de <a href="mailto:office@firma.de">írj</a>`;
    // mindkettő szerep-prefix; a mailto (+2) nyer
    expect(pickBestEmail(html, "Firma")).toBe("office@firma.de");
  });

  it("a céghez illő cégdomain megelőzi a szabad-mail szolgáltatót", () => {
    const html = `bewerbung@gmail.com és bewerbung@boeck.de`;
    expect(pickBestEmail(html, "boeck GmbH")).toBe("bewerbung@boeck.de");
  });

  it("kiszűri a no-reply / datenschutz / tracking címeket", () => {
    const html = `noreply@firma.de datenschutz@firma.de abuse@firma.de bewerbung@firma.de`;
    expect(pickBestEmail(html, "Firma")).toBe("bewerbung@firma.de");
  });

  it("kiszűri a platform/tech domaineket (sentry/wixpress/adzuna)", () => {
    const html = `a1b2@sentry.wixpress.com tracker@adzuna.com jobs@echtefirma.de`;
    expect(pickBestEmail(html, "Echte Firma")).toBe("jobs@echtefirma.de");
  });

  it("null, ha nincs használható cím", () => {
    expect(pickBestEmail(`noreply@firma.de datenschutz@firma.de`, "Firma")).toBeNull();
    expect(pickBestEmail(`nincs itt semmi email`, null)).toBeNull();
  });

  it("holtversenynél a rövidebb (általánosabb) local-part nyer", () => {
    // egyik sem szerep-prefix, nincs cégdomain-egyezés, nincs mailto
    const html = `nagyon.hosszu.kontakt.nev@x.de rovid@x.de`;
    expect(pickBestEmail(html, null)).toBe("rovid@x.de");
  });
});

describe("companyDomainCandidates — cégnév → domain-tippek (Impressum-lookuphoz)", () => {
  it("egyszavas cég → alap .de/.com", () => {
    const d = companyDomainCandidates("Meica", "DE");
    expect(d).toContain("meica.de");
    expect(d).toContain("meica.com");
  });

  it("a jogi utótagokat (GmbH, Vertriebs) elhagyja, több variánst ad", () => {
    const d = companyDomainCandidates("Euro Cheese Vertriebs GmbH", "DE");
    // „vertriebs"/„gmbh" stopszavak → „euro"+„cheese" marad
    expect(d).toContain("eurocheese.de");
    expect(d).toContain("euro-cheese.de");
  });

  it("a Rommelag CDMO tippek közt ott a rommelag.com (valós találat volt)", () => {
    const d = companyDomainCandidates("Rommelag CDMO", "DE");
    expect(d).toContain("rommelag.com");
    expect(d).toContain("rommelag.de");
  });

  it("ország-tudatos TLD (AT → .at, NL → .nl)", () => {
    expect(companyDomainCandidates("Firma", "AT")).toContain("firma.at");
    expect(companyDomainCandidates("Bedrijf", "NL")).toContain("bedrijf.nl");
  });

  it("üres / értelmetlen cégnév → üres lista", () => {
    expect(companyDomainCandidates(null, "DE")).toEqual([]);
    expect(companyDomainCandidates("GmbH & Co. KG", "DE")).toEqual([]);
  });
});

describe("findImpressumLink — a cég főoldaláról az Impressum abszolút URL-je", () => {
  it("relatív /impressum linket abszolúttá old", () => {
    const html = `<a href="/de/impressum">Impressum</a>`;
    expect(findImpressumLink(html, "https://www.rommelag.com/")).toBe("https://www.rommelag.com/de/impressum");
  });

  it("a link SZÖVEGÉBŐL is felismeri (Kontakt), ha a href nem beszédes", () => {
    const html = `<a href="/site/p12">Kontakt</a>`;
    expect(findImpressumLink(html, "https://firma.de/")).toBe("https://firma.de/site/p12");
  });

  it("az Impressumot előnyben részesíti a Kontakt fölött", () => {
    const html = `<a href="/kontakt">Kontakt</a> <a href="/impressum">Impressum</a>`;
    expect(findImpressumLink(html, "https://firma.de/")).toBe("https://firma.de/impressum");
  });

  it("null, ha nincs ilyen link", () => {
    expect(findImpressumLink(`<a href="/jobs">Karriere</a>`, "https://firma.de/")).toBeNull();
  });
});
