import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/reviews/manage/[token] PATCH — a megjelenő név átírása. A repo mockolt,
 * a validáció (hossz + trágárság) a valódi szabályokkal fut.
 */

vi.mock("@/lib/repo", () => ({
  deleteReviewByManageToken: vi.fn(),
  recomputeBusinessRating: vi.fn(),
  updateReviewNameByManageToken: vi.fn(),
}));

import { updateReviewNameByManageToken } from "@/lib/repo";
import { PATCH } from "@/app/api/reviews/manage/[token]/route";

function req(body: unknown) {
  return new Request("https://kinti.app/api/reviews/manage/tok1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
const ctx = { params: { token: "tok1" } };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateReviewNameByManageToken).mockResolvedValue(true as never);
});

describe("PATCH /api/reviews/manage/[token]", () => {
  it("név átírása → 200, a repo a trimmelt nevet kapja", async () => {
    const res = await PATCH(req({ reviewerName: "  Kata  " }), ctx);
    expect(res.status).toBe(200);
    expect(updateReviewNameByManageToken).toHaveBeenCalledWith("tok1", "Kata");
  });

  it("üres név (vissza az auto-álnévre) → 200", async () => {
    const res = await PATCH(req({ reviewerName: "" }), ctx);
    expect(res.status).toBe(200);
    expect(updateReviewNameByManageToken).toHaveBeenCalledWith("tok1", "");
  });

  it("trágár név → 400, nincs DB-írás", async () => {
    const res = await PATCH(req({ reviewerName: "KurvaJó Béla" }), ctx);
    expect(res.status).toBe(400);
    expect(updateReviewNameByManageToken).not.toHaveBeenCalled();
  });

  it("túl hosszú név → 400", async () => {
    const res = await PATCH(req({ reviewerName: "x".repeat(41) }), ctx);
    expect(res.status).toBe(400);
    expect(updateReviewNameByManageToken).not.toHaveBeenCalled();
  });

  it("ismeretlen token → 404", async () => {
    vi.mocked(updateReviewNameByManageToken).mockResolvedValue(false as never);
    const res = await PATCH(req({ reviewerName: "Kata" }), ctx);
    expect(res.status).toBe(404);
  });
});
