// gen-splash.mjs — iOS PWA indító-képernyők (apple-touch-startup-image).
// A logót (icon-512) a márka-bézs háttérre komponálja, minden gyakori iPhone
// felbontásra. Futtatás:  node scripts/gen-splash.mjs
// Utána a kiírt startupImage tömböt a src/app/layout.tsx appleWebApp-jába tesszük.
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BG = { r: 244, g: 237, b: 224, alpha: 1 }; // #f4ede0 (app-bézs)
const OUT_DIR = resolve(root, "public/icons/splash");

// { CSS device-width, CSS device-height, pixel-ratio } → png felbontás.
const DEVICES = [
  { dw: 430, dh: 932, r: 3 }, // 15/14 Pro Max
  { dw: 393, dh: 852, r: 3 }, // 15/14 Pro
  { dw: 390, dh: 844, r: 3 }, // 15/14/13
  { dw: 375, dh: 812, r: 3 }, // X/XS/11 Pro
  { dw: 414, dh: 896, r: 3 }, // XS Max/11 Pro Max
  { dw: 414, dh: 896, r: 2 }, // XR/11
  { dw: 414, dh: 736, r: 3 }, // 8 Plus
  { dw: 375, dh: 667, r: 2 }, // 8/SE2/SE3
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const logoBuf = await readFile(resolve(root, "public/icons/icon-512.png"));
  const startupImage = [];

  for (const d of DEVICES) {
    const w = Math.round(d.dw * d.r);
    const h = Math.round(d.dh * d.r);
    const logoSize = Math.round(Math.min(w, h) * 0.32);
    const logo = await sharp(logoBuf).resize(logoSize, logoSize, { fit: "contain" }).png().toBuffer();
    const file = `splash-${w}x${h}.png`;
    await sharp({ create: { width: w, height: h, channels: 4, background: BG } })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toFile(resolve(OUT_DIR, file));
    startupImage.push({
      url: `/icons/splash/${file}`,
      media: `(device-width: ${d.dw}px) and (device-height: ${d.dh}px) and (-webkit-device-pixel-ratio: ${d.r}) and (orientation: portrait)`,
    });
    console.error(`  ✓ ${file}`);
  }

  // A layout.tsx-be másolható tömb:
  console.log(JSON.stringify(startupImage, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
