/**
 * job-match.ts — munkavállalói profil ↔ álláshirdetés illeszkedési pontszám.
 * Tiszta (testelhető) függvény; szakma + kanton + bér-elvárás alapján 0–100%.
 * PRO funkció: a UI csak előfizetőnek mutatja a pontszámot.
 */
import type { Job } from "./types";

export interface MatchProfile {
  category: string | null;
  cantonCode: string | null;
  expectedSalaryMin: number | null;
}

export interface JobMatch {
  /** 0–100 illeszkedési pontszám. */
  score: number;
  /** Rövid indokok a pozitív egyezésekről. */
  reasons: string[];
}

export type MatchableJob = Pick<Job, "category" | "cantonCode" | "salaryMin" | "salaryMax">;

/** A profil van-e annyira kitöltve, hogy értelmes match számolható. */
export function hasMatchableProfile(p: MatchProfile | null | undefined): p is MatchProfile {
  return !!p && (!!p.category || !!p.cantonCode);
}

export function jobMatchScore(profile: MatchProfile, job: MatchableJob): JobMatch {
  let score = 0;
  const reasons: string[] = [];

  // Szakma (max 55)
  if (profile.category && job.category) {
    if (profile.category === job.category) {
      score += 55;
      reasons.push("Szakma egyezik");
    } else {
      score += 12;
    }
  } else {
    score += 28; // ismeretlen szakma → semleges
  }

  // Kanton (max 30)
  if (profile.cantonCode && job.cantonCode) {
    if (profile.cantonCode === job.cantonCode) {
      score += 30;
      reasons.push("Azonos kanton");
    } else {
      score += 8;
    }
  } else {
    score += 14;
  }

  // Bér-elvárás (max 15)
  const jobTop = job.salaryMax ?? job.salaryMin ?? null;
  if (profile.expectedSalaryMin && jobTop) {
    if (jobTop >= profile.expectedSalaryMin) {
      score += 15;
      reasons.push("Bér megfelel az elvárásodnak");
    } else {
      score += 4;
    }
  } else {
    score += 12; // nincs elvárás megadva → semleges
  }

  return { score: Math.min(100, Math.max(0, Math.round(score))), reasons };
}
