import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A landing ár-állításainak és gombjainak őre.
 *
 * ⚠️ KÉT HIBA (2026-08-02, user-jelzés):
 *
 * 1. AZ ÁR-SZÖVEG VALÓTLAN VOLT. A landing „nettó + ÁFA" árat hirdetett, de
 *    MINDKÉT fizetési út BRUTTÓBAN áraz — élesben ellenőrizve:
 *      • Paddle (web): DE 15,97 + 3,03 = 19,00 € (a `total` a végösszeg)
 *      • Google Play:  a Console szerint a VAT-kötelezettség a GOOGLE-é, és a
 *        magyar ár „8690 Ft, 1847 Ft adót tartalmaz" (27% BELÜL van)
 *    Vagyis a feltüntetett összeg az, amit a vásárló fizet.
 *
 * 2. A HÁROM ÁR-GOMB HALOTT VOLT: `<button class="price-cta">` link és
 *    kattintás-kezelő NÉLKÜL. Kattintásra csak a CSS-effekt „villant" —
 *    a landing teljes fizetési tölcsére vakvágányon állt.
 *
 * ⚠️ A LEGFONTOSABB CSAPDA: a landing HÁROMNYELVŰ, és az i18n-motor kulcsa a
 * TAG-MENTESÍTETT magyar szöveg (`landing-i18n.js`, `norm(innerHTML)`). Ha a
 * magyar szöveget úgy írod át, hogy a kulcsot nem, a német/angol nézet NÉMÁN
 * magyarul marad — nincs hibaüzenet, nincs üres string.
 */
const HTML = readFileSync(resolve(process.cwd(), "public/landing.html"), "utf8");
const I18N = readFileSync(resolve(process.cwd(), "public/landing-i18n.js"), "utf8");

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const strip = (s: string) => norm(s.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""));

describe("landing — az ár tartalmazza az ÁFÁ-t", () => {
  it("nincs többé „nettó + ÁFA” jellegű állítás", () => {
    for (const re of [/nettó \+ ÁFA/i, /Nettó árak \(ÁFA nélkül\)/i, /netto \+ MwSt/i, /net \+ VAT/i]) {
      expect(HTML, `landing.html: ${re}`).not.toMatch(re);
      expect(I18N, `landing-i18n.js: ${re}`).not.toMatch(re);
    }
  });

  it("mindhárom nyelven ki van mondva az ÁFA-tartalom", () => {
    expect(HTML).toMatch(/tartalmazzák az ÁFÁ-t/);
    expect(I18N).toMatch(/enthalten die MwSt\.|inkl\. MwSt\./);
    expect(I18N).toMatch(/include VAT|incl\. VAT/);
  });
});

describe("landing — az ár-gombok tényleg vezetnek valahova", () => {
  it("nincs kezelő nélküli price-cta gomb", () => {
    expect(HTML, "a <button class=\"price-cta\"> nem csinál semmit").not.toMatch(
      /<button class="price-cta"/,
    );
  });

  it("mindhárom ár-kártya CTA-ja a /pro-ra visz", () => {
    const linkek = HTML.match(/<a class="price-cta" href="\/pro">/g) ?? [];
    expect(linkek.length).toBe(3);
  });

  it("a link-változat megtartja a gomb-kinézetet", () => {
    // Az <a> alapból inline — enélkül összeesne a teljes szélességű pirula.
    const css = HTML.slice(HTML.indexOf(".price-cta {"), HTML.indexOf(".price-cta {") + 220);
    expect(css).toContain("display: block");
    expect(css).toContain("text-align: center");
    expect(css).toContain("text-decoration: none");
  });
});

describe("⚠️ landing i18n — a magyar szöveg és a fordítás-kulcs együtt mozog", () => {
  /** A módosított, hosszú blokkok: a kulcsnak a tag-mentes szöveggel kell egyeznie. */
  const BLOKKOK: Array<[string, RegExp]> = [
    ["ár-bevezető (sec-sub)", /<p class="sec-sub">A keresés, a profilok[\s\S]*?<\/p>/],
    ["GYIK ár-válasz (faq-a)", /<div class="faq-a">A <strong>Kinti PRO<\/strong> magánszemélyeknek[\s\S]*?<\/div>/],
  ];

  for (const [nev, re] of BLOKKOK) {
    it(`${nev} — van hozzá i18n-kulcs`, () => {
      const m = HTML.match(re);
      expect(m, `nem találom a blokkot: ${nev}`).toBeTruthy();
      const szoveg = strip(m![0].replace(/^<(p|div)[^>]*>/, "").replace(/<\/(p|div)>$/, ""));
      // Az első 150 karakter elég egyedi; a teljes egyezést a motor futásidőben
      // amúgy is normalizálja.
      expect(
        I18N.includes(szoveg.slice(0, 150)),
        `${nev}: a magyar szöveg megváltozott, de az i18n-kulcs nem — a DE/EN nézet magyarul maradna`,
      ).toBe(true);
    });
  }

  it("a rövid ár-címkékhez is van kulcs", () => {
    for (const cimke of ["/ hó · ÁFÁ-val", "/ hirdetés · egyszeri, ÁFÁ-val"]) {
      expect(HTML, `hiányzik a landingről: ${cimke}`).toContain(cimke);
      expect(I18N, `nincs i18n-kulcs: ${cimke}`).toContain(`add('${cimke}'`);
    }
  });
});
