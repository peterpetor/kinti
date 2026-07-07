/**
 * onboarding.ts — a kezdőlapi „Kezdd itt" aktivációs checklist TISZTA logikája.
 *
 * A cél: az új felhasználó 3 lépésben „magáévá teszi" az appot (régió →
 * értesítések → első kedvenc) — ezek együtt adják a visszatérés okát. A
 * lépés-állapot KIZÁRÓLAG kliensoldali jelekből számolódik (localStorage,
 * Notification API) — a szerver nem tud a felhasználóról (privacy-elv).
 *
 * Ez a modul szándékosan környezet-független (nincs window/localStorage):
 * a komponens adja be a nyers jeleket, itt csak a döntés él → unit-tesztelhető.
 */

export type OnboardingStepId = "country" | "region" | "push" | "favorite";

export interface OnboardingStep {
  id: OnboardingStepId;
  done: boolean;
}

export interface OnboardingInput {
  /** A választott ország (country-gate után mindig van). */
  country: string | null;
  /** A választott kanton/tartomány kódja az AKTUÁLIS országhoz. */
  canton: string | null;
  /** Push-állapot: kész / még nincs / az eszközön nem támogatott. */
  pushState: "done" | "pending" | "unsupported";
  /** Mentett kedvencek száma (kinti_favorites). */
  favoriteCount: number;
}

/**
 * A checklist lépései a nyers jelekből. A nem-támogatott push (pl. iOS
 * böngészőben, telepítés nélkül) NEM jelenik meg — nem kérünk lehetetlent.
 * Az ország-lépés szándékosan az első és (a country-gate miatt) szinte mindig
 * kész: az azonnali részhaladás ("1/4") pszichológiailag indítja a kitöltést.
 */
export function buildOnboardingSteps(input: OnboardingInput): OnboardingStep[] {
  const steps: OnboardingStep[] = [
    { id: "country", done: !!input.country },
    { id: "region", done: !!input.canton },
  ];
  if (input.pushState !== "unsupported") {
    steps.push({ id: "push", done: input.pushState === "done" });
  }
  steps.push({ id: "favorite", done: input.favoriteCount > 0 });
  return steps;
}

export interface OnboardingProgress {
  done: number;
  total: number;
  allDone: boolean;
  /** 0..100 — a haladás-sávhoz. */
  percent: number;
}

export function onboardingProgress(steps: OnboardingStep[]): OnboardingProgress {
  const total = steps.length;
  const done = steps.filter((s) => s.done).length;
  return {
    done,
    total,
    allDone: total > 0 && done === total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}
