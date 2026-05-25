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
