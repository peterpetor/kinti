import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * /api/og — dinamikus OG-előnézeti kártya (1200×630) megosztáshoz (FB, WhatsApp,
 * stb.). Query: ?type=business|event|job&title=…&subtitle=…&badge=…
 *
 * A magyar ékezetekhez Inter latin + latin-ext TTF-et töltünk futásidőben
 * (Satori csak TTF/OTF/WOFF-ot fogad — woff2-t nem), isolate-onként cache-elve.
 */
const FONT = {
  latin: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
  latinExt: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-ext-700-normal.ttf",
};

let fontCache: { latin: ArrayBuffer; latinExt: ArrayBuffer } | null = null;
async function loadFonts() {
  if (fontCache) return fontCache;
  const [latin, latinExt] = await Promise.all([
    fetch(FONT.latin).then((r) => r.arrayBuffer()),
    fetch(FONT.latinExt).then((r) => r.arrayBuffer()),
  ]);
  fontCache = { latin, latinExt };
  return fontCache;
}

const TYPE_LABEL: Record<string, string> = {
  business: "SZAKNÉVSOR",
  event: "KÖZÖSSÉGI ESEMÉNY",
  job: "ÁLLÁS",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "kinti").slice(0, 90);
  const subtitle = (searchParams.get("subtitle") || "").slice(0, 110);
  const type = searchParams.get("type") || "business";
  const badge = (searchParams.get("badge") || "").slice(0, 32);
  const label = TYPE_LABEL[type] ?? "KINTI";

  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #0e1f17 0%, #1d4434 100%)",
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        {/* Fejléc: kinti wordmark + típus-címke */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", width: "44px", height: "44px", borderRadius: "12px", background: "#ffffff" }} />
            <div style={{ display: "flex", fontSize: "40px", color: "#ffffff" }}>kinti</div>
            <div style={{ display: "flex", width: "40px", height: "28px", borderRadius: "4px", background: "#d8232a", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "26px" }}>
              +
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.12)",
              fontSize: "24px",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {label}
          </div>
        </div>

        {/* Cím + alcím */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ display: "flex", fontSize: title.length > 42 ? "64px" : "80px", lineHeight: 1.05, color: "#ffffff" }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", fontSize: "36px", color: "rgba(255,255,255,0.78)" }}>{subtitle}</div>
          ) : null}
          {badge ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: "8px",
                padding: "8px 20px",
                borderRadius: "999px",
                background: "#e3a233",
                color: "#1a1205",
                fontSize: "28px",
              }}
            >
              {badge}
            </div>
          ) : null}
        </div>

        {/* Lábléc */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "28px", color: "rgba(255,255,255,0.7)" }}>
          <div style={{ display: "flex" }}>kinti.app</div>
          <div style={{ display: "flex" }}>Magyar közösség és szakemberek Svájcban</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: fonts.latin, weight: 700, style: "normal" },
        { name: "Inter", data: fonts.latinExt, weight: 700, style: "normal" },
      ],
      headers: { "cache-control": "public, max-age=86400, s-maxage=604800" },
    },
  );
}
