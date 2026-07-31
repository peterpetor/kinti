import { describe, it, expect } from "vitest";
import {
  matchesSearchQuery,
  tokenMatches,
  relaxSearchQuery,
  MIN_STEM,
  MAX_TRIM,
} from "@/lib/search-match";
import { foldSearchText } from "@/lib/sql-fold";

/**
 * A kereső szó-szintű illesztésének őre.
 *
 * ⚠️ A VALÓDI HIBA, amit ez javított (2026-08-01, élő adaton mérve, 3 bécsi
 * fodrászon): a régi `blob.includes(needle)` egyetlen ÖSSZEFÜGGŐ részláncot
 * keresett, ezért
 *     „fodrász"       → 3 találat
 *     „fodrász bécs"  → 1  (csak ahol véletlenül egymás mellett állt)
 *     „bécsi fodrász" → 0  ← a természetes magyar szórend
 *     „fodrász wien"  → 0
 * Ez az app legfőbb útvonala — némán hibázott. Ha valaki visszaírja
 * `includes`-ra, ezek a tesztek buknak.
 */

/** Valós blob-minta (a searchIndex ugyanígy épül: név + kategória + blurb + cím). */
const BLOB = foldSearchText(
  "Ákos Polgár Hairstylist Fodrász Magyar fodrász Bécs 7. kerületében. " +
    "Modern hajvágások, balayage · Kirchengasse 27, 1070 Wien",
);
const q = (s: string) => foldSearchText(s.trim());

describe("kereső — szó-szintű illesztés", () => {
  it("egy szó ugyanúgy működik, mint eddig", () => {
    expect(matchesSearchQuery(BLOB, q("fodrász"))).toBe(true);
    expect(matchesSearchQuery(BLOB, q("fodrasz"))).toBe(true); // ékezet nélkül
    expect(matchesSearchQuery(BLOB, q("pék"))).toBe(false);
  });

  it("⚠️ több szó TETSZŐLEGES SORRENDBEN talál", () => {
    expect(matchesSearchQuery(BLOB, q("fodrász bécs"))).toBe(true);
    expect(matchesSearchQuery(BLOB, q("bécs fodrász"))).toBe(true);
    expect(matchesSearchQuery(BLOB, q("fodrász wien"))).toBe(true);
    expect(matchesSearchQuery(BLOB, q("wien magyar fodrász"))).toBe(true);
  });

  it("⚠️ a természetes magyar szórend/toldalék is talál", () => {
    expect(matchesSearchQuery(BLOB, q("bécsi fodrász"))).toBe(true);
    expect(matchesSearchQuery(BLOB, q("fodrászt"))).toBe(true);
  });

  it("MINDEN szónak szerepelnie kell (AND, nem OR)", () => {
    // A „fodrász" illeszkedik, a „müncheni" nem → nincs találat.
    expect(matchesSearchQuery(BLOB, q("fodrász müncheni"))).toBe(false);
    expect(matchesSearchQuery(BLOB, q("fogorvos bécs"))).toBe(false);
  });

  it("üres keresés mindent enged (nem szűr)", () => {
    expect(matchesSearchQuery(BLOB, "")).toBe(true);
    expect(matchesSearchQuery(BLOB, q("   "))).toBe(true);
  });

  it("írásjel/több szóköz nem zavarja", () => {
    expect(matchesSearchQuery(BLOB, q("fodrász,   bécs"))).toBe(true);
  });
});

describe("kereső — toldalék-tűrés határai", () => {
  it("a szó VÉGÉT rövidíti, ha nincs pontos találat", () => {
    expect(tokenMatches("munchen", "munchenben")).toBe(true);
    expect(tokenMatches("becs", "becsi")).toBe(true);
  });

  it("⚠️ MIN_STEM alá NEM vág vissza (különben zajos lenne)", () => {
    expect(MIN_STEM).toBe(4);
    // „abcdefg" → legfeljebb „abcd"-ig; a blobban csak „abc" van → nincs találat.
    expect(tokenMatches("abc", "abcdefg")).toBe(false);
  });

  it("⚠️⚠️ MAX_TRIM: a csonkolás nem lőhet át a célon", () => {
    expect(MAX_TRIM).toBe(4);
    // Ez a konkrét eset buktatta le a túl agresszív első változatot:
    // a „becsületes" szót visszavágta „bécs"-ig, és MINDEN bécsi céget
    // találatnak jelzett. 6 karakter levágása már nem ragozás-tűrés.
    expect(tokenMatches("becs", "becsuletes")).toBe(false);
    // A valódi magyar toldalékok viszont beleférnek:
    expect(tokenMatches("becs", "becsi")).toBe(true); // -i     (1)
    expect(tokenMatches("munchen", "munchenben")).toBe(true); // -ben (3)
    expect(tokenMatches("fodrasz", "fodrasztol")).toBe(true); // -tól (3)
  });

  it("a tövet NEM bővíti (az találgatás lenne)", () => {
    // A blobban a hosszabb alak van, a keresés a rövidebb → részlánc, talál.
    expect(tokenMatches("munchenben", "munchen")).toBe(true);
  });
});

/**
 * Lekérdezés-lazítás — „sosem üres kéz".
 *
 * ⚠️ MIÉRT FONTOS: a szaknévsor RITKA (2248 tétel, 6 ország). A „fogorvos bécs"
 * simán nulla lehet pusztán azért, mert abban a városban nincs magyar fogorvos —
 * miközben a szomszéd országban van. A puszta „nincs találat" ezt eltitkolja.
 */
const BLOBS = [
  foldSearchText("Rózsa Dental magyar fogászat Henley-on-Thames"),
  foldSearchText("Hungarian DentaCare fogorvos London Battersea"),
  foldSearchText("Ákos Polgár Hairstylist fodrász Bécs Kirchengasse"),
  foldSearchText("MF Beauty Emi's Frisur fodrász Bécs 3. kerület"),
];

/** A valódi kategórianevek foldolt alakja — ezt adja át az explore-view is. */
const CATS = ["fogorvos", "fodrasz", "orvos", "etterem"];

describe("kereső — lekérdezés-lazítás nulla találatnál", () => {
  it("egy szavas keresésnél nincs mit elhagyni", () => {
    expect(relaxSearchQuery(BLOBS, q("fogorvos"), CATS)).toBeNull();
  });

  it("⚠️⚠️ a SZAKMÁT megtartja, a HELYNEVET ejti el", () => {
    // Ez a teszt buktatta le az első, hibás változatot: az a „legtöbb találat"
    // elvén a FOGORVOS szót dobta el (mert bécsi fodrászból több van), és
    // fodrászokat ajánlott annak, aki fogorvost keres.
    const r = relaxSearchQuery(BLOBS, q("fogorvos bécs"), CATS);
    expect(r).not.toBeNull();
    expect(r!.dropped).toBe("becs");
    expect(r!.kept).toEqual(["fogorvos"]);
    expect(r!.count).toBe(1);
  });

  it("akkor is a helynevet ejti, ha abból több találat lenne", () => {
    const r = relaxSearchQuery(BLOBS, q("fodrász london"), CATS);
    expect(r!.dropped).toBe("london");
    expect(r!.count).toBe(2);
  });

  it("ha csak szakmaszavak vannak, a találatszám dönt", () => {
    // Egyik sem helynév → a több találatot adó elhagyás nyer.
    const r = relaxSearchQuery(BLOBS, q("fogorvos fodrász"), CATS);
    expect(r).not.toBeNull();
    expect(r!.count).toBe(2); // a „fogorvos" elejtve 2 fodrász marad
  });

  it("null, ha semmilyen elhagyás nem segít", () => {
    expect(relaxSearchQuery(BLOBS, q("asztalos vízvezeték"), CATS)).toBeNull();
  });
});
