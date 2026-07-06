import { describe, it, expect } from "vitest";
import { foldSearchText, hungarianFoldSql, tokenizeFolded, FOLD_PAIRS } from "@/lib/sql-fold";

/**
 * A globális kereső (/api/search) ékezet-érzéketlenségének magja. A needle-t a
 * `foldSearchText` normalizálja, az oszlopokat a `hungarianFoldSql` — a kettőnek
 * BIT-PONTOSAN ugyanazt az eredményt kell adnia, különben a LIKE nem illeszkedik.
 *
 * Itt szimuláljuk az SQL oldalt (a REPLACE-lánc + LOWER JS-ekvivalensével), és a
 * `foldSearchText`-hez mérjük egy valósághű korpuszon — így a két oldal nem
 * csúszhat szét egy jövőbeli szerkesztésnél.
 */

/**
 * A `hungarianFoldSql` REPLACE-láncának + LOWER-jének JS-szimulációja. FONTOS:
 * a SQLite LOWER CSAK ASCII A–Z-t kisbetűsít (nem Unicode), ezért itt is csak
 * azt tesszük — különben a set-en kívüli karakterek (pl. „Œ") hamis eltérést
 * mutatnának a valós SQLite-hoz képest.
 */
function simulateSql(input: string): string {
  let s = input;
  for (const [from, to] of FOLD_PAIRS) s = s.split(from).join(to);
  return s.replace(/[A-Z]/g, (c) => c.toLowerCase());
}

describe("foldSearchText (needle-normalizálás)", () => {
  it("magyar ékezetek → ASCII, kisbetűs", () => {
    expect(foldSearchText("Fodrász")).toBe("fodrasz");
    expect(foldSearchText("Ügyvéd")).toBe("ugyved");
    expect(foldSearchText("Kőműves")).toBe("komuves");
    expect(foldSearchText("FŰTÉS")).toBe("futes");
  });

  it("német / francia ékezetek + ß", () => {
    expect(foldSearchText("Zürich")).toBe("zurich");
    expect(foldSearchText("München")).toBe("munchen");
    expect(foldSearchText("Straße")).toBe("strasse");
    expect(foldSearchText("Genève")).toBe("geneve");
  });

  it("ASCII-t érintetlenül hagy (csak kisbetűsít)", () => {
    expect(foldSearchText("Auto Garage 24")).toBe("auto garage 24");
  });
});

describe("hungarianFoldSql (oszlop-oldal)", () => {
  it("LOWER-be csomagolt REPLACE-lánc a megadott oszlopra", () => {
    const sql = hungarianFoldSql("b.name");
    expect(sql.startsWith("LOWER(")).toBe(true);
    expect(sql).toContain("REPLACE(");
    expect(sql).toContain("b.name");
  });
});

describe("needle ⇄ oszlop illesztés (a két oldal nem csúszhat szét)", () => {
  const corpus = [
    "Fodrász", "Dr. Fülöp Alexander", "Ügyvéd", "Kőműves Bt.",
    "Zürich", "München", "Genève", "Straße 12", "Küng & Söhne",
    "Autószerviz", "Café Élan", "Œuvre", "Angebot GmbH",
    "ÁÉÍÓÖŐÚÜŰ", "áéíóöőúüű", "Bäckerei", "Zoë", "Håkon", "Curaçao",
  ];
  it.each(corpus)("simulateSql == foldSearchText — %s", (s) => {
    expect(simulateSql(s)).toBe(foldSearchText(s));
  });

  it("egy accentes tárolt érték illeszkedik az accent-mentes needle-re", () => {
    // A LIKE mindkét oldala foldolva: a tárolt „Fülöp" oszlop-oldali foldja
    // tartalmazza a needle-oldali „fulop"-ot.
    const stored = simulateSql("Dr. Fülöp Alexander");
    const needle = foldSearchText("fulop");
    expect(stored.includes(needle)).toBe(true);
  });
});

describe("tokenizeFolded (több-szavas AND-keresés)", () => {
  it("szóközök mentén foldolt tokenekre bont", () => {
    expect(tokenizeFolded("fodrász Zürich")).toEqual(["fodrasz", "zurich"]);
    expect(tokenizeFolded("magyar  orvos   Bécs")).toEqual(["magyar", "orvos", "becs"]);
  });

  it("kiszűri a duplikátumokat és a 2-nél rövidebb zaj-tokeneket", () => {
    expect(tokenizeFolded("a fodrász a Zürich")).toEqual(["fodrasz", "zurich"]);
    expect(tokenizeFolded("bolt bolt bolt")).toEqual(["bolt"]);
  });

  it("csak írásjel / 1-betűs szavak → üres (a hívó „nincs találat”-ként kezeli)", () => {
    expect(tokenizeFolded("! ? .")).toEqual([]);
    expect(tokenizeFolded("a b c")).toEqual([]);
  });

  it("a LIKE-metakaraktereket nem engedi tokenbe (nincs jocker-injektálás)", () => {
    expect(tokenizeFolded("100%_akció")).toEqual(["100", "akcio"]);
  });

  it("maxTokens korlátozza a tokenek számát (SQL-méret védelem)", () => {
    expect(tokenizeFolded("egy ketto harom negy ot hat het nyolc", 3)).toEqual(["egy", "ketto", "harom"]);
  });
});
