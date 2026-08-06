import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Hosszú, szóköz nélküli szavak tördelése.
 *
 * ⚠️ VALÓS, KÉPERNYŐFOTÓVAL IGAZOLT HIBA (2026-08-06). Az „Adóelszámolás
 * (Arbeitnehmerveranlagung)" cím KILÓGOTT a kártyából telefonon — élesben mérve
 * 20 px-szel. A német összetett szó 23 betű, szóköz nélkül: nem volt hol törni.
 *
 * ⚠️ EZ NEM EGYEDI ESET, HANEM A TARTALOM TERMÉSZETE. Az app öt német nyelvű
 * országban működik, és a hivatali szókincs csupa ilyen szóból áll. Egy helyen
 * javítani értelmetlen lett volna: a következő hosszú szó a következő kártyából
 * lógna ki.
 */

const GYOKER = resolve(__dirname, "../..");
const CSS = readFileSync(resolve(GYOKER, "src/app/globals.css"), "utf8").replace(/\r\n/g, "\n");

describe("globális tördelés-szabály", () => {
  it("a címsorok és a bekezdések tördelnek", () => {
    const m = CSS.match(/h1, h2, h3, h4, h5, h6, p, li, dt, dd \{\s*\n\s*overflow-wrap:\s*(\S+);/);
    expect(m, "nincs globális overflow-wrap szabály").not.toBeNull();
    expect(m![1]).toBe("break-word");
  });

  it("⚠️ `break-word` és NEM `anywhere`", () => {
    // A `break-word` CSAK akkor tör szót, ha az különben kilógna, és nem
    // számít bele a min-content szélességbe — a meglévő flex/grid elrendezéseket
    // tehát nem mozdítja el. Az `anywhere` a rácsok arányait is átrendezhetné.
    const i = CSS.indexOf("h1, h2, h3, h4, h5, h6, p, li, dt, dd {");
    expect(CSS.slice(i, i + 120)).not.toContain("anywhere");
  });

  it("⚠️ NINCS `hyphens: auto` (a lap magyar, a szavak németek)", () => {
    // A böngésző a `lang` szerint szótagol. A lap `lang="hu"`, tehát MAGYAR
    // szabályokat alkalmazna a német szavakra — rosszabb helyen törne, mint
    // ahol most nem tör sehol.
    const i = CSS.indexOf("h1, h2, h3, h4, h5, h6, p, li, dt, dd {");
    expect(CSS.slice(i, i + 160)).not.toContain("hyphens");
  });
});

describe("a valós eset", () => {
  it("a leghosszabb hivatali szavak léteznek a tartalomban", () => {
    // Ha ezek eltűnnének, a szabály feleslegessé válna — de amíg megvannak,
    // a tördelésnek működnie kell.
    const cl = readFileSync(resolve(GYOKER, "src/lib/admin-checklists.ts"), "utf8");
    const hosszuak = (cl.match(/[A-ZÄÖÜ][a-zäöüß]{17,}/g) ?? []).filter(
      (sz, i, t) => t.indexOf(sz) === i,
    );
    expect(hosszuak.length, "nincs 18+ betűs német szó a csekklistákban").toBeGreaterThan(0);
    // A konkrét eset, ami a hibát okozta.
    expect(cl).toContain("Arbeitnehmerveranlagung");
  });
});

describe("natív választó (select) szélessége", () => {
  /**
   * ⚠️ MÉRT HIBÁBÓL. Az Iránytű űrlapja 56 px-szel lógott ki 360 px-es
   * képernyőn. A `<select>` alapértelmezett MINIMÁLIS szélessége a leghosszabb
   * opció szerint alakul („Pénzügy / Bank / Biztosítás", 27 karakter), és ezt a
   * `w-full` sem tudja összenyomni.
   */
  it("a select `min-width: 0`-t kap", () => {
    expect(CSS).toMatch(/select \{\s*\n\s*min-width:\s*0;/);
  });

  it("⚠️ a szöveg-levágás ÖNMAGÁBAN nem elég — mindkét szabály kell", () => {
    // A `text-overflow` csak a SZÖVEGET vágja, a dobozt nem szűkíti; a
    // `min-width: 0` csak a korlátot veszi le, de nem csonkol. Együtt működnek.
    expect(CSS).toContain("text-overflow: ellipsis");
    expect(CSS).toMatch(/select \{\s*\n\s*min-width:\s*0;/);
  });

  it("a leghosszabb opció tényleg létezik (különben a szabály felesleges)", () => {
    const meta = readFileSync(resolve(GYOKER, "src/lib/benchmark-meta.ts"), "utf8");
    const opciok = meta.match(/"[^"]{20,}"/g) ?? [];
    expect(opciok.length, "nincs 20+ karakteres opció").toBeGreaterThan(0);
  });
});
