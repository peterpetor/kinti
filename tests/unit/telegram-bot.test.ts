import { describe, it, expect } from "vitest";
import {
  parseBotQuery,
  formatBotReply,
  moreResultsUrl,
  escapeTgHtml,
  type BotBusiness,
} from "@/lib/telegram-bot";

// Reprezentatív kategória-fixtúra (az éles categories tábla mintájára).
const CATS = [
  { id: "villany", label: "Villanyszerelő" },
  { id: "fodrasz", label: "Fodrász" },
  { id: "fogorvos", label: "Fogorvos" },
  { id: "orvos", label: "Orvos" },
  { id: "ugyved", label: "Ügyvéd" },
];

describe("parseBotQuery — ország-független értelmezés", () => {
  it("„villanyszerelő Bécs” → AT/W + kategória", () => {
    const { parsed } = parseBotQuery("villanyszerelő Bécs", CATS);
    expect(parsed).toMatchObject({ country: "AT", categoryId: "villany", cantonCode: "W" });
  });

  it("„fogorvos München” → DE/BY (város-alias)", () => {
    const { parsed } = parseBotQuery("fogorvos München", CATS);
    expect(parsed).toMatchObject({ country: "DE", categoryId: "fogorvos", cantonCode: "BY" });
  });

  it("„fodrász Zürichben” → CH/ZH (magyar toldalék + kanton-város)", () => {
    const { parsed } = parseBotQuery("fodrász Zürichben", CATS);
    expect(parsed).toMatchObject({ country: "CH", categoryId: "fodrasz", cantonCode: "ZH" });
  });

  it("„ügyvéd Rotterdam” → NL/ZH", () => {
    const { parsed } = parseBotQuery("ügyvéd Rotterdam", CATS);
    expect(parsed).toMatchObject({ country: "NL", categoryId: "ugyved", cantonCode: "ZH" });
  });

  it("csak kategória („fodrász”) → needsPlace, nincs parse", () => {
    const outcome = parseBotQuery("fodrász", CATS);
    expect(outcome.parsed).toBeNull();
    expect(outcome.needsPlace).toBe(true);
  });

  it("csak hely („Graz”) → régió-only parse (kategória nélkül)", () => {
    const { parsed } = parseBotQuery("Graz", CATS);
    expect(parsed).toMatchObject({ country: "AT", categoryId: null, cantonCode: "STM" });
  });

  it("értelmezhetetlen szöveg → se parse, se needsPlace", () => {
    const outcome = parseBotQuery("mi a helyzet srácok?", CATS);
    expect(outcome.parsed).toBeNull();
    expect(outcome.needsPlace).toBe(false);
  });
});

describe("formatBotReply — kontakt-mentes, HTML-biztos", () => {
  const parsed = { country: "AT", categoryId: "fodrasz", categoryLabel: "Fodrász", cantonCode: "W" };
  const biz: BotBusiness[] = [
    { id: "b1", name: "Kovács & Tsa <Szalon>", categoryLabel: "Fodrász", cantonCode: "W", rating: 4.8, reviews: 12 },
    { id: "b2", name: "Hajas Ház", categoryLabel: "Fodrász", cantonCode: "W", rating: null, reviews: null },
  ];

  it("nevek escape-elve, profil-link utm-mel, telefon/email SEHOL", () => {
    const out = formatBotReply(parsed, biz);
    expect(out).toContain("Kovács &amp; Tsa &lt;Szalon&gt;");
    expect(out).toContain("/szaknevsor/b1?utm_source=telegram");
    expect(out).toContain("⭐ 4,8 (12)");
    expect(out).not.toMatch(/\+43|tel:|mailto:/);
  });

  it("fizetett kiemelés (featured) láthatóan jelölve — P2B átláthatóság", () => {
    const out = formatBotReply(parsed, [{ ...biz[0], featured: true }, biz[1]]);
    expect(out).toContain("⭐ Kiemelt");
    // A nem-kiemelt sorban nincs jelölés
    expect(out.split("Hajas Ház")[1]).not.toContain("Kiemelt");
  });

  it("üres találat → beajánló CTA", () => {
    const out = formatBotReply(parsed, []);
    expect(out).toContain("/szaknevsor/uj");
  });

  it("országos fallback jelölve (őszinte copy)", () => {
    const out = formatBotReply(parsed, biz, { countryWideFallback: true });
    expect(out).toContain("nem találtunk");
  });

  it("a „Mind” link a SEO-landingre mutat, ha van kombó", () => {
    expect(moreResultsUrl(parsed)).toContain("/magyar/fodrasz/becs");
    expect(moreResultsUrl({ ...parsed, cantonCode: null })).toContain("/szaknevsor");
  });
});

describe("escapeTgHtml", () => {
  it("a három HTML-veszélyes karaktert cseréli", () => {
    expect(escapeTgHtml(`<b>&"'`)).toBe(`&lt;b&gt;&amp;"'`);
  });
});
