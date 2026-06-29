/**
 * events-tags.ts — az események kategória-metaadata (címke, emoji, szín).
 * SZÁNDÉKOSAN leaflet-mentes: az events-map-view (SSR-elt kliens-komponens) innen
 * importál, NEM az events-map.tsx-ből — különben az SSR behúzná a leaflet-et és a
 * modul-tetős `L.divIcon` hívást → `window is not defined` → 500. Lásd events-map.tsx.
 */
export const EVENT_TAGS: Record<string, { label: string; emoji: string; color: string }> = {
  koncert:   { label: "Koncert / fellépés", emoji: "🎵", color: "#8b5cf6" },
  talalkozo: { label: "Találkozó / közösség", emoji: "🤝", color: "#1d4434" },
  bolt:      { label: "Magyar bolt", emoji: "🛒", color: "#c8392e" },
  etterem:   { label: "Magyar étterem", emoji: "🍽️", color: "#e2901a" },
  egyeb:     { label: "Egyéb", emoji: "📌", color: "#5c6d63" },
};
