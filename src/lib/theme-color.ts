/**
 * theme-color.ts — a böngésző-króm (címsor/állapotsor, PWA-címsor) színének
 * futásidejű szinkronja a témával. A szín a LAP HÁTTERE (natív, egybefolyó
 * érzet): warm → krém, dark → mély fenyő-fekete. Betöltéskor a layout inline
 * THEME_INIT_SCRIPT-je végzi ugyanezt (festés előtt); ez a helper a kézi
 * téma-váltáshoz (ThemeToggle) van.
 */

export const THEME_CHROME_COLOR: Record<"warm" | "dark", string> = {
  warm: "#f4ede0", // = --bg (világos)
  dark: "#101411", // = --bg (sötét)
};

export function applyThemeColor(theme: "warm" | "dark"): void {
  if (typeof document === "undefined") return;
  const color = THEME_CHROME_COLOR[theme];
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (metas.length > 0) {
    metas.forEach((m) => m.setAttribute("content", color));
    return;
  }
  const m = document.createElement("meta");
  m.name = "theme-color";
  m.content = color;
  document.head.appendChild(m);
}
