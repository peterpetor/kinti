import type { SVGProps } from "react";

/**
 * Kinti vonal-ikonkészlet (24px viewBox, currentColor). A prototípus
 * kinti-icons.jsx Icons objektumából átemelve. Mivel currentColor-t használ,
 * a színt a szülő `text-*` osztálya adja → téma-reaktív.
 */
export type IconName =
  | "search" | "pin" | "list" | "map" | "users" | "user" | "home" | "phone" | "nav"
  | "globe" | "star" | "heart" | "arrowLeft" | "arrowRight" | "arrowUp"
  | "more" | "close" | "check" | "plus" | "filter" | "clock" | "calendar"
  | "share" | "bookmark" | "chevR" | "chevD" | "chevU" | "sliders" | "bell"
  | "trending" | "eye" | "cursor" | "flag" | "send" | "car" | "question"
  | "facebook" | "instagram" | "linkedin" | "youtube" | "tiktok" | "shoppingBag" | "briefcase"
  | "sparkles" | "magic" | "trash" | "qrCode" | "document" | "upload" | "lock"
  | "compass" | "mail" | "shareIos" | "whatsapp" | "bed";

const PATHS: Record<IconName, string[]> = {
  bed: ["M2 18v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8", "M2 14h20", "M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"],
  lock: ["M6 10h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z", "M8 10V7a4 4 0 0 1 8 0v3"],
  search: ["M11 4a7 7 0 1 1 0 14a7 7 0 0 1 0-14", "M16.5 16.5L21 21"],
  pin: ["M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z", "M12 11.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z"],
  list: ["M4 6h16", "M4 12h16", "M4 18h10"],
  map: ["M3 6l6-2l6 2l6-2v14l-6 2l-6-2l-6 2z", "M9 4v16", "M15 6v16"],
  users: ["M3 20c0-3 3-5 6-5s6 2 6 5", "M9 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8", "M15 14c2.5 0 6 1.5 6 5", "M16 3.5a4 4 0 0 1 0 7"],
  user: ["M4 20c0-4 4-6 8-6s8 2 8 6", "M12 12a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9"],
  home: ["M3 11l9-7l9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
  phone: ["M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"],
  nav: ["M3 11l18-8l-8 18l-2-8z"],
  mail: ["M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "M3.5 6.5l8.5 6l8.5-6"],
  globe: ["M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18", "M3 12h18", "M12 3a14 14 0 0 1 0 18", "M12 3a14 14 0 0 0 0 18"],
  star: ["M12 3l2.7 5.6l6.3.9l-4.5 4.4l1 6.1L12 17.5l-5.5 2.5l1-6.1L3 9.5l6.3-.9z"],
  heart: ["M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"],
  arrowLeft: ["M19 12H5", "M12 5l-7 7l7 7"],
  arrowRight: ["M5 12h14", "M12 5l7 7l-7 7"],
  arrowUp: ["M12 5v14", "M5 12l7-7l7 7"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  close: ["M6 6l12 12", "M18 6l-12 12"],
  check: ["M4 12l5 5L20 6"],
  plus: ["M12 5v14", "M5 12h14"],
  filter: ["M3 5h18", "M6 12h12", "M10 19h4"],
  clock: ["M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18", "M12 7v5l3 2"],
  calendar: ["M4 7h16v13H4z", "M4 7l0-2h16v2", "M9 3v4", "M15 3v4", "M4 11h16"],
  // share = a széles körben ismert „három pötty + vonalak" (Android/Material)
  // megosztás-ikon — a régi iOS-stílusú (doboz+nyíl) glyph nem volt felismerhető
  // (user-visszajelzés, 2026-07-10). Az iOS-oktatóhoz a shareIos maradt.
  share: [
    "M18 8a3 3 0 1 0 0-6a3 3 0 0 0 0 6",
    "M6 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6",
    "M18 22a3 3 0 1 0 0-6a3 3 0 0 0 0 6",
    "M8.7 10.7l6.6-3.9",
    "M8.7 13.3l6.6 3.9",
  ],
  // A Safari valódi megosztás-gombjának glyph-je (doboz + felfelé nyíl) — CSAK
  // az iOS "Hozzáadás a főképernyőhöz" oktatóban használjuk (install-prompt),
  // mert ott a BÖNGÉSZŐ gombjára mutatunk rá.
  shareIos: ["M12 4v12", "M7 9l5-5l5 5", "M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"],
  // WhatsApp: beszéd-buborék farokkal + kagyló-ív (stroke-stílusban).
  whatsapp: [
    "M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.3A9 9 0 1 0 12 3",
    "M9.2 8.4l1 1.9-0.9 1a7.5 7.5 0 0 0 3.4 3.4l1-0.9 1.9 1c0.5 0.3 0.6 0.9 0.2 1.3-0.7 0.7-1.7 1-2.6 0.6a10.5 10.5 0 0 1-4.9-4.9c-0.4-0.9-0.1-1.9 0.6-2.6 0.4-0.4 1-0.3 1.3 0.2",
  ],
  bookmark: ["M6 4h12v17l-6-4l-6 4z"],
  chevR: ["M9 5l7 7l-7 7"],
  chevD: ["M5 9l7 7l7-7"],
  chevU: ["M5 15l7-7l7 7"],
  sliders: ["M4 6h10", "M18 6h2", "M4 12h4", "M12 12h8", "M4 18h12", "M20 18h0"],
  bell: ["M6 9a6 6 0 1 1 12 0v5l2 2H4l2-2z", "M10 19a2 2 0 0 0 4 0"],
  trending: ["M3 17l6-6l4 4l8-8", "M14 7h7v7"],
  eye: ["M2 12s4-7 10-7s10 7 10 7s-4 7-10 7s-10-7-10-7", "M12 9a3 3 0 1 1 0 6a3 3 0 0 1 0-6"],
  cursor: ["M4 4l16 6l-7 2l-2 7z"],
  flag: ["M5 21V4", "M5 5h12l-2 4l2 4H5"],
  send: ["M22 2L11 13M22 2l-7 20l-4-9l-9-4z"],
  car: [
    "M14 16H9",
    "M19 16h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2",
    "M4 16.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0-5 0",
    "M14 16.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0-5 0",
  ],
  question: [
    "M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18",
    "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7v.5",
    "M12 17h.01",
  ],
  facebook: ["M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"],
  instagram: ["M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", "M17.5 6.5h.01", "M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12z"],
  linkedin: ["M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", "M2 9h4v12H2z", "M4 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4z"],
  youtube: ["M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17", "M10 15l5-3l-5-3z"],
  tiktok: ["M9 12a4 4 0 1 0 4 4V4", "M13 4a5 5 0 0 0 5 5"],
  shoppingBag: ["M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  briefcase: ["M4 8h16a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1z", "M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M3 13h18"],
  sparkles: ["M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z", "M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z"],
  magic: ["M3 21l9-9", "M14 7l3 3", "M15 4l1 2l2 1l-2 1l-1 2l-1-2l-2-1l2-1z", "M20 11l.6 1.4l1.4.6l-1.4.6L20 15l-.6-1.4L18 13l1.4-.6z"],
  trash: ["M3 6h18", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6"],
  qrCode: [
    "M4 4h6v6H4z",
    "M14 4h6v6h-6z",
    "M4 14h6v6H4z",
    "M14 14h2v2h-2z",
    "M18 18h2v2h-2z",
    "M18 14h2v2h-2z",
    "M14 18h2v2h-2z",
    "M9 9h6v6H9z",
  ],
  document: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8",
    "M16 17H8",
    "M10 9H8"
  ],
  upload: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5l-5 5", "M12 3v12"],
  // Iránytű: kör + rombusz-tű (Lucide compass).
  compass: ["M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18", "M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88z"],
};

// A '…' (more) három pöttye vastagabb vonallal néz jól ki.
const STROKE_OVERRIDE: Partial<Record<IconName, number>> = { more: 3.4 };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Kitöltött ikon (pl. csillag): fill=currentColor, nincs vonal. */
  filled?: boolean;
}

export function Icon({ name, size = 20, strokeWidth, filled = false, ...props }: IconProps) {
  const sw = strokeWidth ?? STROKE_OVERRIDE[name] ?? 1.8;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? 0 : sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
