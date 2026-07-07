import { describe, it, expect } from "vitest";
import {
  pickReviewPrompt,
  PROMPT_MIN_AGE_MS,
  PROMPT_MAX_AGE_MS,
  type CallEntry,
} from "@/lib/review-prompt";

/**
 * A hívás-utáni vélemény-kérő kiválasztó-logikája: a [2 óra … 14 nap] ablakban
 * lévő, még el-nem-utasított hívások közül a legfrissebbet ajánlja fel.
 */

const NOW = 1_800_000_000_000; // fix "most" (determinista tesztek)
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function call(id: string, ageMs: number, name = id): CallEntry {
  return { id, name, ts: NOW - ageMs };
}

describe("pickReviewPrompt — időablak", () => {
  it("túl friss hívás (< 2 óra) → még nem kérdezünk", () => {
    expect(pickReviewPrompt([call("a", 1 * HOUR)], [], NOW)).toBeNull();
    expect(pickReviewPrompt([call("a", PROMPT_MIN_AGE_MS - 1)], [], NOW)).toBeNull();
  });

  it("az ablakban lévő hívás → jelölt", () => {
    expect(pickReviewPrompt([call("a", 3 * HOUR)], [], NOW)?.id).toBe("a");
    expect(pickReviewPrompt([call("a", 13 * DAY)], [], NOW)?.id).toBe("a");
  });

  it("túl régi hívás (> 14 nap) → nem kérdezünk", () => {
    expect(pickReviewPrompt([call("a", PROMPT_MAX_AGE_MS + 1)], [], NOW)).toBeNull();
  });
});

describe("pickReviewPrompt — elutasítás és rangsor", () => {
  it("az elutasított cég kimarad, a következő jelölt jön", () => {
    const calls = [call("a", 3 * HOUR), call("b", 5 * HOUR)];
    expect(pickReviewPrompt(calls, ["a"], NOW)?.id).toBe("b");
    expect(pickReviewPrompt(calls, ["a", "b"], NOW)).toBeNull();
  });

  it("több jelölt közül a LEGFRISSEBB nyer", () => {
    const calls = [call("regi", 10 * DAY), call("friss", 4 * HOUR), call("kozepes", 2 * DAY)];
    expect(pickReviewPrompt(calls, [], NOW)?.id).toBe("friss");
  });

  it("hibás/hiányos sorok nem törik el (védőkorlát)", () => {
    const junk = [
      null as unknown as CallEntry,
      { id: 42, name: "x", ts: NOW } as unknown as CallEntry,
      { id: "ok", name: "Jó Cég", ts: NOW - 3 * HOUR },
    ];
    expect(pickReviewPrompt(junk, [], NOW)?.id).toBe("ok");
  });

  it("üres napló → null", () => {
    expect(pickReviewPrompt([], [], NOW)).toBeNull();
  });
});
