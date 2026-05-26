import type { SVGProps } from "react";

/**
 * Kategória-ikonok — egy helyen a térkép-pinekhez (HTML-string) ÉS a
 * React-felülethez (CategoryIcon komponens), hogy mindenhol ugyanaz a
 * vonalas ikon jelenjen meg. Új kategóriához itt vegyél fel path-tömböt;
 * ismeretlen kategória → kis pötty.
 */
export const CATEGORY_ICON_PATHS: Record<string, string[]> = {
  fodrasz: [
    "M9 6a3 3 0 1 1-6 0a3 3 0 0 1 6 0",
    "M9 18a3 3 0 1 1-6 0a3 3 0 0 1 6 0",
    "M8.12 8.12L12 12",
    "M20 4L8.12 15.88",
    "M14.8 14.8L20 20",
  ],
  autoszer: [
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  ],
  orvos: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  ugyved: [
    "M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z",
    "M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  ],
  pek: [
    "M12 21V9",
    "M12 9c-2 0-3-2-3-4c2 0 3 2 3 4z",
    "M12 9c2 0 3-2 3-4c-2 0-3 2-3 4z",
    "M12 15c-2 0-3-2-3-4c2 0 3 2 3 4z",
    "M12 15c2 0 3-2 3-4c-2 0-3 2-3 4z",
  ],
  etterem: [
    "M6 3v18",
    "M4 3v4a2 2 0 0 0 4 0V3",
    "M18 21V3c2 1 3 3 3 6s-1 4-3 5",
  ],
  villany: ["M13 2L3 14h9l-1 8l10-12h-9l1-8z"],
  fordito: ["M4 5h16v10H9l-4 4V15H4z", "M8 9h8", "M8 12h5"],
  takarito: [
    "M7 9h8v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z",
    "M9 9V6h4v3",
    "M10 6V4h2v2",
    "M17 5h.01",
    "M19 7h.01",
    "M17 9h.01",
  ],
  it: ["M16 6l6 6l-6 6", "M8 6l-6 6l6 6"],
  // tanár (a landing/demo használja) — könyv
  tanar: [
    "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z",
    "M4 19a2 2 0 0 0 2 2h13",
  ],
};

/** Térkép-pin HTML-stringje (Leaflet divIcon). */
export function categoryIconSvgString(categoryId: string | null): string {
  const paths = categoryId ? CATEGORY_ICON_PATHS[categoryId] : undefined;
  if (!paths) {
    return `<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>`;
  }
  const inner = paths.map((d) => `<path d="${d}"/>`).join("");
  return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export interface CategoryIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  categoryId: string | null;
  size?: number;
}

/** React kategória-ikon (felület: pillek, kártyák). */
export function CategoryIcon({ categoryId, size = 16, ...props }: CategoryIconProps) {
  const paths = categoryId ? CATEGORY_ICON_PATHS[categoryId] : undefined;
  if (!paths) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <circle cx="12" cy="12" r="5" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
