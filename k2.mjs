const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r,g,b]) => 0.2126*srgb(r) + 0.7152*srgb(g) + 0.0722*srgb(b);
const ratio = (f,b) => { const A=lum(f), B=lum(b); const [x,y] = A>B?[A,B]:[B,A]; return (x+0.05)/(y+0.05); };
const hex = ([r,g,b]) => "#" + [r,g,b].map((x)=>Math.round(x).toString(16).padStart(2,"0")).join("");

const feher = [255,255,255];
const darkSurface = [26,32,28], darkBg = [16,20,17], darkAlt = [21,27,23];
const primaryDark = [70,128,98];

console.log("fehér a dark --primary-n:", ratio(feher, primaryDark).toFixed(2));
console.log("dark --primary a felületeken:", [darkSurface,darkBg,darkAlt].map(b=>ratio(primaryDark,b).toFixed(2)).join(" / "));

// Mennyire kell világosítani, hogy SZÖVEGKÉNT 4.5 legyen a legvilágosabb sötét felületen?
for (let i = 0; i <= 60; i++) {
  const uj = primaryDark.map((c) => Math.round(c + (255 - c) * (i/100)));
  const minSzoveg = Math.min(...[darkSurface,darkBg,darkAlt].map(b=>ratio(uj,b)));
  if (minSzoveg >= 4.5) {
    console.log(`  → +${i}% világosítás: ${hex(uj)} — szöveg ${minSzoveg.toFixed(2)}, fehér RAJTA ${ratio(feher,uj).toFixed(2)}`);
    break;
  }
}
