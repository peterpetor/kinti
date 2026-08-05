/**
 * A szegmentált vezérlő csúszó kapszulájának geometriája.
 *
 * ⚠️ MIÉRT KÜLÖN FÁJL: ez az EGYETLEN hibalehetőség a komponensben, és néma.
 * A kapszula szélessége a konténer BELSŐ szélességéből jön (teljes − 2×padding);
 * ha a padding-osztály és az itteni levonás elcsúszik egymástól, a kapszula a
 * szélső szegmensnél kilóg a keretből vagy alatta marad — de csak akkor, ha
 * valaki a SZÉLSŐ fülre kapcsol, és csak az egyik méretben. Ránézésre nem
 * tűnik fel; számként igen.
 *
 * A pozíció SZÁMÍTOTT, nem mért: a szegmensek egyenlő szélességűek
 * (`grid-flow-col` + `auto-cols-fr`), tehát az eltolás index × 100% a kapszula
 * saját szélességére vetítve. Így a szerver-render első képkockája is jó helyen
 * áll — mérés esetén az mindig a bal szélen villanna fel.
 */

/** A konténer paddingja méretenként, rem-ben (egyeznie kell a Tailwind-osztállyal). */
export const SZEGMENS_PADDING_REM = { sm: 0.125, md: 0.25 } as const;

export type SzegmensMeret = keyof typeof SZEGMENS_PADDING_REM;

export interface SzegmensGeometria {
  /** CSS `width` a kapszulára. */
  width: string;
  /** CSS `transform` a kapszulára. */
  transform: string;
}

export function szegmensGeometria(
  darab: number,
  aktivIndex: number,
  meret: SzegmensMeret,
): SzegmensGeometria {
  // Legalább egy szegmens; a 0-val osztás néma NaN-t adna a `calc()`-ban, amit
  // a böngésző csendben eldob (a kapszula eltűnne).
  const n = Math.max(1, darab);
  const i = Math.min(Math.max(0, aktivIndex), n - 1);
  const belsoLevonas = SZEGMENS_PADDING_REM[meret] * 2;
  return {
    width: `calc((100% - ${belsoLevonas}rem) / ${n})`,
    transform: `translateX(${i * 100}%)`,
  };
}

/** A konténer padding-osztálya — egy forrásból a geometriával. */
export function szegmensPaddingOsztaly(meret: SzegmensMeret): string {
  return meret === "sm" ? "p-0.5" : "p-1";
}

/** A kapszula behúzása a konténer szélétől — szintén ugyanabból a forrásból. */
export function szegmensInsetOsztaly(meret: SzegmensMeret): string {
  return meret === "sm" ? "bottom-0.5 left-0.5 top-0.5" : "bottom-1 left-1 top-1";
}
