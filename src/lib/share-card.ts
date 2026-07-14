/**
 * share-card.ts — megosztható, branded CÉGKÁRTYA-kép renderelése canvasra.
 *
 * A diaszpóra WhatsApp/FB-csoportokban él: egy szép, QR-os képkártya ott
 * sokkal messzebbre jut, mint egy csupasz link. A kártya kliensoldalon,
 * függőség nélkül készül (canvas + a meglévő `qrcode` lib) — 1080×1350
 * (4:5, a csoport-feedekben a legnagyobb felület).
 *
 * Használat: ShareSheet `card` prop → „Megosztható kártya (kép)" sor.
 */
import QRCode from "qrcode";

export interface ShareCardData {
  name: string;
  categoryLabel: string;
  address?: string | null;
  url: string;
}

// Kinti brand-színek (tailwind.config warm téma).
const INK = "#0e1f17";
const MUTED = "#5c6d63";
const CREAM = "#f4ede0";
const PINE = "#1d4434";
const PINE_SOFT = "#e6ebe5";
const PAPRIKA = "#c8392e";

/** Szöveg tördelése max szélességre (legfeljebb maxLines sor, utolsó sor „…"). */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (ctx.measureText(probe).width <= maxWidth || !line) {
      line = probe;
    } else {
      lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line) lines.push(line);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** A kártya PNG data-URL-je. Csak böngészőben hívható (canvas). */
export async function renderBusinessCard(data: ShareCardData): Promise<string> {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas nem támogatott");

  // Háttér — márka-krém.
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Fejléc-sáv — fenyőzöld, kinti wordmark + tagline.
  ctx.fillStyle = PINE;
  ctx.fillRect(0, 0, W, 220);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 84px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillText("Kinti", 72, 96);
  // paprika-piros pötty a wordmark után (pin-utalás)
  const dotX = 72 + ctx.measureText("Kinti").width + 26;
  ctx.fillStyle = PAPRIKA;
  ctx.beginPath();
  ctx.arc(dotX, 118, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText("Magyar szaknévsor külföldön", 72, 168);

  // Kategória-chip.
  ctx.font = `700 36px ${FONT}`;
  const catText = data.categoryLabel.toUpperCase();
  const chipW = ctx.measureText(catText).width + 64;
  ctx.fillStyle = PINE_SOFT;
  roundRect(ctx, 72, 300, chipW, 76, 38);
  ctx.fill();
  ctx.fillStyle = PINE;
  ctx.fillText(catText, 104, 340);

  // Cégnév (max 3 sor).
  ctx.fillStyle = INK;
  ctx.font = `800 88px ${FONT}`;
  const nameLines = wrapText(ctx, data.name, W - 144, 3);
  let y = 500;
  for (const line of nameLines) {
    ctx.fillText(line, 72, y);
    y += 104;
  }

  // Cím (max 2 sor).
  if (data.address) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 42px ${FONT}`;
    for (const line of wrapText(ctx, `📍 ${data.address}`, W - 144, 2)) {
      ctx.fillText(line, 72, y);
      y += 58;
    }
  }

  // Alsó fehér kártya: QR + felhívás.
  const boxY = 900, boxH = 360;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 72, boxY, W - 144, boxH, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(28,61,46,0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, 72, boxY, W - 144, boxH, 28);
  ctx.stroke();

  const qrSize = 280;
  const qrDataUrl = await QRCode.toDataURL(data.url, {
    width: qrSize,
    margin: 1,
    color: { dark: PINE, light: "#ffffff" },
  });
  const qrImg = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = () => reject(new Error("QR betöltési hiba"));
    qrImg.src = qrDataUrl;
  });
  ctx.drawImage(qrImg, W - 72 - 40 - qrSize, boxY + (boxH - qrSize) / 2, qrSize, qrSize);

  const textX = 120;
  ctx.fillStyle = INK;
  ctx.font = `800 44px ${FONT}`;
  ctx.fillText("Szkenneld be, és", textX, boxY + 110);
  ctx.fillText("nézd meg a Kintin", textX, boxY + 168);
  ctx.fillStyle = MUTED;
  ctx.font = `500 32px ${FONT}`;
  const shortUrl = data.url.replace(/^https?:\/\//, "");
  for (const line of wrapText(ctx, shortUrl, W - 144 - qrSize - 120, 2)) {
    ctx.fillText(line, textX, boxY + 240);
  }

  // Lábléc.
  ctx.fillStyle = MUTED;
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText("Magyar szakemberek, anyanyelven, helyben · kinti.app", 72, H - 56);

  return canvas.toDataURL("image/png");
}

/** Megosztás natívan (fájllal, ha lehet), különben letöltés. Visszaad: "shared" | "downloaded". */
export async function shareOrDownloadCard(dataUrl: string, filename: string, title: string): Promise<"shared" | "downloaded"> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title });
      return "shared";
    }
  } catch {
    /* natív megosztás megszakítva/nem támogatott → letöltés */
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return "downloaded";
}
