/**
 * theme-schedule.ts — a „Rendszer" téma-mód feloldása NAPSZAK szerint.
 *
 * ⚠️ 2026-08-08-tól nem a böngésző `prefers-color-scheme` beállítását követjük.
 * MIÉRT: az sok készüléken fixen sötét — Androidon a Chrome SAJÁT témája dönt,
 * nem a telefoné —, ezért az app éjjel-nappal sötét maradt, és a „Rendszer"
 * gyakorlatilag „mindig sötét"-et jelentett. A napszak magától vált.
 *
 * ⚠️ Ez a fájl SZÁNDÉKOSAN `.ts`, nem `.tsx`: a unit-teszt így közvetlenül
 * importálhatja. A projekt `tsconfig`-jában a `jsx: "preserve"` áll, és attól
 * a vitest nem tudja értelmezni a `.tsx` fájlokat — a tiszta logika ezért a
 * komponensen KÍVÜL él.
 *
 * ⚠️ A kézi választás (Világos/Sötét) MINDIG erősebb ennél: a hívó feladata,
 * hogy előbb a mentett értéket nézze meg.
 */

export type Theme = "warm" | "dark";

/** 06:00-tól világos. */
export const VILAGOS_TOL = 6;
/** 18:00-tól sötét (a 18:00 MÁR sötét). */
export const VILAGOS_IG = 18;

/** A napszakhoz tartozó téma a KÉSZÜLÉK helyi ideje szerint. */
export function systemTheme(most: Date = new Date()): Theme {
  const ora = most.getHours();
  return ora >= VILAGOS_TOL && ora < VILAGOS_IG ? "warm" : "dark";
}

/**
 * A következő váltás időpontja — ehhez igazítjuk az időzítőt, hogy a téma
 * NYITOTT APPBAN is átváltson, ne csak újratöltéskor.
 */
export function kovetkezoValtas(most: Date = new Date()): Date {
  const kov = new Date(most);
  kov.setMinutes(0, 0, 0);
  const h = most.getHours();
  kov.setHours(h < VILAGOS_TOL ? VILAGOS_TOL : h < VILAGOS_IG ? VILAGOS_IG : 24 + VILAGOS_TOL);
  return kov;
}
