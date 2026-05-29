/**
 * Einbürgerungstest sorsolás-logika.
 *
 * Egy menet = 15 kérdés:
 *   - 5 federal (politikai rendszer)
 *   - 3 history
 *   - 2 geography
 *   - 2 civic (állampolgári)
 *   - 3 canton (a kiválasztott kantonból, ha kevés van, federal-lal pótolja)
 *
 * Random — minden indításnál más kérdéseket kap a user.
 */

import { EB_BANK, type EbQuestion, type EbTopic } from "./einburgerung-bank";

export const QUIZ_LENGTH = 15;
export const PASS_THRESHOLD = 80; // %

interface TopicMix {
  topic: EbTopic;
  count: number;
}

const MIX: TopicMix[] = [
  { topic: "federal",   count: 5 },
  { topic: "history",   count: 3 },
  { topic: "geography", count: 2 },
  { topic: "civic",     count: 2 },
  { topic: "canton",    count: 3 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateQuiz(cantonCode: string | null): EbQuestion[] {
  const result: EbQuestion[] = [];
  const used = new Set<string>();

  for (const mix of MIX) {
    let pool: EbQuestion[];
    if (mix.topic === "canton") {
      pool = cantonCode
        ? EB_BANK.filter((q) => q.topic === "canton" && q.cantonCode === cantonCode)
        : [];
    } else {
      pool = EB_BANK.filter((q) => q.topic === mix.topic);
    }

    const available = shuffle(pool.filter((q) => !used.has(q.id)));
    const picked = available.slice(0, mix.count);
    for (const p of picked) {
      used.add(p.id);
      result.push(p);
    }

    // Ha nem volt elég, federal-lal pótolunk
    if (picked.length < mix.count) {
      const missing = mix.count - picked.length;
      const fallback = shuffle(
        EB_BANK.filter((q) => q.topic === "federal" && !used.has(q.id)),
      ).slice(0, missing);
      for (const f of fallback) {
        used.add(f.id);
        result.push(f);
      }
    }
  }

  return shuffle(result);
}
