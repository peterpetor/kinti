import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/reviews/submit — guard-orchestráció tesztek. A VALÓDI validateReviewInput
 * fut; a Cloudflare/Resend/moderáció függőségek mockoltak.
 */

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendReviewConfirmationEmail: vi.fn() }));
vi.mock("@/lib/admin-notify", () => ({ notifyAdminContentPending: vi.fn() }));
vi.mock("@/lib/blocklist-guard", () => ({ checkBlocklistOrReject: vi.fn() }));
vi.mock("@/lib/disposable-emails", () => ({ isDisposableEmail: vi.fn() }));
vi.mock("@/lib/safe-log", () => ({ safeLogError: vi.fn() }));
vi.mock("@/lib/security", () => ({ hashIp: vi.fn(), TERMS_VERSION: "test-terms-1" }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: vi.fn(() => ({})) }));
// A route rate-limitje (lib/ai) getDB-t hívna — mock nélkül a vitest stderr-re
// írta: `No "getDB" export is defined on the "@/lib/cloudflare" mock`.
vi.mock("@/lib/ai", () => ({
  checkAiRateLimit: vi.fn(async () => ({ allowed: true })),
  logAiRateLimit: vi.fn(async () => {}),
}));
vi.mock("@/lib/repo", () => ({
  createReviewDraft: vi.fn(),
  getBusinessById: vi.fn(),
  hasReviewByEmail: vi.fn(),
  hasReviewByIpHash: vi.fn(),
  logModerationStrike: vi.fn(),
  publishReview: vi.fn(),
  recomputeBusinessRating: vi.fn(),
}));

import { verifyTurnstile } from "@/lib/turnstile";
import { checkBlocklistOrReject } from "@/lib/blocklist-guard";
import { notifyAdminContentPending } from "@/lib/admin-notify";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { hashIp } from "@/lib/security";
import {
  getBusinessById,
  hasReviewByEmail,
  hasReviewByIpHash,
  publishReview,
  createReviewDraft,
} from "@/lib/repo";
import { POST } from "@/app/api/reviews/submit/route";

function req(body: unknown) {
  return new Request("https://kinti.app/api/reviews/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  businessId: "biz1",
  rating: 5,
  acceptTerms: true,
  ageConfirmed: true,
  email: "",
  turnstileToken: "tok",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(verifyTurnstile).mockResolvedValue({ ok: true } as never);
  vi.mocked(checkBlocklistOrReject).mockResolvedValue(null as never);
  vi.mocked(notifyAdminContentPending).mockResolvedValue(undefined as never);
  vi.mocked(isDisposableEmail).mockReturnValue(false);
  vi.mocked(hashIp).mockResolvedValue("iphash" as never);
  vi.mocked(getBusinessById).mockResolvedValue({ id: "biz1", name: "Teszt Bt" } as never);
  vi.mocked(hasReviewByEmail).mockResolvedValue(false as never);
  vi.mocked(hasReviewByIpHash).mockResolvedValue(false as never);
  vi.mocked(publishReview).mockResolvedValue(undefined as never);
});

describe("POST /api/reviews/submit", () => {
  it("boldog út (email nélkül) → 200, publikálva", async () => {
    const res = await POST(req(validBody));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { published?: boolean };
    expect(json.published).toBe(true);
    expect(publishReview).toHaveBeenCalledTimes(1);
  });

  it("hiányzó ÁSZF-elfogadás → 400", async () => {
    const res = await POST(req({ ...validBody, acceptTerms: false }));
    expect(res.status).toBe(400);
    expect(publishReview).not.toHaveBeenCalled();
  });

  it("érvénytelen csillagszám (9) → 400", async () => {
    const res = await POST(req({ ...validBody, rating: 9 }));
    expect(res.status).toBe(400);
  });

  it("eldobható email → 400", async () => {
    vi.mocked(isDisposableEmail).mockReturnValue(true);
    const res = await POST(req({ ...validBody, email: "x@trash.example" }));
    expect(res.status).toBe(400);
  });

  it("Turnstile bukás → 400", async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue({ ok: false, errorCodes: ["bad"] } as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(400);
    expect(publishReview).not.toHaveBeenCalled();
  });

  it("ismeretlen vállalkozás → 400", async () => {
    vi.mocked(getBusinessById).mockResolvedValue(null as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(400);
  });

  it("duplikált vélemény ugyanazzal az emaillel → 409", async () => {
    vi.mocked(hasReviewByEmail).mockResolvedValue(true as never);
    const res = await POST(req({ ...validBody, email: "a@b.ch" }));
    expect(res.status).toBe(409);
    expect(createReviewDraft).not.toHaveBeenCalled();
  });

  it("duplikált vélemény ugyanarról a hálózatról (ipHash, email nélkül) → 409", async () => {
    vi.mocked(hasReviewByIpHash).mockResolvedValue(true as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(409);
    expect(publishReview).not.toHaveBeenCalled();
  });

  it("szöveges vélemény → 200, a body eljut a publishReview-ig", async () => {
    const res = await POST(req({ ...validBody, body: "Nagyon korrekt, pontos munka, ajánlom." }));
    expect(res.status).toBe(200);
    expect(publishReview).toHaveBeenCalledWith(
      expect.objectContaining({ body: "Nagyon korrekt, pontos munka, ajánlom." }),
    );
  });

  it("trágár szöveg → 400 (body mező-hiba), nem publikálódik", async () => {
    const res = await POST(req({ ...validBody, body: "Szar volt az egész, kurva drága." }));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: { field: string }[] };
    expect(json.details?.some((d) => d.field === "body")).toBe(true);
    expect(publishReview).not.toHaveBeenCalled();
  });

  it("ragozott trágárság is fennakad (prefix-match) → 400", async () => {
    const res = await POST(req({ ...validBody, body: "Ez egy fostalicska hely, kurvára ne gyere ide." }));
    expect(res.status).toBe(400);
    expect(publishReview).not.toHaveBeenCalled();
  });

  it("ártalmatlan hasonló szó (szarvas) NEM akad fenn → 200", async () => {
    const res = await POST(req({ ...validBody, body: "A szarvasgombás pizzájuk kiváló volt!" }));
    expect(res.status).toBe(200);
    expect(publishReview).toHaveBeenCalledTimes(1);
  });

  it("túl rövid (de nem üres) szöveg → 400", async () => {
    const res = await POST(req({ ...validBody, body: "ok" }));
    expect(res.status).toBe(400);
    expect(publishReview).not.toHaveBeenCalled();
  });

  it("becenév → 200, eljut a publishReview-ig", async () => {
    const res = await POST(req({ ...validBody, reviewerName: "Kata" }));
    expect(res.status).toBe(200);
    expect(publishReview).toHaveBeenCalledWith(
      expect.objectContaining({ reviewerName: "Kata" }),
    );
  });

  it("trágár becenév → 400 (reviewerName mező-hiba)", async () => {
    const res = await POST(req({ ...validBody, reviewerName: "FosPista" }));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: { field: string }[] };
    expect(json.details?.some((d) => d.field === "reviewerName")).toBe(true);
    expect(publishReview).not.toHaveBeenCalled();
  });

  it("üres becenév → 200 (auto-álnév a megjelenítésben)", async () => {
    const res = await POST(req({ ...validBody, reviewerName: "" }));
    expect(res.status).toBe(200);
    expect(publishReview).toHaveBeenCalledWith(
      expect.objectContaining({ reviewerName: "" }),
    );
  });
});
