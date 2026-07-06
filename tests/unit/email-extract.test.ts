import { describe, it, expect } from "vitest";
import { extractEmails, pickBestEmail } from "@/lib/email-extract";

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
