import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/housing (feladás) + /api/housing/contact (PRO-kapuőr) — guard-
 * orchestráció tesztek az api-business-submit mintájára. A VALÓDI
 * validateHousingInput fut (route + validátor együtt tesztelve); a Cloudflare/
 * Clerk/repo réteg mockolva. A kontakt-kapu a bevétel-kritikus út: a 401/403
 * ágak azt őrzik, hogy a kontakt SOHA ne szivárogjon PRO nélkül.
 */

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/lib/blocklist-guard", () => ({ checkBlocklistOrReject: vi.fn() }));
vi.mock("@/lib/admin-notify", () => ({ notifyAdminContentPending: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareCtx: vi.fn(() => null) }));
vi.mock("@/lib/subscriptions", () => ({ isPro: vi.fn() }));
vi.mock("@/lib/repo", () => ({
  getHousingListings: vi.fn(),
  createHousingListing: vi.fn(),
  countRecentHousingByUser: vi.fn(),
  deleteOwnHousingListing: vi.fn(),
  getHousingContactInfo: vi.fn(),
}));

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { notifyAdminContentPending } from "@/lib/admin-notify";
import { isPro } from "@/lib/subscriptions";
import {
  createHousingListing,
  countRecentHousingByUser,
  getHousingContactInfo,
  deleteOwnHousingListing,
} from "@/lib/repo";
import { POST, DELETE } from "@/app/api/housing/route";
import { GET as GET_CONTACT } from "@/app/api/housing/contact/route";

function postReq(body: unknown) {
  return new Request("https://kinti.app/api/housing", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  type: "room_offered",
  country: "CH",
  city: "Zürich",
  price: 850,
  currency: "CHF",
  description: "Világos szoba a belvárosban, azonnal költözhető, rezsivel együtt.",
  contact: "teszt@example.com",
  consent: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue({ userId: "user_1" } as never);
  vi.mocked(checkBlocklistOrReject).mockResolvedValue(null as never);
  vi.mocked(notifyAdminContentPending).mockResolvedValue(undefined as never);
  vi.mocked(countRecentHousingByUser).mockResolvedValue(0);
  vi.mocked(createHousingListing).mockResolvedValue("listing-1");
  vi.mocked(isPro).mockResolvedValue(true);
  vi.mocked(getHousingContactInfo).mockResolvedValue("teszt@example.com");
});

describe("POST /api/housing", () => {
  it("belépés nélkül → 401, nincs INSERT", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(401);
    expect(createHousingListing).not.toHaveBeenCalled();
  });

  it("kiadó hirdetés nyilatkozat nélkül → 400 (a jogi pajzs szerver-oldalon is zár)", async () => {
    const res = await POST(postReq({ ...validBody, consent: false }));
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain("nyilatkozat");
    expect(createHousingListing).not.toHaveBeenCalled();
  });

  it("napi limit felett → 429", async () => {
    vi.mocked(countRecentHousingByUser).mockResolvedValue(3);
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(429);
    expect(createHousingListing).not.toHaveBeenCalled();
  });

  it("boldog út → 200, INSERT a userId-vel + admin-értesítő", async () => {
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(200);
    expect(createHousingListing).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_1", city: "Zürich", price: 850 }),
    );
    expect(notifyAdminContentPending).toHaveBeenCalled();
    // A válasz NEM tartalmazza a kontaktot (anti-leak).
    const data = (await res.json()) as Record<string, unknown>;
    expect(JSON.stringify(data)).not.toContain("teszt@example.com");
  });

  it("kereső hirdetés nyilatkozat nélkül is feladható", async () => {
    const res = await POST(postReq({ ...validBody, type: "looking_for_room", consent: false }));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/housing/contact — a PRO-kapuőr", () => {
  const req = (id = "listing-1") =>
    new NextRequest(`https://kinti.app/api/housing/contact?id=${id}`);

  it("belépés nélkül → 401, a kontakt-lekérdezés meg sem történik", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const res = await GET_CONTACT(req());
    expect(res.status).toBe(401);
    expect(getHousingContactInfo).not.toHaveBeenCalled();
  });

  it("nem-PRO → 403 pro_required, a kontakt-lekérdezés meg sem történik", async () => {
    vi.mocked(isPro).mockResolvedValue(false);
    const res = await GET_CONTACT(req());
    expect(res.status).toBe(403);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("pro_required");
    expect(getHousingContactInfo).not.toHaveBeenCalled();
  });

  it("PRO + létező hirdetés → 200 a kontakttal (no-store)", async () => {
    const res = await GET_CONTACT(req());
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const data = (await res.json()) as { contact: string };
    expect(data.contact).toBe("teszt@example.com");
    expect(isPro).toHaveBeenCalledWith("user_1");
  });

  it("PRO, de nem létező/inaktív hirdetés → 404", async () => {
    vi.mocked(getHousingContactInfo).mockResolvedValue(null);
    const res = await GET_CONTACT(req("nincs"));
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/housing — saját hirdetés levétele", () => {
  const req = (id = "listing-1") =>
    new NextRequest(`https://kinti.app/api/housing?id=${id}`, { method: "DELETE" });

  it("csak a feladó törölhet: idegen/nem létező → 404", async () => {
    vi.mocked(deleteOwnHousingListing).mockResolvedValue(false);
    const res = await DELETE(req());
    expect(res.status).toBe(404);
    expect(deleteOwnHousingListing).toHaveBeenCalledWith("listing-1", "user_1");
  });

  it("saját hirdetés → 200", async () => {
    vi.mocked(deleteOwnHousingListing).mockResolvedValue(true);
    const res = await DELETE(req());
    expect(res.status).toBe(200);
  });
});
