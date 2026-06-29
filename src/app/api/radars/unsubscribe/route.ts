import { deleteRadarById } from "@/lib/repo-misc";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/radars/unsubscribe?id=<radarId> — az email-riasztó leiratkozó linkje.
 * A radar id egy kitalálhatatlan UUID, ezért alacsony tét mellett elég azonosító.
 * Mindig barátságos HTML-t ad vissza (akkor is, ha a radar már nem létezik).
 */
export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (id) {
    try {
      await deleteRadarById(id);
    } catch (err) {
      safeLogError("api/radars/unsubscribe", err);
    }
  }
  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Leiratkozás · Kinti</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:#f4ede0;margin:0;min-height:100vh;display:grid;place-items:center;padding:24px">
  <div style="max-width:420px;text-align:center;background:#fff;border-radius:20px;padding:32px;box-shadow:0 6px 24px rgba(0,0,0,.06)">
    <div style="font-size:40px">📭</div>
    <h1 style="font-size:20px;color:#1d4434;margin:12px 0 6px">Leiratkoztál</h1>
    <p style="font-size:14px;color:#374151;margin:0 0 20px">Erről az állás-radarról többé nem küldünk emailt. Bármikor beállíthatsz újat.</p>
    <a href="https://kinti.app/allasok" style="display:inline-block;background:#1d4434;color:#fff;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:999px;font-size:14px">Vissza az állásokhoz</a>
  </div>
</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
