/**
 * Esemény-tag → emoji mapping.
 *
 * A tag-ek szabad-szövegesen vannak az events táblában (legacy seed-adat
 * mellett user-feladott események). Ahol nincs explicit megfelelő, a 📅
 * fallback emoji jön. A mapping case-insensitive, ékezet-érzéketlen.
 */

const MAP: Record<string, string> = {
  // Kultúra / művészet
  "kultura": "🎭",
  "muveszet": "🎭",
  "szinhaz": "🎭",
  "film": "🎬",
  "konyv": "📖",
  "irodalom": "📖",
  "kiallitas": "🖼️",

  // Zene
  "zene": "🎵",
  "koncert": "🎵",
  "bal": "💃",
  "tanc": "💃",

  // Gasztro
  "gasztro": "🍷",
  "borkostolas": "🍷",
  "bor": "🍷",
  "etel": "🍲",
  "vacsora": "🍽️",
  "piknik": "🧺",

  // Család / gyerek
  "csalad": "👶",
  "gyerek": "👶",
  "gyermek": "👶",
  "iskola": "🎓",
  "ovoda": "🧸",
  "cserkesz": "⚜️",

  // Sport
  "sport": "⚽",
  "foci": "⚽",
  "futas": "🏃",
  "kerekparozas": "🚴",
  "uszas": "🏊",
  "turazas": "🥾",

  // Ünnep / vallás
  "unnep": "🎉",
  "liturgia": "⛪",
  "templom": "⛪",
  "istentisztelet": "⛪",
  "szentmise": "⛪",
  "karacsony": "🎄",
  "huszveti": "🐰",
  "husvet": "🐰",

  // Közösség
  "talalkozo": "👥",
  "kozosseg": "👥",
  "klub": "👥",
  "beszelgetes": "💬",
  "workshop": "🛠️",
  "eloadas": "🎤",
};

/** Visszaadja a tag-hez tartozó emojit; fallback: 📅. */
export function getTagEmoji(tag: string | null | undefined): string {
  if (!tag) return "📅";
  const key = tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // ékezetek le
    .replace(/[^a-z0-9]/g, "");
  return MAP[key] ?? "📅";
}
