import { describe, it, expect } from "vitest";
import { externalJobDedupeKey, dedupeByKey } from "@/lib/external-job-url";

/**
 * Az `external_jobs` ütközés-kulcsa eredetileg a TELJES `source_url` volt, és ez
 * élesben nem működött: az Adzuna és a Jooble kérésenként új követő-paramétert
 * ad ugyanarra az állásra, így minden szinkron-futás újra beszúrta. 7227 sorból
 * 3294 volt egyedi; a felhasználó ugyanazt a hirdetést akár 23× látta.
 *
 * A lenti URL-ek VALÓDI, éles adatból származó minták.
 */
describe("externalJobDedupeKey — a követő-paraméterek nem képezhetnek új állást", () => {
  it("a Jooble ugyanazon állásának minden keresőszó-változata EGY kulcs", () => {
    const variants = [
      "https://jooble.org/desc/5648897931892607810?ckey=Warehouse&rgn=55127&pos=10&groupId=37059&elckey=7475792915537581327&p=1",
      "https://jooble.org/desc/5648897931892607810?ckey=Cleaner&rgn=55127&pos=5&groupId=10852&elckey=7525827699106848507&p=1&aq",
      "https://jooble.org/desc/5648897931892607810?ckey=Labourer&rgn=55127&pos=1&groupId=33607&elckey=4235384294040210610&p=1&a",
    ];
    const keys = new Set(variants.map(externalJobDedupeKey));
    expect(keys.size).toBe(1);
    expect([...keys][0]).toBe("jooble.org/desc/5648897931892607810");
  });

  it("az Adzuna futásonként változó `se`/`v` hash-e sem számít", () => {
    const a = externalJobDedupeKey(
      "https://www.adzuna.at/land/ad/5809309067?se=9NEFc-yG8RGHA8-bQDRAcg&utm_medium=api&utm_source=5be41e40&v=DE43B0CE248C9BE55F84C6B1C1DA7771478CD259",
    );
    const b = externalJobDedupeKey(
      "https://www.adzuna.at/land/ad/5809309067?se=XXXX&utm_medium=api&utm_source=5be41e40&v=FFFFFFFF",
    );
    expect(a).toBe(b);
    // A `www.` előtag is lekerül — így a séma-/www-változat sem duplikál.
    expect(a).toBe("adzuna.at/land/ad/5809309067");
  });

  it("KÜLÖNBÖZŐ állásokat NEM olvaszt össze (ez a veszélyes irány)", () => {
    expect(externalJobDedupeKey("https://www.adzuna.at/land/ad/5809309067")).not.toBe(
      externalJobDedupeKey("https://www.adzuna.at/land/ad/5758073263"),
    );
    expect(externalJobDedupeKey("https://jooble.org/desc/111")).not.toBe(
      externalJobDedupeKey("https://jooble.org/desc/222"),
    );
  });

  it("a job-room (közvetlen munkáltatói URL) kulcsa stabil, záró / nélkül", () => {
    const withSlash = "https://med-ipersonal.ch/jobs/dipl-expertin-anaesthesiepflege-gesucht/";
    const without = "https://med-ipersonal.ch/jobs/dipl-expertin-anaesthesiepflege-gesucht";
    expect(externalJobDedupeKey(withSlash)).toBe(externalJobDedupeKey(without));
  });

  it("üres/hibás bemenetre nem dob, és nem ad ütköző üres kulcsot értelmes URL-re", () => {
    expect(externalJobDedupeKey(null)).toBe("");
    expect(externalJobDedupeKey("")).toBe("");
    expect(externalJobDedupeKey("   ")).toBe("");
    // Séma nélküli bemenet: ugyanaz a vágás, mint a migráció ELSE-ága.
    expect(externalJobDedupeKey("jooble.org/desc/42?ckey=X")).toBe("jooble.org/desc/42");
  });
});

describe("dedupeByKey — kötegen belüli szűkítés", () => {
  const j = (sourceUrl: string, category: string) => ({ sourceUrl, category });

  it("az ELSŐ előfordulást tartja meg (stabil kategória)", () => {
    const out = dedupeByKey([
      j("https://jooble.org/desc/1?ckey=Warehouse", "logisztika"),
      j("https://jooble.org/desc/1?ckey=Cleaner", "takaritas"),
      j("https://jooble.org/desc/2?ckey=Cook", "vendeglatas"),
    ]);
    expect(out).toHaveLength(2);
    // ⚠️ Nem az utolsó nyer: így a hirdetés nem ugrál kategóriák között.
    expect(out[0].category).toBe("logisztika");
    expect(out[1].category).toBe("vendeglatas");
  });

  it("a kulcs nélküli (üres URL-ű) tételt kihagyja, nem ütközteti", () => {
    const out = dedupeByKey([j("", "a"), j("", "b"), j("https://jooble.org/desc/9", "c")]);
    expect(out).toHaveLength(1);
    expect(out[0].category).toBe("c");
  });
});
