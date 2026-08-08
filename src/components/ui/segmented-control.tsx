"use client";

import { useRef } from "react";
import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";
import {
  szegmensGeometria,
  szegmensInsetOsztaly,
  szegmensPaddingOsztaly,
  type SzegmensMeret,
} from "@/lib/segmented-geometria";

/**
 * SegmentedControl — natív iOS-stílusú nézet-váltó CSÚSZÓ kapszulával.
 *
 * A háttér-kapszula fizikailag átcsúszik az egyik opció alól a másik alá,
 * ahelyett hogy egyszerűen máshol jelenne meg. Nem díszítés: a mozgás KÖTI
 * ÖSSZE a két állapotot, így a szem követni tudja, honnan hová került a
 * kijelölés — a pillanatszerű váltásnál ez az információ elvész.
 *
 * ⚠️ A POZÍCIÓ SZÁMÍTOTT, NEM MÉRT. Nincs `getBoundingClientRect`, nincs
 * `useEffect`-es utólagos igazítás: a szegmensek egyenlő szélességűek, tehát a
 * kapszula szélessége (100% − padding)/n, az eltolása pedig index × 100% a
 * SAJÁT szélességére vetítve. Ez azért fontos, mert a mért változat első
 * képkockája mindig rossz helyen áll (a mérés csak mount után fut le), ami
 * villanásként látszik — és szerver-renderben eleve nincs mit mérni.
 *
 * ⚠️ EZÉRT NEM LEHET GAP a szegmensek között: a gap a szegmens-szélességbe
 * nem számít bele, a kapszula eltolása viszont a saját szélességének a
 * többszöröse — n>2 esetén fokozatosan elcsúsznának. A vizuális elválasztást
 * a kapszula maga adja.
 *
 * ⚠️ GRID, NEM FLEX — és ez sem stílus-kérdés. A `flex-1` csak teljes szélességű
 * konténerben ad egyenlő szegmenseket; a beágyazott, tartalom-szélességű
 * (`inline`) változatban a szegmensek a saját feliratuk szerint méreteződnének,
 * és a számított kapszula-pozíció ELCSÚSZNA. A `grid-flow-col` + `auto-cols-fr`
 * mindkét esetben egyenlő oszlopokat ad (a legszélesebb tartalomra feszülve),
 * tehát a számítás mindkét módban érvényes marad.
 */
export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  icon?: IconName;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = "md",
  fill = true,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
  /** `sm` a beágyazott (szekció-szintű) váltókhoz, `md` a lap tetején. */
  size?: SzegmensMeret;
  /** `false` → tartalom-szélességű (pl. egy szekciócím mellett jobbra igazítva). */
  fill?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  /**
   * ⚠️ HÁROM SZEGMENSTŐL SZŰKÖS A HELY, ÉS EZT MÉRTEM. A Piactéren a
   * „Lakbér-kalkulátor" felirat 24 px-szel lógott ki a szegmensből (élesben,
   * 390 px-es nézetben), tehát „Lakbér-kalkulá…"-ként jelent meg.
   *
   * Számolva 390 px-es képernyőn: 372 px konténer − 8 px padding = 364, három
   * szegmensre 121 px, mínusz 16 px belső padding = 105 px a feliratnak. Az
   * ikon + köz ebből 19 px-et visz el, és a 12,5 px-es félkövér felirat 17
   * karakteren ~110 px — nem fér el.
   *
   * Ezért háromtól: NINCS ikon, és kisebb a betű. A felirathoz nem nyúlunk (az
   * tartalmi döntés), a `truncate` pedig marad biztonsági hálónak.
   */
  const szuk = options.length >= 3;
  const aktivIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  );

  const valaszt = (id: T) => {
    if (id === value) return; // ugyanarra koppintás nem „választás"
    onChange(id);
  };

  /**
   * Nyilas navigáció — a `role="tablist"` ezt ELVÁRJA (WAI-ARIA). A gombok
   * roving tabindexszel működnek: a Tab a vezérlőre lép, a nyilak lépkednek
   * benne. Enélkül minden fül külön Tab-megállót jelentene.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const lepes = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    let uj: number | null = null;
    if (lepes !== 0) uj = (aktivIndex + lepes + options.length) % options.length;
    else if (e.key === "Home") uj = 0;
    else if (e.key === "End") uj = options.length - 1;
    if (uj == null) return;
    e.preventDefault();
    valaszt(options[uj].id);
    // A fókusz kövesse a kijelölést (különben a képernyőolvasó a régin marad).
    const gombok = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    gombok?.[uj]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "relative grid grid-flow-col auto-cols-fr rounded-pill border border-line bg-surface shadow-card",
        fill ? "w-full" : "inline-grid",
        szegmensPaddingOsztaly(size),
        className,
      )}
    >
      {/* A csúszó kapszula. `aria-hidden`: tisztán vizuális, az állapotot az
          `aria-selected` hordozza. */}
      {/* A csúszó kapszula geometriája EGY helyen dől el (lib/segmented-geometria),
          a konténer paddingjével együtt — lásd az ottani indoklást. */}
      <span
        aria-hidden
        className={cn(
          "kinti-seg-thumb absolute rounded-pill bg-primary shadow-card",
          szegmensInsetOsztaly(size),
        )}
        style={szegmensGeometria(options.length, aktivIndex, size)}
      />
      {options.map((o) => {
        const aktiv = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={aktiv}
            tabIndex={aktiv ? 0 : -1}
            onClick={() => valaszt(o.id)}
            className={cn(
              // z-[1]: a kapszula FÖLÖTT — az a háttér, nem takarhatja a feliratot.
              "relative z-[1] flex min-w-0 items-center justify-center gap-1.5 rounded-pill font-bold transition-colors",
              size === "sm" ? "px-3 py-1.5 text-[11.5px]" : "px-2 py-2",
              size === "sm" ? "" : szuk ? "text-[11.5px]" : "text-[12.5px]",
              aktiv ? "text-white" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.icon && !szuk && (
              <Icon name={o.icon} size={size === "sm" ? 12 : 13} strokeWidth={2.4} className="shrink-0" />
            )}
            {/* ⚠️ NINCS `active:scale` a szegmensen. Az összenyomás elszakítaná
                a feliratot a mögötte ülő kapszulától (a kettő külön elem) — a
                press-visszajelzést itt a kapszula mozgása adja. */}
            <span className="truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
