import { describe, it, expect } from "vitest";
import { handleFromId, handleInitial } from "@/lib/handle";

describe("handleFromId", () => {
  it("determinikus — ugyanaz az id mindig ugyanaz a handle", () => {
    expect(handleFromId("abc-123")).toBe(handleFromId("abc-123"));
  });

  it("null/üres id → fix fallback", () => {
    expect(handleFromId(null)).toBe("VidámKinti_00");
    expect(handleFromId(undefined)).toBe("VidámKinti_00");
    expect(handleFromId("")).toBe("VidámKinti_00");
  });

  it("formátum: jelző+főnév_NN (10–99 közti szám)", () => {
    const h = handleFromId("fbb8f291-2b59-46c2");
    expect(h).toMatch(/^.+_\d{2}$/);
    const num = Number(h.split("_")[1]);
    expect(num).toBeGreaterThanOrEqual(10);
    expect(num).toBeLessThanOrEqual(99);
  });
});

describe("handleInitial", () => {
  it("a handle első karaktere", () => {
    expect(handleInitial("abc-123")).toBe(handleFromId("abc-123").charAt(0));
  });
});
