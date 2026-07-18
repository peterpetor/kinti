import { describe, it, expect } from "vitest";
import { foldForSearch } from "@/lib/fold";

describe("foldForSearch", () => {
  it("magyar ékezetek hajtása", () => {
    expect(foldForSearch("Bécs")).toBe("becs");
    expect(foldForSearch("Fodrász")).toBe("fodrasz");
    expect(foldForSearch("Ügyvéd")).toBe("ugyved");
    expect(foldForSearch("Győr")).toBe("gyor");
    expect(foldForSearch("Zöldségesbolt")).toBe("zoldsegesbolt");
  });

  it("német umlautok hajtása", () => {
    expect(foldForSearch("Zürich")).toBe("zurich");
    expect(foldForSearch("München")).toBe("munchen");
    expect(foldForSearch("Nürnberg")).toBe("nurnberg");
  });

  it("substring-illesztés ékezet nélküli beírással", () => {
    const hay = foldForSearch("Dr. Böröcz Anna – Bőrgyógyász Bécsben");
    expect(hay.includes(foldForSearch("borocz"))).toBe(true);
    expect(hay.includes(foldForSearch("borgyogyasz"))).toBe(true);
    expect(hay.includes(foldForSearch("becs"))).toBe(true);
  });

  it("szóközök és írásjelek megmaradnak (nem slug)", () => {
    expect(foldForSearch("Dr. Nagy Péter")).toBe("dr. nagy peter");
  });

  it("null / üres biztonságos", () => {
    expect(foldForSearch(null)).toBe("");
    expect(foldForSearch(undefined)).toBe("");
    expect(foldForSearch("")).toBe("");
  });
});
