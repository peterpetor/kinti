import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * processReviewNudges — a vélemény-gyűjtő hurok orchestrációja. A repo/email
 * mockolt; azt bizonyítjuk, hogy (1) küld+lezár, (2) meglévő véleménynél csak
 * lezár, (3) futáson belüli email+cég dedup, (4) küldés-hiba nem zárja le a
 * leadet és nem állítja meg a többit.
 */

vi.mock("@/lib/repo-leads", () => ({
  getLeadsDueReviewNudge: vi.fn(),
  markLeadReviewNudged: vi.fn(),
}));
vi.mock("@/lib/repo", () => ({ hasReviewByEmail: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendReviewNudgeEmail: vi.fn() }));
vi.mock("@/lib/safe-log", () => ({ safeLogError: vi.fn() }));

import { getLeadsDueReviewNudge, markLeadReviewNudged } from "@/lib/repo-leads";
import { hasReviewByEmail } from "@/lib/repo";
import { sendReviewNudgeEmail } from "@/lib/email";
import { processReviewNudges } from "@/lib/review-nudge";

const lead = (id: string, email = "a@b.ch", businessId = "biz1") => ({
  id,
  businessId,
  businessName: "Teszt Bt",
  senderName: "Kata",
  senderEmail: email,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(hasReviewByEmail).mockResolvedValue(false as never);
  vi.mocked(sendReviewNudgeEmail).mockResolvedValue(undefined as never);
  vi.mocked(markLeadReviewNudged).mockResolvedValue(undefined as never);
});

describe("processReviewNudges", () => {
  it("esedékes lead → email megy és a lead lezáródik", async () => {
    vi.mocked(getLeadsDueReviewNudge).mockResolvedValue([lead("l1")] as never);
    const sent = await processReviewNudges();
    expect(sent).toBe(1);
    expect(sendReviewNudgeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "a@b.ch", businessId: "biz1", businessName: "Teszt Bt" }),
    );
    expect(markLeadReviewNudged).toHaveBeenCalledWith("l1");
  });

  it("már értékelt email → NEM megy email, de a lead lezáródik", async () => {
    vi.mocked(getLeadsDueReviewNudge).mockResolvedValue([lead("l1")] as never);
    vi.mocked(hasReviewByEmail).mockResolvedValue(true as never);
    const sent = await processReviewNudges();
    expect(sent).toBe(0);
    expect(sendReviewNudgeEmail).not.toHaveBeenCalled();
    expect(markLeadReviewNudged).toHaveBeenCalledWith("l1");
  });

  it("ugyanaz az email+cég két leaddel → csak EGY email", async () => {
    vi.mocked(getLeadsDueReviewNudge).mockResolvedValue([lead("l1"), lead("l2")] as never);
    const sent = await processReviewNudges();
    expect(sent).toBe(1);
    expect(sendReviewNudgeEmail).toHaveBeenCalledTimes(1);
    expect(markLeadReviewNudged).toHaveBeenCalledTimes(2); // mindkét lead lezárva
  });

  it("küldés-hiba → a lead NEM záródik le (újrapróbálható), a többi megy tovább", async () => {
    vi.mocked(getLeadsDueReviewNudge).mockResolvedValue([
      lead("l1", "hibas@x.ch"),
      lead("l2", "jo@x.ch", "biz2"),
    ] as never);
    vi.mocked(sendReviewNudgeEmail)
      .mockRejectedValueOnce(new Error("resend hiba") as never)
      .mockResolvedValueOnce(undefined as never);
    const sent = await processReviewNudges();
    expect(sent).toBe(1);
    expect(markLeadReviewNudged).toHaveBeenCalledTimes(1);
    expect(markLeadReviewNudged).toHaveBeenCalledWith("l2");
  });
});
