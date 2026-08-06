import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Lusta blokkok helyőrzői — layout-eltolódás (CLS) ellen.
 *
 * ⚠️ MÉRT HIBÁBÓL (2026-08-06, éles Playwright-mérés, 390 px-es nézet).
 * A kezdőlap CLS-e 0,163 volt (a Google 0,1-es küszöbe fölött). A helyőrzők
 * léteztek, de KISEBBEK voltak a tényleges tartalomnál:
 *   home-platform-grid  helyőrző 300 px → tényleges 439 px  (139 px ugrás)
 *   nearby-businesses   helyőrző 120 px → tényleges 411 px  (291 px ugrás)
 * A helyőrző egyetlen feladata épp ez lett volna.
 *
 * ⚠️ AMIT A MÉRÉS KIZÁRT: nem a webfont-csere okozza. A `display: "swap"`
 * gyanús volt, de a font 200 ms-nál kész, az eltolódás 610 ms-nál történik, és
 * MELEG CACHE-sel (amikor nincs font-csere) a CLS ugyanannyi maradt: 0,124.
 * A `next/font` `adjustFontFallback`-je tehát elvégzi a dolgát.
 *
 * ⚠️ AMI SZERKEZETI, ÉS NEM HELYŐRZŐVEL JAVÍTHATÓ: a személyre szabott blokkok
 * (PersonalizedHome, checklist, bannerek) localStorage-ból derül ki, hogy
 * megjelennek-e. A szerver ezt NEM tudhatja (privacy-elv: nem köt per-user
 * azonosítót), ezért ott a `mounted`-guard utáni megjelenés elkerülhetetlen.
 * Ezek SZÁNDÉKOSAN kapnak üres helyőrzőt: ha helyet foglalnának, és mégsem
 * jelennének meg, üres rés maradna a lapon — az rosszabb.
 */

const GYOKER = resolve(__dirname, "../..");
const SRC = readFileSync(resolve(GYOKER, "src/components/home-lazy.tsx"), "utf8").replace(
  /\r\n/g,
  "\n",
);

/** Kiolvassa az adott lazy-export helyőrző-magasságát (px), ha van. */
function helyorzoPx(exportNev: string): number | null {
  const i = SRC.indexOf(`const ${exportNev}`);
  if (i < 0) return null;
  // A `hatarral(dynamic(...), box("min-h-[NNNpx]"))` hívás záró része.
  const blokk = SRC.slice(i, i + 900);
  const m = blokk.match(/box\("min-h-\[(\d+)px\]"\)/);
  return m ? Number(m[1]) : null;
}

describe("a mért blokkok helyőrzője elég nagy", () => {
  /** [export, tényleges mért magasság px, engedett alsó eltérés px] */
  const MERT: Array<[string, number, number]> = [
    ["HomePlatformGridLazy", 439, 20],
    ["NearbyBusinessesLazy", 411, 40],
  ];

  it.each(MERT)("%s helyőrzője a mért %ipx közelében van", (nev, mert, tures) => {
    const px = helyorzoPx(nev);
    expect(px, `${nev}: nincs helyőrző-magasság`).not.toBeNull();
    // Nem lehet sokkal kisebb (az ugrást okozná)…
    expect(px!, `${nev}: a helyőrző ${mert - px!}px-szel kisebb a tartalomnál`).toBeGreaterThanOrEqual(
      mert - tures,
    );
    // …és nem lehet nagyobb sem (üres rés villanna fel betöltés közben).
    expect(px!, `${nev}: a helyőrző nagyobb a tartalomnál`).toBeLessThanOrEqual(mert);
  });
});

describe("a feltételes blokkok szándékosan helyőrző NÉLKÜLIEK", () => {
  it("⚠️ a személyre szabott / bannerek üres helyőrzőt kapnak", () => {
    // Ezekről csak a böngésző tudja, megjelennek-e. Ha helyet foglalnának és
    // mégsem jelennének meg, üres rés maradna — az rosszabb, mint az ugrás.
    for (const nev of [
      "MyPostsBannerLazy",
      "ReviewFollowupCardLazy",
      "PersonalizedHomeLazy",
      "OnboardingChecklistLazy",
      "PwaInstallCardLazy",
    ]) {
      const i = SRC.indexOf(`const ${nev}`);
      expect(i, `nincs ilyen export: ${nev}`).toBeGreaterThan(-1);
      expect(SRC.slice(i, i + 900), `${nev}: fix helyőrzőt kapott`).toContain("NINCS_HELYORZO");
    }
  });

  it("az indoklás a fájlban áll (különben valaki „megjavítja” őket)", () => {
    expect(SRC).toContain("NINCS_HELYORZO");
  });
});
