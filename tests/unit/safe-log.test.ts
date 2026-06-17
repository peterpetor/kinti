import { describe, it, expect } from "vitest";
import { redactPii, safeIdHint } from "@/lib/safe-log";

/**
 * A PII-redakció biztonsági szempontból kritikus: a hibák a Workers logba ÉS
 * (ha be van állítva) a külső monitoringba mennek — email/telefon NEM szivároghat.
 */
describe("redactPii", () => {
  it("email-címet kitakar", () => {
    expect(redactPii("hiba: peterpetor1987@gmail.com nem létezik")).toBe(
      "hiba: [email-redacted] nem létezik",
    );
  });

  it("több emailt is kitakar", () => {
    const out = redactPii("a@b.ch és c.d@example.co.uk");
    expect(out).not.toContain("@b.ch");
    expect(out).not.toContain("example.co.uk");
    expect(out.match(/\[email-redacted\]/g)?.length).toBe(2);
  });

  it("telefonszámot kitakar", () => {
    const out = redactPii("hívd a +41 79 123 45 67 számot");
    expect(out).toContain("[phone-redacted]");
    expect(out).not.toContain("79 123 45 67");
  });

  it("ártalmatlan szöveget változatlanul hagy", () => {
    expect(redactPii("Connection timeout after 5000ms")).toBe("Connection timeout after 5000ms");
  });
});

describe("safeIdHint", () => {
  it("null/üres → [null]", () => {
    expect(safeIdHint(null)).toBe("[null]");
    expect(safeIdHint(undefined)).toBe("[null]");
  });

  it("rövid id változatlan", () => {
    expect(safeIdHint("abc123")).toBe("abc123");
  });

  it("hosszú id-t rövidít (eleje…vége)", () => {
    expect(safeIdHint("0123456789abcdef")).toBe("0123…cdef");
  });
});
