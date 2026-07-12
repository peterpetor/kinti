import { describe, it, expect } from "vitest";
import { heuristicParseSearch, type HeuristicCategory } from "@/lib/search-heuristic";

/**
 * A valódi seed-kategóriák egy reprezentatív szelete (id + magyar label) —
 * pont azok, amelyeknél a disambiguáció / részleges token számít.
 */
const CATS: HeuristicCategory[] = [
  { id: "all", label: "Mind" },
  { id: "fodrasz", label: "Fodrász" },
  { id: "eskuvoi_fodrasz", label: "Alkalmi fodrász / Sminkes" },
  { id: "kutyafodrasz", label: "Kutyafodrász" },
  { id: "orvos", label: "Orvos" },
  { id: "allatorvos", label: "Állatorvos" },
  { id: "fogorvos", label: "Fogorvos" },
  { id: "gyermekorvos", label: "Gyermekorvos" },
  { id: "autoszer", label: "Autószerelő" },
  { id: "villany", label: "Villanyszerelő" },
  { id: "asztalos", label: "Asztalos" },
  { id: "husszek", label: "Hentes / Húsbolt" },
  { id: "kavez", label: "Kávézó / Cukrászda" },
  { id: "masszazs", label: "Masszázs" },
  { id: "konyveles", label: "Könyvelés" },
  { id: "takarito", label: "Takarítás" },
];

describe("heuristicParseSearch — tiszta »kategória + helyszín« minta", () => {
  it("CH: „fodrász Zürich” → fodrasz + ZH", () => {
    const r = heuristicParseSearch("fodrász Zürich", "CH", CATS);
    expect(r).not.toBeNull();
    expect(r!.categoryId).toBe("fodrasz");
    expect(r!.cantonCode).toBe("ZH");
    expect(r!.keywords).toBe("");
  });

  it("CH: magyar ragozott helynév „Zürichben” is illeszkedik", () => {
    const r = heuristicParseSearch("fodrász Zürichben", "CH", CATS);
    expect(r?.categoryId).toBe("fodrasz");
    expect(r?.cantonCode).toBe("ZH");
  });

  it("CH: „villanyszerelő Aargauban” → villany + AG", () => {
    const r = heuristicParseSearch("villanyszerelő Aargauban", "CH", CATS);
    expect(r?.categoryId).toBe("villany");
    expect(r?.cantonCode).toBe("AG");
  });

  it("AT: „orvos Bécsben” → orvos + W", () => {
    const r = heuristicParseSearch("orvos Bécsben", "AT", CATS);
    expect(r?.categoryId).toBe("orvos");
    expect(r?.cantonCode).toBe("W");
  });

  it("DE: „fodrász Berlinben” → fodrasz + BE", () => {
    const r = heuristicParseSearch("fodrász Berlinben", "DE", CATS);
    expect(r?.categoryId).toBe("fodrasz");
    expect(r?.cantonCode).toBe("BE");
  });

  it("NL: „fodrász Amszterdamban” → fodrasz + NH", () => {
    const r = heuristicParseSearch("fodrász Amszterdamban", "NL", CATS);
    expect(r?.categoryId).toBe("fodrasz");
    expect(r?.cantonCode).toBe("NH");
  });

  it("csak kategória („fodrász”) → cat beáll, régió null", () => {
    const r = heuristicParseSearch("fodrász", "CH", CATS);
    expect(r?.categoryId).toBe("fodrasz");
    expect(r?.cantonCode).toBeNull();
  });

  it("csak helyszín („Zürich”) → régió beáll, kategória null", () => {
    const r = heuristicParseSearch("Zürich", "CH", CATS);
    expect(r?.cantonCode).toBe("ZH");
    expect(r?.categoryId).toBeNull();
  });

  it("magyar ragozott KATEGÓRIA is („fodrászt keresek Zürichben”)", () => {
    const r = heuristicParseSearch("fodrászt keresek Zürichben", "CH", CATS);
    expect(r?.categoryId).toBe("fodrasz");
    expect(r?.cantonCode).toBe("ZH");
  });

  it("lágy minősítők + „magyar” elnyelődnek", () => {
    const r = heuristicParseSearch("jó olcsó magyar fodrász Zürichben", "CH", CATS);
    expect(r?.categoryId).toBe("fodrasz");
    expect(r?.cantonCode).toBe("ZH");
  });
});

describe("heuristicParseSearch — disambiguáció", () => {
  it("„fodrász” a Fodrász-t adja, NEM az »Alkalmi fodrász / Sminkes«-t", () => {
    const r = heuristicParseSearch("fodrász", "CH", CATS);
    expect(r?.categoryId).toBe("fodrasz");
  });

  it("disztinktív részleges token: „sminkes” → eskuvoi_fodrasz", () => {
    const r = heuristicParseSearch("sminkes Zürich", "CH", CATS);
    expect(r?.categoryId).toBe("eskuvoi_fodrasz");
    expect(r?.cantonCode).toBe("ZH");
  });

  it("altípus pontos találata: „gyermekorvos Bécsben” → gyermekorvos, nem orvos", () => {
    const r = heuristicParseSearch("gyermekorvos Bécsben", "AT", CATS);
    expect(r?.categoryId).toBe("gyermekorvos");
    expect(r?.cantonCode).toBe("W");
  });

  it("„orvos” a generikus Orvos-t adja (nem al-típust)", () => {
    const r = heuristicParseSearch("orvos", "CH", CATS);
    expect(r?.categoryId).toBe("orvos");
  });
});

describe("heuristicParseSearch — bonyolult → null (menjen az AI-hoz)", () => {
  it("nyelvi feltétel: „asztalos Aargauban aki angolul beszél” → null", () => {
    expect(heuristicParseSearch("asztalos Aargauban aki angolul beszél", "CH", CATS)).toBeNull();
  });

  it("nyitvatartás: „fodrász Zürich hétvégén nyitva” → null", () => {
    expect(heuristicParseSearch("fodrász Zürich hétvégén nyitva", "CH", CATS)).toBeNull();
  });

  it("két különböző kategória → null (nem egyértelmű)", () => {
    expect(heuristicParseSearch("fodrász és asztalos Zürich", "CH", CATS)).toBeNull();
  });

  it("ismeretlen szó (cégnév) marad → null", () => {
    expect(heuristicParseSearch("Kovács Bt Zürich", "CH", CATS)).toBeNull();
  });

  it("teljesen ismeretlen query → null", () => {
    expect(heuristicParseSearch("valami random izé", "CH", CATS)).toBeNull();
  });
});

describe("heuristicParseSearch — token-határ / hamis pozitív védelem", () => {
  it("„Wiener Neustadt” NEM lesz Bécs (W) — a helyes NÖ-re oldódik", () => {
    // A „wiener" maradéka „er" nincs a toldalék-listán → a W hamis pozitív
    // továbbra is kizárt. 2026-07-12 óta viszont a „wiener neustadt" NOE-alias
    // (város-aliasok a regions.ts-ben) → helyesen Niederösterreichre oldódik.
    const r = heuristicParseSearch("orvos Wiener Neustadt", "AT", CATS);
    expect(r?.cantonCode).toBe("NOE");
    expect(r?.cantonCode).not.toBe("W");
  });

  it("túl rövid query → null", () => {
    expect(heuristicParseSearch("fo", "CH", CATS)).toBeNull();
  });

  it("üres kategórialista → null (nincs mire képezni, marad az AI)", () => {
    expect(heuristicParseSearch("fodrász Zürich", "CH", [])).toBeNull();
  });
});
