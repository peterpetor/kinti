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
  tanar: [
    "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z",
    "M4 19a2 2 0 0 0 2 2h13",
  ],
  konyveles: [
    "M12 20V10",
    "M18 20V4",
    "M6 20v-4",
  ],
  epitoipar: [
    "M18.37 2.29a2.12 2.12 0 0 0-3 0l-3 3a2.12 2.12 0 0 0 0 3l.71.71L3 19a2.12 2.12 0 1 0 3 3l9.9-9.9.71.71a2.12 2.12 0 0 0 3 0l3-3a2.12 2.12 0 0 0 0-3z",
  ],
  szepseg: [
    "M12 12m-3 0a3 3 0 1 0 6 0A3 3 0 1 0 9 12",
    "M12 2a15 15 0 0 0-3 7.5A15 15 0 0 0 12 17a15 15 0 0 0 3-7.5A15 15 0 0 0 12 2z",
    "M2 12a15 15 0 0 0 7.5 3A15 15 0 0 0 17 12a15 15 0 0 0-7.5-3A15 15 0 0 0 2 12z",
  ],
  masszazs: [
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  ],
  futas: [
    "M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8",
    "M14 6h4l4 4v6a2 2 0 0 1-2 2h-2",
    "M6 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
    "M18 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  ],
  babysitter: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10z",
    "M8 14s1.5 2 4 2 4-2 4-2",
    "M9 9h.01",
    "M15 9h.01",
  ],
  kertesz: [
    "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.2 0 8.5C17 15.5 13.8 19 11 20Z",
    "M9 10a5 5 0 0 0-5 5",
    "M12 22v-3",
  ],
  lakatos: [
    "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l1.5 1.5M15.5 7.5L19 4",
  ],
  gazvez: [
    "M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z",
  ],
  marketing: [
    "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
    "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  ],
  tisztito: [
    "M12 2a3 3 0 0 0-3 3c0 .828.337 1.58.879 2.121L2 14.242V20h20v-5.758L14.121 7.121A3 3 0 0 0 12 2z",
  ],
  allat: [
    "M12 14c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3z",
    "M12 4c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1z",
    "M6 8c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1z",
    "M18 8c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1z",
    "M12 22a5 5 0 0 0 5-5c0-2-3-5-5-5s-5 3-5 5a5 5 0 0 0 5 5z",
  ],
  ingatlan: [
    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    "M9 22V12h6v10",
  ],
  biztositas: [
    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  ],
  pszichologus: [
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
    "M12 5v14",
  ],
  zenesz: [
    "M9 18V5l12-2v13",
    "M6 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    "M18 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  ],
  edzo: [
    "M6.5 6.5h11",
    "M6.5 17.5h11",
    "M3 10h18",
    "M3 14h18",
    "M3 6.5h3.5v11H3z",
    "M17.5 6.5h3.5v11h-3.5z",
  ],
  asztalos: [
    "M20 20L4 4",
    "M6 4l2 2H6",
    "M10 8l2 2H10",
    "M14 12l2 2h-2",
    "M18 16l2 2h-2",
  ],
  cukrasz: [
    "M12 2v4",
    "M18 8H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z",
    "M4 14h16",
  ],
  autoberles: [
    "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12.5V16c0 .6.4 1 1 1h2",
    "M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M13 17H11",
  ],
  szallas: [
    "M2 4v16",
    "M2 8h18a2 2 0 0 1 2 2v10",
    "M2 17h20",
    "M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  ],
  rendezveny: [
    "M20 12a8 8 0 1 0-16 0c0 5.25 8 10 8 10s8-4.75 8-10z",
    "M12 2v4",
    "M12 20v2",
  ],
  klima: [
    "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z",
  ],
  nyomda: [
    "M6 9V2h12v7",
    "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
    "M18 14H6v8h12z",
  ],
  tanacsadas: [
    "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z",
    "M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  ],
  webshop: [
    "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6",
    "M21 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    "M11 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  ],
  takaritas_ipari: [
    "M12 2L2 7v10l10 5 10-5V7L12 2z",
    "M12 22V12",
  ],
  biztonsag: [
    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z",
    "M7 11V7a5 5 0 0 1 10 0v4",
  ],
  lakberendezes: [
    "M4 10h16v8H4z",
    "M2 18h20v2H2z",
    "M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4",
  ],
  terkovezes: [
    "M3 3h18v18H3z",
    "M3 9h18",
    "M3 15h18",
    "M9 3v18",
    "M15 3v18",
  ],
  animator: [
    "M12 2a6 6 0 0 0-6 6c0 5.25 6 11 6 11s6-5.75 6-11a6 6 0 0 0-6-6z",
    "M12 19v3",
  ],
  fogorvos: [
    "M12 2C8 2 7 4 7 8c0 3 .5 6-1.5 8.5C4.3 17.8 4 19 4 20a2 2 0 0 0 2 2c1.5 0 3-.5 4.5-2c1.5 1.5 3 2 4.5 2a2 2 0 0 0 2-2c0-1-.3-2.2-1.5-3.5C13.5 14 14 11 14 8c0-4-1-6-5-6z",
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
