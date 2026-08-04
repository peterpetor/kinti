import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Vectorize-lekérdezés paraméterei.
 *
 * ⚠️ VALÓS, NÉMA ÜZEMZAVARBÓL (2026-08-05). A `returnMetadata: false` a
 * Vectorize V2-ben nem érvényes: a szerver `VECTOR_QUERY_ERROR (40026):
 * Failed to parse the request body as JSON: returnMetadata: expected value`
 * hibát ad. A hívó `catch`-e ezt elnyelte, a keresés MINDEN kérdésre üres
 * listát adott — kívülről pontosan úgy nézett ki, mint egy jogos „nincs
 * találat", pedig egyetlen lekérdezés sem futott le.
 *
 * A típus már nem enged logikai értéket (a fordító megfogja), ez a teszt pedig
 * a HÍVÁST is őrzi — hogy egy `as any`-vel vagy új hívóval se csússzon vissza.
 */

const SRC = readFileSync(resolve(__dirname, "../../src/lib/vector-search.ts"), "utf8");

describe("Vectorize query — paraméterek", () => {
  it("a returnMetadata SZÖVEG, nem logikai érték", () => {
    expect(SRC).not.toMatch(/returnMetadata:\s*(true|false)/);
    expect(SRC).toMatch(/returnMetadata:\s*"(none|indexed|all)"/);
  });

  it("a típus sem enged logikai értéket", () => {
    const tipus = SRC.slice(SRC.indexOf("interface VectorizeLike"), SRC.indexOf("export function getVectorize"));
    expect(tipus).toContain("returnMetadata");
    expect(tipus).not.toMatch(/returnMetadata\?:\s*boolean/);
  });

  it("a hiba oka megkülönböztethető marad (nem néma catch)", () => {
    // Enélkül a következő ilyen hiba is „nincs találat"-nak látszana.
    expect(SRC).toContain('hiba: "lekerdezes"');
    expect(SRC).toContain('hiba: "embedding"');
    expect(SRC).toContain('hiba: "nincs-index"');
  });
});
