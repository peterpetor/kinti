/**
 * Kulcs → publikus URL leképezés. Két lehetséges forrás:
 *
 *  1) Saját kiszolgáló (`/api/media/<key>`): mindig működik, a binding adja
 *     vissza a tartalmat, így nem kell a bucket publikus hozzáférést engedjen.
 *  2) Publikus R2-domén (`r2.dev` vagy custom): ha be van állítva a
 *     `NEXT_PUBLIC_R2_PUBLIC_URL` build-változó, akkor onnan tölt — CDN-en
 *     keresztül, gyorsabb és olcsóbb.
 *
 * Ha még nincs kulcs, `null` — a hívó marad a CSS-gradiens placeholderen.
 */
export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const publicBase =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_R2_PUBLIC_URL : undefined;
  if (publicBase && publicBase.length > 0) {
    return `${publicBase.replace(/\/$/, "")}/${encodeURI(key)}`;
  }
  return `/api/media/${encodeURI(key)}`;
}

/**
 * Cloudflare Image Resizing bekapcsolva? `NEXT_PUBLIC_IMAGE_RESIZE=1|true`.
 *
 * Csak a kinti.app zónán működik (a `/cdn-cgi/image/` a Cloudflare élén fut, a
 * pages.dev preview-n NEM), és a zónán engedélyezni kell a transzformációkat.
 * Ezért opt-in, alapból kikapcsolva → flag nélkül a sima `mediaUrl` jön vissza.
 */
function imageResizeEnabled(): boolean {
  const v = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_IMAGE_RESIZE : undefined;
  return v === "1" || v === "true";
}

export interface MediaImageOptions {
  /** Cél-szélesség px-ben (a magasság aránytartással). */
  width?: number;
  /** Cél-magasság px-ben (opcionális). */
  height?: number;
  /** 1–100. Alap: 80. */
  quality?: number;
  /** Illesztés: cover (alap) / contain / scale-down. */
  fit?: "cover" | "contain" | "scale-down";
}

/**
 * Megjelenítéshez optimalizált kép-URL. Ha a Cloudflare Image Resizing be van
 * kapcsolva, `/cdn-cgi/image/...,format=auto/<forrás>` URL-t ad: a Cloudflare a
 * böngésző Accept-fejléce alapján AVIF/WebP-et szolgál ki, a megadott méretre
 * vágva — eredeti R2-objektum újrafeltöltése nélkül. Flag nélkül = `mediaUrl`.
 *
 * Megjegyzés: social/OG-meta képhez NE ezt használd (az abszolút URL-t igényel);
 * arra maradjon a `mediaUrl`.
 */
export function mediaImageUrl(
  key: string | null | undefined,
  opts: MediaImageOptions = {},
): string | null {
  const base = mediaUrl(key);
  if (!base) return null;
  if (!imageResizeEnabled()) return base;

  const params: string[] = [];
  if (opts.width) params.push(`width=${Math.round(opts.width)}`);
  if (opts.height) params.push(`height=${Math.round(opts.height)}`);
  params.push(`fit=${opts.fit ?? "cover"}`);
  params.push(`quality=${opts.quality ?? 80}`);
  params.push("format=auto"); // AVIF/WebP a böngésző-támogatás szerint

  // A forrás lehet abszolút (publikus R2-URL) vagy zóna-relatív (/api/media/...);
  // a `/cdn-cgi/image/<opts>/<forrás>` relatív forrásnál vezető / nélkül várt.
  const source = base.replace(/^\//, "");
  return `/cdn-cgi/image/${params.join(",")}/${source}`;
}
