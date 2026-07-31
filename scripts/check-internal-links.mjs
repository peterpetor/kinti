/**
 * check-internal-links.mjs — belső hivatkozások ellenőrzése az éles oldalon.
 *
 * A törött belső link közvetlen felhasználói hiba: a menüből/kártyáról egy 404-re
 * visz. A sitemap ezt NEM fogja meg (az csak azt sorolja fel, amit MI hirdetünk;
 * a navigációban lehet olyan link, ami már nem létező útvonalra mutat).
 *
 * Módszer: néhány KIINDULÓ oldalról kigyűjti az összes `href="/..."` hivatkozást,
 * majd mindet lekéri és a státuszkódot nézi. Nem rekurzív (nem crawler) — a cél
 * a fő navigáció ellenőrzése, nem a teljes oldaltérkép bejárása.
 */
const BASE = "https://kinti.app";
const SEEDS = [
  "/", "/szaknevsor", "/allasok", "/piacter", "/tudasbazis", "/iranytu",
  "/magyar", "/gyik", "/berkalkulator", "/utalas", "/pro", "/kozosseg",
];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) kinti.app-linkcheck";

async function get(url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(30000) });
    const text = res.headers.get("content-type")?.includes("text/html") ? await res.text() : "";
    return { status: res.status, text };
  } catch (e) {
    return { status: 0, text: "", err: String(e?.cause?.code || e?.name || e) };
  }
}

const links = new Set();
for (const seed of SEEDS) {
  const { status, text } = await get(BASE + seed);
  if (status !== 200) {
    console.log(`⚠️  KIINDULÓ oldal nem 200: ${seed} → ${status}`);
    continue;
  }
  for (const m of text.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    // Statikus eszközök és API kihagyva.
    if (/^\/(_next|api|icons|images|fonts|favicon)/.test(href)) continue;
    if (/\.(png|jpg|jpeg|svg|webp|ico|css|js|xml|txt|json|webmanifest)$/i.test(href)) continue;
    links.add(href);
  }
}
console.log(`\n${links.size} egyedi belső hivatkozás a ${SEEDS.length} kiinduló oldalról\n`);

// ⚠️ ALACSONY PÁRHUZAMOSSÁG ÉS SZÜNET — TANULT LECKE. A szkript először 8
// párhuzamos szálon futott, és tömegesen 503-at kapott OLYAN oldalakra is
// (/munkaltato, /szaknevsor/uj), amelyek egyesével lekérve hibátlanul 200-at
// adnak. Vagyis a terhelés MAGA váltotta ki a hibát, és a mérés hamis riasztást
// termelt. Egy link-ellenőrzőnek a NORMÁLIS használatot kell utánoznia,
// különben nem tudod megkülönböztetni a valódi hibát a saját zajodtól.
const bad = [];
const queue = [...links];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function worker() {
  while (queue.length) {
    const href = queue.shift();
    const { status, err } = await get(BASE + href);
    if (status !== 200) {
      // Egy próba nem elég: újramérés szünet után, mielőtt hibának mondanánk.
      await sleep(2500);
      const retry = await get(BASE + href);
      if (retry.status !== 200) bad.push({ href, status: retry.status, err: retry.err });
    }
    await sleep(400);
  }
}
await Promise.all(Array.from({ length: 2 }, worker));

if (bad.length === 0) {
  console.log("✓ Minden belső hivatkozás 200-at ad.");
} else {
  console.log(`✗ ${bad.length} TÖRÖTT hivatkozás:`);
  for (const b of bad.sort((a, c) => a.href.localeCompare(c.href))) {
    console.log(`   ${b.status || b.err}  ${b.href}`);
  }
}
