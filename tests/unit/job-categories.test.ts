import { describe, it, expect } from "vitest";
import { JOB_CATEGORIES, isValidJobCategory, jobCategoryLabel } from "@/lib/job-categories";

describe("JOB_CATEGORIES", () => {
  it("egyedi id-k", () => {
    const ids = JOB_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("minden elemnek van label-je és emoji-ja", () => {
    for (const c of JOB_CATEGORIES) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe("isValidJobCategory", () => {
  it("ismert id → true", () => {
    expect(isValidJobCategory("epitoipar")).toBe(true);
    expect(isValidJobCategory("egyeb")).toBe(true);
  });

  it("ismeretlen / rossz típus → false", () => {
    expect(isValidJobCategory("nincs-ilyen")).toBe(false);
    expect(isValidJobCategory("")).toBe(false);
    expect(isValidJobCategory(null)).toBe(false);
    expect(isValidJobCategory(42)).toBe(false);
    expect(isValidJobCategory(undefined)).toBe(false);
  });
});

describe("jobCategoryLabel", () => {
  it("ismert id → label", () => {
    expect(jobCategoryLabel("vendeglatas")).toBe("Vendéglátás / Gastro");
  });

  it("ismeretlen / null → null", () => {
    expect(jobCategoryLabel("nincs-ilyen")).toBeNull();
    expect(jobCategoryLabel(null)).toBeNull();
    expect(jobCategoryLabel(undefined)).toBeNull();
  });
});
