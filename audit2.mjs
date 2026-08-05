import { chromium } from "playwright";
const OLDALAK = [["/", "Kezdőlap"], ["/szaknevsor", "Szaknévsor"], ["/allasok", "Állások"],
  ["/piacter", "Piactér"], ["/hova-koltozzek", "Hová költözzek"], ["/berkalkulator", "Bérkalkulátor"],
  ["/iranytu", "Iránytű"], ["/tudasbazis", "Tudásbázis"], ["/pro", "PRO"], ["/gyik", "GYIK"], ["/utalas", "Utalás"]];

const KONTRASZT = () => {
  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(",").map(parseFloat); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const ratio = (f, b) => { const A = lum(f), B = lum(b); const [x, y] = A > B ? [A, B] : [B, A]; return (x + 0.05) / (y + 0.05); };
  const hatter = (el) => { let n = el;
    while (n && n !== document.documentElement) { const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.6) return bg.rgb; n = n.parentElement; } return [255, 255, 255]; };
  const ki = []; const latott = new Set();
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.opacity === "0") continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
    const fg = parse(cs.color); if (!fg || fg.a <= 0.5) continue;
    const a = ratio(fg.rgb, hatter(el));
    const px = parseFloat(cs.fontSize), vastag = parseInt(cs.fontWeight) >= 700;
    const kell = (px >= 24 || (px >= 18.66 && vastag)) ? 3 : 4.5;
    if (a < kell) { const t = (el.textContent || "").trim().slice(0, 32);
      if (t && !latott.has(t)) { latott.add(t); ki.push(`„${t}" ${a.toFixed(2)}:1 (kell ${kell})`); } }
  }
  return ki.slice(0, 5);
};

const b = await chromium.launch();
for (const tema of ["warm", "dark"]) {
  console.log(`\n===== ${tema} =====`);
  for (const [ut, nev] of OLDALAK) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript((t) => { localStorage.setItem("kinti.country", "DE");
      localStorage.setItem("kinti_legal_accepted", "true"); localStorage.setItem("kinti-theme", t); }, tema);
    const p = await ctx.newPage();
    try {
      await p.goto("https://kinti.app" + ut, { waitUntil: "domcontentloaded", timeout: 60000 });
      try { await p.waitForSelector("main, h1", { timeout: 20000 }); } catch {}
      await p.waitForTimeout(3500);
      const gond = await p.evaluate(KONTRASZT);
      console.log(gond.length === 0 ? `  ✔ ${nev}` : `  ✖ ${nev}`);
      for (const g of gond) console.log(`      ${g}`);
    } catch (e) { console.log(`  ! ${nev}`); }
    await ctx.close();
  }
}
await b.close();
