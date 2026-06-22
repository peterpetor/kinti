/**
 * Immerzív, teljes-képernyős folyamatok (Duolingo-stílusú lecke-lejátszók): saját
 * X-bezárás + alsó CTA van, ezért NEM kérünk alsó TabBar-t és nav-rezerv paddingot.
 * A lista-oldalakat (pl. /nyelvlecke, /allasok/szakmai-szotar) a záró perjel ZÁRJA KI.
 */
export const IMMERSIVE_PREFIXES = ["/nyelvlecke/", "/allasok/szakmai-szotar/"];

export function isImmersiveRoute(pathname: string): boolean {
  return IMMERSIVE_PREFIXES.some((p) => pathname.startsWith(p));
}
