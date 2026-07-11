import { describe, it, expect } from "vitest";
import {
  KERESEK_BUSINESS_CATS,
  classifyKeresekContact,
  pickKeresekRecipients,
  buildKeresekLeadMessage,
  type KeresekBusinessRow,
} from "@/lib/keresek-lead-map";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";

describe("KERESEK_BUSINESS_CATS", () => {
  it("minden kulcs érvényes Keresek-kategória", () => {
    const valid = new Set(SERVICE_CATEGORIES.map((c) => c.id));
    for (const key of Object.keys(KERESEK_BUSINESS_CATS)) {
      expect(valid.has(key as never), `ismeretlen kulcs: ${key}`).toBe(true);
    }
  });

  it("minden érték nem-üres kategória-lista", () => {
    for (const [key, cats] of Object.entries(KERESEK_BUSINESS_CATS)) {
      expect(Array.isArray(cats) && cats.length > 0, `üres lista: ${key}`).toBe(true);
      for (const c of cats!) expect(typeof c).toBe("string");
    }
  });

  it("egyeb szándékosan NINCS leképezve (nincs őszinte pár)", () => {
    expect(KERESEK_BUSINESS_CATS["egyeb" as never]).toBeUndefined();
  });
});

describe("classifyKeresekContact", () => {
  it("tiszta email → email mező", () => {
    expect(classifyKeresekContact("kiss.anna@gmail.com")).toEqual({
      email: "kiss.anna@gmail.com",
      phone: null,
    });
  });

  it("tiszta telefon → phone mező, email üres", () => {
    const r = classifyKeresekContact("+43 660 123 45 67");
    expect(r.email).toBe("");
    expect(r.phone).toBe("+43 660 123 45 67");
  });

  it("vegyes (telefon + email) → mindkettő kinyerve", () => {
    const r = classifyKeresekContact("+41 79 123 45 67, anna@example.com");
    expect(r.email).toBe("anna@example.com");
    expect(r.phone).toContain("+41 79 123 45 67");
  });

  it("szabad szöveg telefon-futammal → a futam lesz a phone", () => {
    const r = classifyKeresekContact("WhatsApp: 0660 1234567");
    expect(r.email).toBe("");
    expect(r.phone).toBe("0660 1234567");
  });

  it("se email, se szám → a nyers szöveg phone-ként (információ nem vész el)", () => {
    const r = classifyKeresekContact("Messengeren: Kiss Anna");
    expect(r.email).toBe("");
    expect(r.phone).toBe("Messengeren: Kiss Anna");
  });
});

function biz(id: string, featured: number, email: string | null, region: string | null): KeresekBusinessRow {
  return { id, featured, contactEmail: email, regionCode: region };
}

describe("pickKeresekRecipients", () => {
  it("PRO cég feloldott + azonnali email; nem-PRO MINDIG zárolt", () => {
    const rows = [biz("pro1", 1, "a@b.hu", null), biz("free1", 0, "c@d.hu", null)];
    const picked = pickKeresekRecipients(rows, null);
    expect(picked.find((r) => r.id === "pro1")).toEqual({ id: "pro1", locked: false, immediateEmail: true });
    expect(picked.find((r) => r.id === "free1")).toEqual({ id: "free1", locked: true, immediateEmail: true });
  });

  it("email nélküli cég is címzett (inbox-only), de azonnali email nélkül", () => {
    const picked = pickKeresekRecipients([biz("noemail", 0, null, null)], null);
    expect(picked).toEqual([{ id: "noemail", locked: true, immediateEmail: false }]);
  });

  it("azonnali email-plafonok: max 3 PRO + 2 teaser", () => {
    const rows = [
      ...[1, 2, 3, 4].map((i) => biz(`p${i}`, 1, `p${i}@x.hu`, null)),
      ...[1, 2, 3, 4].map((i) => biz(`f${i}`, 0, `f${i}@x.hu`, null)),
    ];
    const picked = pickKeresekRecipients(rows, null);
    expect(picked.filter((r) => !r.locked && r.immediateEmail)).toHaveLength(3);
    expect(picked.filter((r) => r.locked && r.immediateEmail)).toHaveLength(2);
    // A plafonon túliak is címzettek (digest/inbox), csak azonnali email nélkül.
    expect(picked).toHaveLength(8);
  });

  it("régió-egyezés előnyben; ha a régióban senki, országos fallback", () => {
    const rows = [biz("w1", 0, null, "W"), biz("t1", 0, null, "T")];
    expect(pickKeresekRecipients(rows, "W").map((r) => r.id)).toEqual(["w1"]);
    expect(pickKeresekRecipients(rows, "ST").map((r) => r.id)).toEqual(["w1", "t1"]);
  });

  it("összes címzett plafonja 10", () => {
    const rows = Array.from({ length: 30 }, (_, i) => biz(`b${i}`, 0, null, null));
    expect(pickKeresekRecipients(rows, null)).toHaveLength(10);
  });
});

describe("buildKeresekLeadMessage", () => {
  it("teljes kérésből olvasható üzenet, kontakt NÉLKÜL", () => {
    const msg = buildKeresekLeadMessage({
      title: "Szobafestőt keresek",
      description: "50 nm, 2 szoba",
      city: "Bécs",
      whenText: "jövő hét",
    });
    expect(msg).toContain("Szobafestőt keresek");
    expect(msg).toContain("50 nm, 2 szoba");
    expect(msg).toContain("📍 Bécs");
    expect(msg).toContain("🗓️ jövő hét");
    expect(msg).toContain("Keresek");
  });

  it("hiányzó mezőkkel is értelmes", () => {
    const msg = buildKeresekLeadMessage({ title: "Fodrászt keresek", description: null, city: null, whenText: null });
    expect(msg.startsWith("Fodrászt keresek")).toBe(true);
    expect(msg).not.toContain("📍");
  });
});
