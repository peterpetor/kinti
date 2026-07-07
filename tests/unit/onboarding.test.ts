import { describe, it, expect } from "vitest";
import { buildOnboardingSteps, onboardingProgress } from "@/lib/onboarding";

/**
 * A kezdőlapi „Kezdd itt" aktivációs checklist tiszta logikája: lépések a
 * kliensoldali jelekből, haladás-számítás, nem-támogatott push kihagyása.
 */

describe("buildOnboardingSteps", () => {
  it("friss felhasználó: ország kész (gate után), a többi teendő", () => {
    const steps = buildOnboardingSteps({ country: "CH", canton: null, pushState: "pending", favoriteCount: 0 });
    expect(steps.map((s) => [s.id, s.done])).toEqual([
      ["country", true],
      ["region", false],
      ["push", false],
      ["favorite", false],
    ]);
  });

  it("minden jel kész → minden lépés kész", () => {
    const steps = buildOnboardingSteps({ country: "AT", canton: "W", pushState: "done", favoriteCount: 2 });
    expect(steps.every((s) => s.done)).toBe(true);
  });

  it("nem-támogatott push (pl. iOS böngésző) → a push-lépés KIMARAD, nem blokkol", () => {
    const steps = buildOnboardingSteps({ country: "DE", canton: "BY", pushState: "unsupported", favoriteCount: 1 });
    expect(steps.map((s) => s.id)).toEqual(["country", "region", "favorite"]);
    expect(onboardingProgress(steps).allDone).toBe(true);
  });
});

describe("onboardingProgress", () => {
  it("számol: done/total/percent/allDone", () => {
    const steps = buildOnboardingSteps({ country: "NL", canton: null, pushState: "pending", favoriteCount: 0 });
    const p = onboardingProgress(steps);
    expect(p.done).toBe(1);
    expect(p.total).toBe(4);
    expect(p.percent).toBe(25);
    expect(p.allDone).toBe(false);
  });

  it("üres lépés-lista sosem 'kész' (védőkorlát)", () => {
    expect(onboardingProgress([]).allDone).toBe(false);
    expect(onboardingProgress([]).percent).toBe(0);
  });
});
