import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/business/submit — guard-orchestráció tesztek (a pénz/jog-érzékeny út).
 * A nehéz Cloudflare/Clerk/Resend függőségeket mockoljuk; a VALÓDI
 * validateBusinessInput (lib/business) fut, hogy a route + validátor együtt
 * legyen tesztelve. Minden teszt egy konkrét védelmi rövidzárat ellenőriz.
 */

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("@/lib/text-moderation", () => ({ moderateText: vi.fn() }));
vi.mock("@/lib/admin-notify", () => ({ notifyAdminContentPending: vi.fn() }));
vi.mock("@/lib/blocklist-guard", () => ({ checkBlocklistOrReject: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendBusinessConfirmationEmail: vi.fn() }));
vi.mock("@/lib/disposable-emails", () => ({ isDisposableEmail: vi.fn() }));
vi.mock("@/lib/safe-log", () => ({ safeLogError: vi.fn() }));
vi.mock("@/lib/security", () => ({ hashIp: vi.fn(), TERMS_VERSION: "test-terms-1" }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: vi.fn(() => ({})) }));
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/lib/repo", () => ({
  getCategories: vi.fn(),
  createBusinessSubmission: vi.fn(),
  countRecentBusinessSubmissions: vi.fn(),
  logModerationStrike: vi.fn(),
  createBusinessFromSubmission: vi.fn(),
  getBusinessById: vi.fn(),
}));

import { verifyTurnstile } from "@/lib/turnstile";
import { moderateText } from "@/lib/text-moderation";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { notifyAdminContentPending } from "@/lib/admin-notify";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { hashIp } from "@/lib/security";
import { auth } from "@clerk/nextjs/server";
import {
  getCategories,
  countRecentBusinessSubmissions,
  logModerationStrike,
  createBusinessFromSubmission,
  getBusinessById,
} from "@/lib/repo";
import { POST } from "@/app/api/business/submit/route";

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://kinti.app/api/business/submit", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Teszt Fodrászat",
  categoryId: "fodrasz",
  cantonCode: "ZH",
  acceptTerms: true,
  ageConfirmed: true,
  email: "", // local-first publikálás
  turnstileToken: "tok",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Boldog út alapértékek — minden guard átenged.
  vi.mocked(verifyTurnstile).mockResolvedValue({ ok: true } as never);
  vi.mocked(checkBlocklistOrReject).mockResolvedValue(null as never);
  vi.mocked(notifyAdminContentPending).mockResolvedValue(undefined as never);
  vi.mocked(isDisposableEmail).mockReturnValue(false);
  vi.mocked(hashIp).mockResolvedValue("iphash" as never);
  vi.mocked(auth).mockResolvedValue({ userId: null } as never);
  vi.mocked(getCategories).mockResolvedValue([{ id: "fodrasz", label: "Fodrász" }] as never);
  vi.mocked(countRecentBusinessSubmissions).mockResolvedValue(0 as never);
  vi.mocked(moderateText).mockResolvedValue({ action: "allow" } as never);
  vi.mocked(getBusinessById).mockResolvedValue(null as never);
  vi.mocked(createBusinessFromSubmission).mockResolvedValue(undefined as never);
});

describe("POST /api/business/submit", () => {
  it("boldog út (email nélkül) → 200, publikálva, INSERT meghívva", async () => {
    const res = await POST(req(validBody));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { published?: boolean; manageToken?: string };
    expect(json.published).toBe(true);
    expect(json.manageToken).toBeTruthy();
    expect(createBusinessFromSubmission).toHaveBeenCalledTimes(1);
  });

  it("honeypot (website kitöltve) → 400, nincs INSERT", async () => {
    const res = await POST(req({ ...validBody, website: "spam" }));
    expect(res.status).toBe(400);
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });

  it("hiányzó ÁSZF-elfogadás → 400", async () => {
    const res = await POST(req({ ...validBody, acceptTerms: false }));
    expect(res.status).toBe(400);
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });

  it("nincs 18+ megerősítés → 400", async () => {
    const res = await POST(req({ ...validBody, ageConfirmed: false }));
    expect(res.status).toBe(400);
  });

  it("eldobható email → 400", async () => {
    vi.mocked(isDisposableEmail).mockReturnValue(true);
    const res = await POST(req({ ...validBody, email: "x@trash.example" }));
    expect(res.status).toBe(400);
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });

  it("Turnstile bukás → 400, nincs INSERT", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue({ ok: false, errorCodes: ["bad"] } as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(400);
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });

  it("ismeretlen kategória → 400", async () => {
    vi.mocked(getCategories).mockResolvedValue([{ id: "mas", label: "Más" }] as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(400);
  });

  it("napi limit túllépve → 429", async () => {
    vi.mocked(countRecentBusinessSubmissions).mockResolvedValue(999 as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(429);
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });

  it("AI moderáció blokk → 400 + strike naplózva", async () => {
    vi.mocked(moderateText).mockResolvedValue({ action: "block", reason: "tilos" } as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(400);
    expect(logModerationStrike).toHaveBeenCalled();
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });

  it("banlistás IP/email → a guard 403-at ad vissza", async () => {
    const { NextResponse } = await import("next/server");
    vi.mocked(checkBlocklistOrReject).mockResolvedValue(
      NextResponse.json({ error: "ban" }, { status: 403 }) as never,
    );
    const res = await POST(req(validBody));
    expect(res.status).toBe(403);
    expect(createBusinessFromSubmission).not.toHaveBeenCalled();
  });
});
