import { chromium } from "playwright";

/**
 * Design-audit: vízszintes túlcsordulás, apró tap-célpont, kontraszt.
 * ⚠️ A kontrasztot SZÁMOLJUK (WCAG relatív luminancia), nem ránézésre becsüljük.
 */
const OLDALAK = [
  ["/", "Kezdőlap"],
  ["/szaknevsor", "Szaknévsor"],
  ["/allasok", "Állások"],
  ["/piacter", "Piactér"],
  ["/hova-koltozzek", "Hová költözzek"],
  ["/berkalkulator", "Bérkalkulátor"],
  ["/iranytu", "Iránytű"],
  ["/tudasbazis", "Tudásbázis"],
  ["/pro", "PRO"],
  ["/gyik", "GYIK"],
  ["/utalas", "Utalás"],
  ["/tanulas", "Tanulás"],
];

const AUDIT = () => {
  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x)); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const ratio = (f, b) => { const L1 = lum(f), L2 = lum(b); const [a, c] = L1 > L2 ? [L1, L2] : [L2, L1]; return (a + 0.05) / (c + 0.05); };
  const hatter = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.6) return bg.rgb;
      n = n.parentElement;
    }
    return [255, 255, 255];
  };

  const W = window.innerWidth;
  const tullogo = [], apro = [], kontraszt = [];
  const latott = new Set();

  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.opacity === "0") continue;
    const szoveg = (el.textContent || "").trim();

    // 1) Vízszintes túllógás (a viewport JOBB széle) — a sr-only -9999px kivéve.
    if (r.right > W + 1 && r.left > -1000 && szoveg && !latott.has("o" + szoveg.slice(0, 30))) {
      latott.add("o" + szoveg.slice(0, 30));
      tullogo.push({ t: szoveg.slice(0, 40), jobb: Math.round(r.right) });
    }

    // 2) Apró tap-célpont (csak interaktív, csak levél-elem).
    const interaktiv = el.matches("button, a, [role=button], select, input[type=checkbox], input[type=radio]");
    if (interaktiv && (r.width < 32 || r.height < 32) && szoveg.length < 30) {
      const k = "t" + szoveg.slice(0, 20) + Math.round(r.width) + "x" + Math.round(r.height);
      if (!latott.has(k)) { latott.add(k);
        apro.push({ t: szoveg.slice(0, 26) || el.getAttribute("aria-label") || el.tagName, w: Math.round(r.width), h: Math.round(r.height) }); }
    }

    // 3) Kontraszt — csak közvetlen szöveges levél-elemek.
    const sajatSzoveg = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (sajatSzoveg) {
      const fg = parse(cs.color);
      if (fg && fg.a > 0.5) {
        const bg = hatter(el);
        const ar = ratio(fg.rgb, bg);
        const px = parseFloat(cs.fontSize);
        const vastag = parseInt(cs.fontWeight) >= 700;
        const nagy = px >= 24 || (px >= 18.66 && vastag);
        const kell = nagy ? 3 : 4.5;
        if (ar < kell) {
          const t = szoveg.slice(0, 34);
          if (!latott.has("k" + t)) { latott.add("k" + t);
            kontraszt.push({ t, ar: ar.toFixed(2), kell, px: Math.round(px) }); }
        }
      }
    }
  }
  return { tullogo: tullogo.slice(0, 6), apro: apro.slice(0, 6), kontraszt: kontraszt.slice(0, 8) };
};

const b = await chromium.launch();
for (const tema of ["warm", "dark"]) {
  console.log(`\n================ TÉMA: ${tema} ================`);
  for (const [ut, nev] of OLDALAK) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript((t) => {
      localStorage.setItem("kinti.country", "DE");
      localStorage.setItem("kinti_legal_accepted", "true");
      localStorage.setItem("kinti-theme", t);
    }, tema);
    const p = await ctx.newPage();
    try {
      await p.goto("https://kinti.app" + ut, { waitUntil: "domcontentloaded", timeout: 60000 });
      try { await p.waitForSelector("main, h1", { timeout: 20000 }); } catch {}
      await p.waitForTimeout(3500);
      const r = await p.evaluate(AUDIT);
      const gond = r.tullogo.length + r.apro.length + r.kontraszt.length;
      if (gond === 0) { console.log(`  ✔ ${nev}`); }
      else {
        console.log(`  ✖ ${nev}`);
        for (const x of r.tullogo) console.log(`      TÚLLÓG  „${x.t}" → ${x.jobb}px`);
        for (const x of r.apro) console.log(`      APRÓ    „${x.t}" ${x.w}×${x.h}px`);
        for (const x of r.kontraszt) console.log(`      KONTR.  „${x.t}" ${x.ar}:1 (kell ${x.kell}, ${x.px}px)`);
      }
    } catch (e) { console.log(`  ! ${nev}: ${String(e).slice(0, 70)}`); }
    await ctx.close();
  }
}
await b.close();
