import { describe, it, expect } from "vitest";
import { usefulnessScore, relevanceScore, WEIGHTS } from "@/lib/listing-score";

/**
 * A találat-rangsorolás őre.
 *
 * ⚠️ A JAVÍTOTT HIBA: a régi „Relevans" képlet `0.6 × közelség + 0.4 ×
 * értékelés` volt, de a jelenlegi adatállapotban MINDKÉT tag konstans
 * (0 vélemény az egész szaknévsorban; helymeghatározás nélkül a közelség is
 * fix). Így MINDEN cég 0.48-at kapott, és a rendezés a tömb eredeti,
 * gyakorlatilag véletlen sorrendjére esett vissza.
 *
 * A felhasználó célja a KAPCSOLATFELVÉTEL — ezért a használhatóság (telefon,
 * cím, weboldal) súlyozottan számít.
 */
const BARE = { hasPhone: false, blurb: "Fodrász · Bécs", address: "Bécs" };
const FULL = {
  hasPhone: true,
  blurb: "Fodrász · Bécs · www.pelda.at — Modern hajvágás, balayage, magyarul is beszélünk a szalonban.",
  address: "Kirchengasse 27, 1070 Wien",
  verified: true,
};

describe("használhatóság-pontszám", () => {
  it("a puszta név/város nagyon keveset ér", () => {
    expect(usefulnessScore(BARE, false)).toBeLessThan(0.1);
  });

  it("a teljes adatlap sokkal többet ér, mint a csupasz", () => {
    expect(usefulnessScore(FULL, true)).toBeGreaterThan(usefulnessScore(BARE, false) + 0.7);
  });

  it("⚠️ a TELEFON a legerősebb jel (az a kapcsolatfelvétel)", () => {
    expect(WEIGHTS.phone).toBeGreaterThan(WEIGHTS.webOrEmail);
    expect(WEIGHTS.phone).toBeGreaterThan(WEIGHTS.streetAddress);
    const withPhone = usefulnessScore({ ...BARE, hasPhone: true }, false);
    expect(withPhone).toBeGreaterThan(usefulnessScore(BARE, false));
  });

  it("⚠️ a VÁROS-szintű cím nem ér annyit, mint a házszámos", () => {
    // Ugyanaz a rekord, csak a hívó jelzi, hogy utcaszintű-e:
    expect(usefulnessScore(BARE, true)).toBeGreaterThan(usefulnessScore(BARE, false));
  });

  it("weboldal ÉS e-mail is beszámít a bemutatkozóból", () => {
    expect(usefulnessScore({ blurb: "Fodrász · info@pelda.hu" }, false)).toBeGreaterThan(0);
    expect(usefulnessScore({ blurb: "Fodrász · www.pelda.de" }, false)).toBeGreaterThan(0);
  });

  it("0 és 1 közé esik", () => {
    expect(usefulnessScore(FULL, true)).toBeLessThanOrEqual(1);
    expect(usefulnessScore({}, false)).toBeGreaterThanOrEqual(0);
  });
});

describe("relevancia — a valódi adatállapotban is DIFFERENCIÁL", () => {
  it("⚠️⚠️ helymeghatározás és vélemény NÉLKÜL sem lesz mindenki egyforma", () => {
    // Pontosan ez volt a hiba: a régi képlet itt 0.48-at adott MINDKETTŐRE.
    const proxNeutral = 0.4;
    const bare = relevanceScore(BARE, proxNeutral, false);
    const full = relevanceScore(FULL, proxNeutral, true);
    expect(full).toBeGreaterThan(bare);
    expect(full - bare).toBeGreaterThan(0.25);
  });

  it("a közelség továbbra is számít (ha van helymeghatározás)", () => {
    const near = relevanceScore(BARE, 1.0, false);
    const far = relevanceScore(BARE, 0.0, false);
    expect(near).toBeGreaterThan(far);
  });

  it("egy közeli, de csupasz tétel megelőzhető egy távolabbi, teljes tétellel", () => {
    const nearBare = relevanceScore(BARE, 1.0, false);
    const farFull = relevanceScore(FULL, 0.35, true);
    expect(farFull).toBeGreaterThan(nearBare);
  });
});
