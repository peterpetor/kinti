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
  | "trending" | "eye" | "cursor" | "flag" | "send";

const PATHS: Record<IconName, string[]> = {
  search: ["M11 4a7 7 0 1 1 0 14a7 7 0 0 1 0-14", "M16.5 16.5L21 21"],
  pin: ["M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z", "M12 11.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z"],
  list: ["M4 6h16", "M4 12h16", "M4 18h10"],
  map: ["M3 6l6-2l6 2l6-2v14l-6 2l-6-2l-6 2z", "M9 4v16", "M15 6v16"],
  users: ["M3 20c0-3 3-5 6-5s6 2 6 5", "M9 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8", "M15 14c2.5 0 6 1.5 6 5", "M16 3.5a4 4 0 0 1 0 7"],
  user: ["M4 20c0-4 4-6 8-6s8 2 8 6", "M12 12a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9"],
  home: ["M3 11l9-7l9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
  phone: ["M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"],
  nav: ["M3 11l18-8l-8 18l-2-8z"],
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
  share: ["M12 4v12", "M7 9l5-5l5 5", "M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"],
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
