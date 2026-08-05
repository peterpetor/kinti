"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * ScrollTitleBar — a nagy cím görgetéskor beúszik egy áttetsző felső sávba.
 *
 * ⚠️ NEM DÍSZÍTÉS, KÉT VALÓS RÉST ZÁR BE:
 *
 * 1) A KONTEXTUS. Egy hosszú adatlapon a cím néhány görgetés után eltűnik, és
 *    onnantól semmi nem mondja meg, MELYIK vállalkozásnál járunk. Több
 *    megnyitott találat között váltogatva ez tényleg összekeveredik.
 *
 * 2) A VISSZAÚT. A vissza-gomb a lap tetején ül, tehát pont akkor nem elérhető,
 *    amikor a felhasználó a legmélyebben van a tartalomban. Aki keresőből
 *    érkezett (mély-link), annak a böngésző-vissza sem a listára visz.
 *
 * A sáv `position: fixed`, tehát nem foglal helyet és nem okoz layout-ugrást:
 * megjelenéskor semmi nem mozdul el alatta.
 *
 * ⚠️ INTERSECTIONOBSERVER, NEM SCROLL-ESEMÉNY. A scroll-listener minden
 * képkockán lefut (görgetés közben 60–120×/mp), és a fő szálon számol
 * pozíciót — az IntersectionObserver ezzel szemben csak a KERESZTEZÉS
 * pillanatában szól, a böngésző saját ütemezésében.
 */
export function ScrollTitleBar({
  children,
  title,
  actions,
  className,
}: {
  /**
   * A nagy fejléc — a sáv ennek a kigörgését figyeli. Elhagyható: ekkor a
   * komponenst közvetlenül a cím ALÁ kell tenni, és az őrszem ott áll.
   */
  children?: ReactNode;
  /** A kicsinyített cím a sávban (rövid szöveg; a nagy címnél tömörebb is lehet). */
  title: ReactNode;
  /** Jobb oldali akciók a sávban (vissza-gomb, menü). */
  actions?: ReactNode;
  className?: string;
}) {
  const [latszik, setLatszik] = useState(false);
  const orszemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = orszemRef.current;
    if (!el) return;
    // Ha nincs IntersectionObserver (nagyon régi böngésző), a sáv egyszerűen
    // sosem jelenik meg — az oldal így is teljesen használható.
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([bejegyzes]) => setLatszik(!bejegyzes.isIntersecting),
      // A küszöb a safe-area alatt van: notch-os telefonon az őrszem már a
      // status bar alatt „kimegy", és a sáv idő előtt villanna be.
      { rootMargin: "-64px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {children}
      {/* Őrszem: a nagy cím ALATT. Nem a címet magát figyeljük, mert annak a
          magassága oldalanként más (egy- vagy kétsoros), és a küszöb így
          kiszámíthatatlan lenne. */}
      <div ref={orszemRef} aria-hidden className="h-px w-full" />

      <div
        // ⚠️ `aria-hidden`, ha rejtett: a cím és a vissza-gomb MÁR ott van a
        // lapon, a sáv csak megismétli. Enélkül a képernyőolvasó kétszer
        // olvasná fel, és a rejtett gombra is rá lehetne Tabbal lépni.
        aria-hidden={!latszik || undefined}
        {...(latszik ? {} : ({ inert: "" } as unknown as Record<string, string>))}
        className={cn(
          // z-[81]: a notch-scrim (z-80) FÖLÖTT — különben telepített PWA-ban a
          // scrim gradiense a sávra esne. A toast (z-95) és a megerősítő
          // dialógus (z-130) viszont továbbra is fölötte marad.
          "glass fixed inset-x-0 top-0 z-[81] mx-auto w-full max-w-md border-b border-line",
          "px-4 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)]",
          "kinti-title-bar",
          latszik ? "kinti-title-bar-be" : "kinti-title-bar-ki",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 flex-1 truncate text-[15px] font-extrabold tracking-tight text-ink">
            {title}
          </h2>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </div>
      </div>
    </>
  );
}
