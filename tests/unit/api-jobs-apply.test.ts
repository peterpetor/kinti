import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/jobs/[id]/apply — guard + biztonsági tesztek. Kiemelt: a rate-limit MINDEN
 * próbálkozásnál naplózódik (anti-enumeráció), és a CV-kulcs SOHA nem a kliensből,
 * hanem a bejelentkezett user saját profiljából jön (IDOR-védelem).
 */

const dbBind = vi.fn();
const dbFirst = vi.fn();
const dbRun = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendJobApplicationNotificationEmail: vi.fn() }));
vi.mock("@/lib/safe-log", () => ({ safeLogError: vi.fn() }));
vi.mock("@/lib/security", () => ({ hashIp: vi.fn() }));
vi.mock("@/lib/ai", () => ({ checkAiRateLimit: vi.fn(), logAiRateLimit: vi.fn() }));
vi.mock("@/lib/repo", () => ({
  getJobById: vi.fn(),
  getEmployerById: vi.fn(),
  getWorkerProfileByUser: vi.fn(),
}));
vi.mock("@/lib/cloudflare", () => ({
  getDB: vi.fn(() => ({
    prepare: vi.fn(() => ({ bind: dbBind })),
  })),
}));

import { auth } from "@clerk/nextjs/server";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";
import { getJobById, getEmployerById, getWorkerProfileByUser } from "@/lib/repo";
import { POST } from "@/app/api/jobs/[id]/apply/route";

function req(body: unknown) {
  return new Request("https://kinti.app/api/jobs/job1/apply", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}
const params = { params: { id: "job1" } };
const validBody = { fullName: "Anna Kovacs", email: "anna@x.ch" };

beforeEach(() => {
  vi.clearAllMocks();
  dbBind.mockReturnValue({ first: dbFirst, run: dbRun });
  dbFirst.mockResolvedValue(null); // nincs duplikátum
  dbRun.mockResolvedValue({});
  vi.mocked(hashIp).mockResolvedValue("iphash" as never);
  vi.mocked(checkAiRateLimit).mockResolvedValue({ allowed: true } as never);
  vi.mocked(logAiRateLimit).mockResolvedValue(undefined as never);
  vi.mocked(auth).mockResolvedValue({ userId: null } as never);
  vi.mocked(getJobById).mockResolvedValue({
    id: "job1", moderationStatus: 1, status: "active", employerId: "emp1", title: "Fejlesztő",
  } as never);
  vi.mocked(getEmployerById).mockResolvedValue({ contactEmail: "e@co.ch", companyName: "Co" } as never);
  vi.mocked(getWorkerProfileByUser).mockResolvedValue(null as never);
});

describe("POST /api/jobs/[id]/apply", () => {
  it("boldog út → 200, INSERT lefutott", async () => {
    const res = await POST(req(validBody), params);
    expect(res.status).toBe(200);
    expect(dbRun).toHaveBeenCalledTimes(1);
  });

  it("nem aktív állás → 404", async () => {
    vi.mocked(getJobById).mockResolvedValue({
      id: "job1", moderationStatus: 0, status: "active", employerId: "emp1", title: "x",
    } as never);
    const res = await POST(req(validBody), params);
    expect(res.status).toBe(404);
    expect(dbRun).not.toHaveBeenCalled();
  });

  it("nem létező állás → 404", async () => {
    vi.mocked(getJobById).mockResolvedValue(null as never);
    const res = await POST(req(validBody), params);
    expect(res.status).toBe(404);
  });

  it("rate-limit túllépve → 429, nincs INSERT", async () => {
    vi.mocked(checkAiRateLimit).mockResolvedValue({ allowed: false } as never);
    const res = await POST(req(validBody), params);
    expect(res.status).toBe(429);
    expect(dbRun).not.toHaveBeenCalled();
  });

  it("rate-limit MINDEN próbálkozásnál naplózódik (rövid névnél is)", async () => {
    const res = await POST(req({ fullName: "A", email: "a@b.ch" }), params);
    expect(res.status).toBe(400);
    expect(logAiRateLimit).toHaveBeenCalledTimes(1); // anti-enumeráció
  });

  it("érvénytelen email → 400", async () => {
    const res = await POST(req({ fullName: "Anna Kovacs", email: "nincs-kukac" }), params);
    expect(res.status).toBe(400);
  });

  it("duplikált jelentkezés → 409, nincs INSERT", async () => {
    dbFirst.mockResolvedValue({ id: "exists" });
    const res = await POST(req(validBody), params);
    expect(res.status).toBe(409);
    expect(dbRun).not.toHaveBeenCalled();
  });

  it("IDOR-védelem: a CV-kulcs a SAJÁT profilból jön, nem a kliensből", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    vi.mocked(getWorkerProfileByUser).mockResolvedValue({ cvKey: "u1/cv.pdf" } as never);
    await POST(req({ ...validBody, useProfileCv: true, cvKey: "aldozat/titok.pdf" }), params);
    // Az INSERT bind-ja (9 argumentum) — a cv_key a 8. (index 7).
    const insertCall = dbBind.mock.calls.find((c) => c.length === 9);
    expect(insertCall).toBeTruthy();
    expect(insertCall?.[7]).toBe("u1/cv.pdf");
    expect(insertCall?.[7]).not.toBe("aldozat/titok.pdf");
  });
});
