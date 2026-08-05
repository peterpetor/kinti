const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (f, b) => { const L1 = lum(f), L2 = lum(b); const [a, c] = L1 > L2 ? [L1, L2] : [L2, L1]; return (a + 0.05) / (c + 0.05); };
const hex = ([r,g,b]) => "#" + [r,g,b].map((x) => Math.round(x).toString(16).padStart(2,"0")).join("");

const T = {
  warm: {
    bg: [244,237,224], surface: [255,255,255], surfaceAlt: [251,247,238],
    text: [14,31,23], muted: [92,109,99], faint: [148,160,151],
    primary: [29,68,52], accent: [200,57,46],
  },
  dark: {
    bg: [16,20,17], surface: [26,32,28], surfaceAlt: [21,27,23],
    text: [236,231,220], muted: [156,168,159], faint: [110,121,113],
    primary: [70,128,98], accent: [224,90,78],
  },
};

for (const [nev, t] of Object.entries(T)) {
  console.log(`\n=== ${nev} ===`);
  for (const fgN of ["text","muted","faint","primary","accent"]) {
    const sorok = ["surface","bg","surfaceAlt"].map((bgN) => `${bgN}: ${ratio(t[fgN], t[bgN]).toFixed(2)}`);
    console.log(`  ${fgN.padEnd(8)} ${hex(t[fgN])}  ${sorok.join("  ")}`);
  }
}

/** A legkisebb világosság-eltolás, ami 4.5:1-et ad a legvilágosabb háttéren. */
function javit(fg, hatterek, cel = 4.5, sotetit = true) {
  let best = null;
  for (let i = 0; i <= 100; i++) {
    const k = sotetit ? 1 - i / 100 : 1 + i / 100;
    const uj = fg.map((c) => Math.max(0, Math.min(255, Math.round(sotetit ? c * k : c + (255 - c) * (i / 100)))));
    if (hatterek.every((b) => ratio(uj, b) >= cel)) { best = uj; break; }
  }
  return best;
}

console.log("\n=== JAVASLAT (min. eltolás 4.5:1-hez MINDEN felületen) ===");
const w = T.warm, d = T.dark;
for (const [n, fg, hs] of [["warm muted", w.muted, [w.surface, w.bg, w.surfaceAlt]],
                          ["warm faint", w.faint, [w.surface, w.bg, w.surfaceAlt]]]) {
  const uj = javit(fg, hs, 4.5, true);
  console.log(`  ${n}: ${hex(fg)} → ${hex(uj)}  (${uj.join(" ")})  arányok: ${hs.map((b)=>ratio(uj,b).toFixed(2)).join(" / ")}`);
}
for (const [n, fg, hs] of [["dark muted", d.muted, [d.surface, d.bg, d.surfaceAlt]],
                          ["dark faint", d.faint, [d.surface, d.bg, d.surfaceAlt]]]) {
  const uj = javit(fg, hs, 4.5, false);
  console.log(`  ${n}: ${hex(fg)} → ${hex(uj)}  (${uj.join(" ")})  arányok: ${hs.map((b)=>ratio(uj,b).toFixed(2)).join(" / ")}`);
}
