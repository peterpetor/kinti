import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/business/confirm/[token] — a legacy email-megerősítős publikálási út.
 * A duplikátum-jelzés (findLikelyDuplicates) ugyanaz a védelem, mint a
 * local-first submit-útban (ld. api-business-submit.test.ts) — ez a teszt
 * csak azt ellenőrzi, hogy a jelzés itt is megjelenik.
 */

vi.mock("@/lib/admin-notify", () => ({ notifyAdminContentPending: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: vi.fn(() => ({})) }));
vi.mock("@/lib/repo", () => ({
  getBusinessSubmissionByConfirmToken: vi.fn(),
  createBusinessFromSubmission: vi.fn(),
  deleteBusinessSubmission: vi.fn(),
  getBusinessById: vi.fn(),
  findLikelyDuplicates: vi.fn(),
}));

import { notifyAdminContentPending } from "@/lib/admin-notify";
import {
  getBusinessSubmissionByConfirmToken,
  createBusinessFromSubmission,
  getBusinessById,
  findLikelyDuplicates,
} from "@/lib/repo";
import { GET } from "@/app/api/business/confirm/[token]/route";

const validSub = {
  id: "sub-1",
  name: "Teszt Fodrászat",
  categoryId: "fodrasz",
  categoryLabel: "Fodrász",
  address: "Fő u. 1",
  cantonCode: "ZH",
  country: "CH",
  phone: "+41 44 123 45 67",
  email: "x@example.com",
  blurb: "Bemutatkozás",
  licenseNumber: null,
  ownerUserId: null,
  manageToken: "mgmt-token",
  confirmToken: "confirm-token",
  expiresAt: "2099-01-01 00:00:00",
};

function req() {
  return new Request("https://kinti.app/api/business/confirm/confirm-token");
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getBusinessSubmissionByConfirmToken).mockResolvedValue(validSub as never);
  vi.mocked(getBusinessById).mockResolvedValue(null as never);
  vi.mocked(createBusinessFromSubmission).mockResolvedValue(undefined as never);
  vi.mocked(notifyAdminContentPending).mockResolvedValue(undefined as never);
  vi.mocked(findLikelyDuplicates).mockResolvedValue([] as never);
});

describe("GET /api/business/confirm/[token]", () => {
  it("érvényes tokennél publikál és 302-t ad vissza", async () => {
    const res = await GET(req(), { params: { token: "confirm-token" } });
    expect(res.status).toBe(302);
    expect(createBusinessFromSubmission).toHaveBeenCalledTimes(1);
  });

  it("valószínű duplikátumnál a moderátor-értesítő preview-ja figyelmeztet (de publikál)", async () => {
    vi.mocked(findLikelyDuplicates).mockResolvedValue([
      { id: "de-imp-dr-x", name: "Dr. Nagy Péter – Fogorvos", address: "Fő u. 1" },
    ] as never);
    const res = await GET(req(), { params: { token: "confirm-token" } });
    expect(res.status).toBe(302);
    const call = vi.mocked(notifyAdminContentPending).mock.calls[0][0];
    expect(call.preview).toContain("LEHET DUPLIKÁTUM");
    expect(call.preview).toContain("Dr. Nagy Péter – Fogorvos");
  });

  it("lejárt/hibás tokennél expired-re irányít, nincs INSERT", async () => {
    vi.mocked(getBusinessSubmissionByConfirmToken).mockResolvedValue(null as never);
    const res = await GET(req(), { params: { token: "bad-token" } });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("status=expired");
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });
});
