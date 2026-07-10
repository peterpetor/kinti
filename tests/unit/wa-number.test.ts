import { describe, it, expect } from "vitest";
import { waNumber } from "@/lib/wa-phone";

describe("waNumber (wa.me nemzetközi normalizálás)", () => {
  it("nemzetközi formátumok", () => {
    expect(waNumber("+41 79 123 45 67")).toBe("41791234567");
    expect(waNumber("0043 660 1234567")).toBe("436601234567");
    // A gyakori német "(0)" írásmód: a zárójeles nullát el kell dobni!
    expect(waNumber("+49 (0)151 2345678")).toBe("491512345678");
    expect(waNumber("+49 151 2345678")).toBe("491512345678");
  });

  it("helyi formátum CSAK ismert országgal konvertálódik", () => {
    expect(waNumber("079 123 45 67", "CH")).toBe("41791234567");
    expect(waNumber("0660 1234567", "AT")).toBe("436601234567");
    expect(waNumber("06 12345678", "NL")).toBe("31612345678");
    // ország nélkül a helyi alak NEM konvertálható → nincs WhatsApp-gomb
    expect(waNumber("079 123 45 67")).toBeNull();
    expect(waNumber("079 123 45 67", "XX")).toBeNull();
  });

  it("szemét/határesetek → null", () => {
    expect(waNumber("")).toBeNull();
    expect(waNumber("12345")).toBeNull(); // túl rövid
    expect(waNumber("+123456789012345678")).toBeNull(); // túl hosszú
  });
});
