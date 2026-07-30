import { describe, it, expect } from "vitest";
import { timingSafeEqualStr } from "@/lib/security";

/**
 * A megosztott titkok (cron Bearer, Telegram/Play webhook-kulcs)
 * konstans-idejű összehasonlítója. A funkcionális helyesség itt tesztelt;
 * a konstans idő az implementáció tulajdonsága (SHA-256 fix hossz +
 * XOR-akkumuláció korai kilépés nélkül).
 */
describe("timingSafeEqualStr", () => {
  it("egyező stringre true", async () => {
    expect(await timingSafeEqualStr("s3cr3t-token", "s3cr3t-token")).toBe(true);
  });

  it("eltérő stringre false", async () => {
    expect(await timingSafeEqualStr("s3cr3t-token", "s3cr3t-tokeX")).toBe(false);
  });

  it("eltérő HOSSZRA is false (a hash-elés ellenére)", async () => {
    expect(await timingSafeEqualStr("abc", "abcd")).toBe(false);
    expect(await timingSafeEqualStr("", "x")).toBe(false);
  });

  it("két üres string egyenlő", async () => {
    expect(await timingSafeEqualStr("", "")).toBe(true);
  });

  it("már az ELSŐ bájt eltérése is false (nincs prefix-egyezés-szivárgás)", async () => {
    expect(await timingSafeEqualStr("Xbcdef", "abcdef")).toBe(false);
  });

  it("Bearer-token formátumra helyesen működik", async () => {
    const secret = "d4f8a1b2c3e5f6a7b8c9d0e1f2a3b4c5";
    expect(await timingSafeEqualStr(`Bearer ${secret}`, `Bearer ${secret}`)).toBe(true);
    expect(await timingSafeEqualStr(`Bearer ${secret}`, `Bearer ${secret}x`)).toBe(false);
    expect(await timingSafeEqualStr("Bearer ", `Bearer ${secret}`)).toBe(false);
  });

  it("unicode/hosszú titok is stabil", async () => {
    const long = "🔒".repeat(200) + "-vég";
    expect(await timingSafeEqualStr(long, long)).toBe(true);
    expect(await timingSafeEqualStr(long, long + "!")).toBe(false);
  });
});
