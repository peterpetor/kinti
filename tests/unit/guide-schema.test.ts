import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GUIDES, GUIDES_UPDATED_AT, type Guide } from "../../src/lib/guides";
import { GUIDE_CHECKLISTS } from "../../src/lib/guide-checklists";
import {
  guideQaPairs, guideArticleLd, guideFaqLd, guideHowToLd, guideJsonLd, sectionAnchor,
} from "../../src/lib/guide-schema";
import { safeJsonLdStringify } from "../../src/lib/json-ld";

/**
 * Strukturált adat a tudásbázis-cikkekhez (AEO).
 *
 * A JSON-LD-t GÉPEK olvassák, ezért a hibái csendesek: egy hibás séma nem tör
 * el semmit a képernyőn, csak a kereső dobja el (vagy — rosszabb esetben —
 * hamis állítást idéz tőlünk. Ezért a tesztek a TARTALMI helyességre mennek.
 */

const morzsa = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [] };

describe("Article-séma — minden cikkre", () => {
  it.each(GUIDES.slice(0, 8).map((g) => [g.slug, g] as const))("%s: kötelező mezők megvannak", (_slug, g) => {
    const a = guideArticleLd(g as Guide, GUIDES_UPDATED_AT);
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe(g.title);
    expect(a.inLanguage).toBe("hu");
    expect(String(a.url)).toMatch(/^https:\/\/kinti\.app\/tudasbazis\//);
    expect(a.dateModified).toBe(GUIDES_UPDATED_AT.toISOString());
  });

  it("minden cikk kap Article-sémát, üres mező nélkül", () => {
    for (const g of GUIDES) {
      const a = guideArticleLd(g, GUIDES_UPDATED_AT);
      expect(String(a.headline).length, `${g.slug}: üres cím`).toBeGreaterThan(0);
      expect(String(a.description).length, `${g.slug}: üres leírás`).toBeGreaterThan(0);
    }
  });

  it("a hivatalos források `citation`-ként kerülnek be (nem mi vagyunk a hatóság)", () => {
    const g = GUIDES.find((x) => x.sources.length > 0)!;
    const a = guideArticleLd(g, GUIDES_UPDATED_AT) as { citation?: { name: string; url: string }[] };
    expect(a.citation).toBeDefined();
    expect(a.citation!.length).toBe(g.sources.length);
    expect(a.citation![0].url).toBe(g.sources[0].url);
  });

  it("⚠️ NINCS GovernmentService — nem mi nyújtjuk a hatósági szolgáltatást", () => {
    const modul = readFileSync(resolve(process.cwd(), "src/lib/guide-schema.ts"), "utf8");
    // A magyarázó komment említheti; a KIADOTT séma nem tartalmazhatja.
    for (const g of GUIDES.slice(0, 20)) {
      const s = JSON.stringify(guideJsonLd(g, GUIDES_UPDATED_AT, morzsa));
      expect(s, `${g.slug}: GovernmentService került a sémába`).not.toMatch(/"@type":"GovernmentService"/);
    }
    expect(modul, "a döntés indoklása tűnt el a modulból").toMatch(/MIÉRT NINCS `GovernmentService`/);
  });
});

describe("FAQPage — csak valódi kérdés-válasz párból", () => {
  it("⚠️ ahol NINCS kérdés-fejezet, ott NINCS FAQPage (nem gyártunk kérdést)", () => {
    const nincsKerdes = GUIDES.filter((g) => !g.sections.some((s) => s.heading.trim().endsWith("?")));
    expect(nincsKerdes.length, "nem sikerült ilyen cikket találni — a teszt vak lenne").toBeGreaterThan(50);
    for (const g of nincsKerdes) {
      expect(guideFaqLd(g), `${g.slug}: FAQPage keletkezett kérdés nélkül`).toBeNull();
    }
  });

  it("ahol VAN, ott a kérdések és válaszok nem üresek", () => {
    const van = GUIDES.filter((g) => guideFaqLd(g) != null);
    expect(van.length, "egyetlen cikk sem kapott FAQPage-t").toBeGreaterThan(20);
    for (const g of van) {
      const faq = guideFaqLd(g) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
      expect(faq.mainEntity.length).toBeGreaterThan(0);
      for (const q of faq.mainEntity) {
        expect(q.name.trim().length, `${g.slug}: üres kérdés`).toBeGreaterThan(8);
        expect(q.name.trim().endsWith("?"), `${g.slug}: a kérdés nem kérdőjelre végződik: ${q.name}`).toBe(true);
        expect(q.acceptedAnswer.text.trim().length, `${g.slug}: üres válasz`).toBeGreaterThan(30);
      }
    }
  });

  it("⚠️ minden kérdés ÖNMAGÁBAN értelmezhető (nem „Mi az?”)", () => {
    const altalanos = [/^mi az\?$/i, /^ki jogosult\?$/i, /^hogyan működik\?$/i, /^mire figyelj\?$/i, /^mire jó a gyakorlatban\?$/i, /^mennyi\?$/i];
    const rossz: string[] = [];
    for (const g of GUIDES) {
      for (const p of guideQaPairs(g)) {
        if (altalanos.some((re) => re.test(p.kerdes.trim()))) rossz.push(`${g.slug}: ${p.kerdes}`);
      }
    }
    expect(rossz, `kontextus nélküli kérdések: ${rossz.join(" | ")}`).toEqual([]);
  });

  it("nincs duplikált kérdés egy cikken belül", () => {
    for (const g of GUIDES) {
      const k = guideQaPairs(g).map((p) => p.kerdes);
      const dup = k.filter((x, i) => k.indexOf(x) !== i);
      expect(dup, `${g.slug}: duplikált kérdés`).toEqual([]);
    }
  });
});

describe("rövid válasz — mondathatár", () => {
  it("⚠️ NEM vág el magyar rövidítésnél („pl.”, „kb.”)", () => {
    const csonka: string[] = [];
    for (const g of GUIDES) {
      for (const p of guideQaPairs(g)) {
        if (/\b(pl|kb|ill|stb|min|max|ld)\.$/i.test(p.rovid)) csonka.push(`${g.slug}: ${p.rovid}`);
      }
    }
    expect(csonka, `rövidítésnél elvágott válasz: ${csonka.join(" | ")}`).toEqual([]);
  });

  it("⚠️ nem hagy NYITOTT zárójelet a válasz végén", () => {
    const rossz: string[] = [];
    for (const g of GUIDES) {
      for (const p of guideQaPairs(g)) {
        const ny = (p.rovid.match(/\(/g) ?? []).length;
        const zar = (p.rovid.match(/\)/g) ?? []).length;
        if (ny > zar) rossz.push(`${g.slug}: ${p.rovid}`);
      }
    }
    expect(rossz, `nyitva maradt zárójel: ${rossz.slice(0, 3).join(" | ")}`).toEqual([]);
  });

  it("a rövid válasz tényleg rövid, de nem csonka szó", () => {
    for (const g of GUIDES) {
      for (const p of guideQaPairs(g)) {
        expect(p.rovid.length, `${g.slug}: túl hosszú rövid-válasz`).toBeLessThanOrEqual(221);
        expect(p.rovid.trim().length, `${g.slug}: üres rövid-válasz`).toBeGreaterThan(10);
      }
    }
  });
});

/**
 * ⚠️ A LEGCSENDESEBB HIBA. A „Részletek" link a fejezet horgonyára ugrik. Ha a
 * `sectionAnchor` és a cikkoldal `sectionId`-je elcsúszik, a link SEMMIT nem
 * csinál — hibaüzenet nélkül. A két implementációnak egyeznie kell.
 */
describe("horgony-egyezés a cikkoldallal", () => {
  const oldal = readFileSync(resolve(process.cwd(), "src/app/(app)/tudasbazis/[slug]/page.tsx"), "utf8");

  /*
   * ⚠️ EZ A TESZT KORÁBBAN VAK VOLT. Csak azt nézte, hogy a lap forrásában
   * szerepel-e az „NFD" és a „[^a-z0-9]+" — és emiatt NEM vette észre, hogy a
   * lap a végére még odateszi az INDEXET is (`…-0`), a séma-modul viszont nem.
   * A „Részletek" linkek némán nem működtek. Most a lap NEM képezhet saját
   * horgonyt: a közös `sectionAnchor`-t kell használnia.
   */
  it("⚠️ a cikkoldal NEM képez saját horgonyt, a közöset használja", () => {
    expect(oldal, "a lap visszamásolt egy saját sectionId-implementációt — el fog csúszni").not.toMatch(
      /function sectionId\s*\(/,
    );
    expect(oldal, "a lap nem a közös sectionAnchor-t használja").toMatch(/sectionAnchor/);
  });

  it("a horgony tartalmazza a sorszámot (a valós DOM-id ilyen)", () => {
    expect(sectionAnchor("Mi az az ID Austria?", 0)).toBe("mi-az-az-id-austria-0");
    expect(sectionAnchor("Hogyan igényeld?", 1)).toBe("hogyan-igenyeld-1");
    // Ékezet/írásjel nélküli cím se adjon üres horgonyt.
    expect(sectionAnchor("???", 2)).toBe("szakasz-2");
  });

  it("minden Q&A horgony egy VALÓS fejezet horgonyára mutat", () => {
    for (const g of GUIDES) {
      const horgonyok = new Set(g.sections.map((s, i) => sectionAnchor(s.heading, i)));
      for (const p of guideQaPairs(g)) {
        expect(horgonyok.has(p.anchor), `${g.slug}: a „${p.kerdes}” horgonya (${p.anchor}) nem létező fejezetre mutat`).toBe(true);
      }
    }
  });
});

describe("HowTo — a kurált teendőlistából", () => {
  it("pontosan azok a cikkek kapnak HowTo-t, amelyeknek VAN teendőlistájuk", () => {
    const howto = GUIDES.filter((g) => guideHowToLd(g) != null).map((g) => g.slug).sort();
    const listas = Object.keys(GUIDE_CHECKLISTS).sort();
    expect(howto).toEqual(listas);
  });

  it("a lépések sorrendben és hiánytalanul kerülnek be", () => {
    const g = GUIDES.find((x) => x.slug === "bejelentkezes-letelepedes")!;
    const h = guideHowToLd(g) as { step: { position: number; name: string; text: string }[] };
    const lista = GUIDE_CHECKLISTS["bejelentkezes-letelepedes"];
    expect(h.step).toHaveLength(lista.length);
    expect(h.step.map((s) => s.position)).toEqual(lista.map((_, i) => i + 1));
    expect(h.step[0].name).toBe(lista[0].text);
    expect(h.step[0].text, "a tipp is bekerül a lépés szövegébe").toContain(lista[0].hint ?? lista[0].text);
  });
});

describe("kimenet biztonsága és érvényessége", () => {
  it("a szerializált JSON-LD nem tartalmaz nyers `<` jelet (script-kitörés)", () => {
    for (const g of GUIDES) {
      const s = safeJsonLdStringify(guideJsonLd(g, GUIDES_UPDATED_AT, morzsa));
      expect(s.includes("<"), `${g.slug}: escape-eletlen < a JSON-LD-ben`).toBe(false);
      expect(s.includes("</script"), `${g.slug}: script-záró a JSON-LD-ben`).toBe(false);
    }
  });

  it("a kiadott tömb minden eleme érvényes séma-objektum", () => {
    for (const g of GUIDES) {
      const tomb = guideJsonLd(g, GUIDES_UPDATED_AT, morzsa);
      expect(tomb.length, `${g.slug}: üres JSON-LD`).toBeGreaterThanOrEqual(2); // morzsa + Article
      for (const x of tomb) {
        const o = x as Record<string, unknown>;
        expect(o["@type"], `${g.slug}: @type nélküli séma`).toBeTruthy();
        expect(JSON.parse(JSON.stringify(o))).toBeTruthy(); // körkörös hivatkozás nincs
      }
    }
  });

  it("a speakable csak ott van, ahol tényleg van „Röviden” blokk", () => {
    for (const g of GUIDES) {
      const a = guideArticleLd(g, GUIDES_UPDATED_AT) as { speakable?: unknown };
      const vanTldr = !!g.tldr && g.tldr.length > 0;
      expect(!!a.speakable, `${g.slug}: speakable/tldr eltérés`).toBe(vanTldr);
    }
  });

  it("⚠️ a `data-speakable` horgony TÉNYLEG ott van a cikkoldalon", () => {
    const oldal = readFileSync(resolve(process.cwd(), "src/app/(app)/tudasbazis/[slug]/page.tsx"), "utf8");
    expect(oldal, "a speakable CSS-szelektor nem talál semmit — a séma hazudna").toMatch(/data-speakable/);
  });
});
