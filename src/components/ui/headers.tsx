import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DropdownMenu } from "./dropdown-menu";
import { ScrollTitleBar } from "./scroll-title-bar";

/**
 * ScreenHeader — nézet-fejléc nagy címmel + opcionális eyebrow-val.
 *
 * RENDSZER a jobb oldali gombokra (EGYSÉGES minden oldalon — ne térj el tőle):
 *   • ROOT (felső szintű tab-)oldal → nincs `back`, a „…" menü LÁTSZIK.
 *   • AL-oldal (drill-down) → adj `back`-et; ekkor CSAK a vissza-gomb látszik,
 *     a menü NEM — a globális navigációt az alsó TabBar adja.
 * Vagyis a menü megjelenése a `back` hiányából/ jelenlétéből KÖVETKEZIK, nem
 * oldalanként ad-hoc. A `menu` proppal kivételesen felülírható.
 *
 * `right` — KIEGÉSZÍTŐ akció (pl. kereső ikon), a menü MELLETT jelenik meg
 * (nem helyette). `back` — a vissza-gomb node-ja (al-oldalakon).
 *
 * BEÚSZÓ CÍM-SÁV: ha a nagy cím kigörgött, egy áttetsző sáv ereszkedik le a lap
 * tetejére a kicsinyített címmel és a vissza-gombbal (ScrollTitleBar).
 *
 * ⚠️ CSAK AL-OLDALON, és ez SZIMMETRIKUS a menü-szabállyal. Root-oldalon a
 * navigációt az alsó TabBar adja, a cím pedig („Szia!", „Szaknévsor") görgetés
 * közben nem hordoz információt — ott a sáv csak elvenné a képernyő tetejét.
 * Al-oldalon viszont KÉT valós rést zár be: a cím eltűnésével elvész, hogy
 * melyik tételnél járunk, és a vissza-gomb pont akkor nem elérhető, amikor a
 * felhasználó a legmélyebben van a tartalomban.
 */
export function ScreenHeader({
  eyebrow,
  title,
  left,
  right,
  back,
  menu,
  stickyTitle,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  back?: ReactNode;
  /** Felülírja a szabályt: explicit true → mindig menü; false → soha. Alapból: csak root-on. */
  menu?: boolean;
  /** Felülírja a beúszó cím-sáv szabályát. Alapból: csak al-oldalon (van `back`). */
  stickyTitle?: boolean;
  className?: string;
}) {
  // A szabály: menü a root oldalakon (nincs back); al-oldalon (van back) nincs.
  const showMenu = menu ?? !back;
  const sav = stickyTitle ?? Boolean(back);

  const header = (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      {left && <div className="shrink-0">{left}</div>}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-0.5 text-[30px] font-extrabold leading-[1.05] tracking-tight text-ink">
          {title}
        </h1>
      </div>
      {/* A gombok a tartalom tetejéhez (content-top) igazodnak — minden oldalon
          ugyanazon a szinten. Sorrend: [vissza] [kiegészítő akció] [menü]. */}
      <div className="flex shrink-0 items-center gap-2">
        {back}
        {right}
        {showMenu && <DropdownMenu />}
      </div>
    </header>
  );

  if (!sav) return header;
  // ⚠️ A MENÜ NEM KERÜL A SÁVBA. Két DropdownMenu-példány két külön nyitott
  // állapotot és két billentyű-figyelőt jelentene ugyanarra a parancsra.
  return (
    <ScrollTitleBar title={title} actions={back}>
      {header}
    </ScrollTitleBar>
  );
}

/**
 * SectionHeader — szekciócím (h3) opcionális jobb oldali linkkel/gombbal.
 */
export function SectionHeader({
  children,
  right,
  className,
}: {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between", className)}>
      <h3 className="text-[17px] font-bold tracking-tight text-ink">{children}</h3>
      {right}
    </div>
  );
}
