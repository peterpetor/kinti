"use client";

import { useEffect } from "react";

/**
 * Görgetésre csukódó billentyűzet — natív iOS-minta (Üzenetek, Spotlight).
 *
 * ⚠️ MIÉRT KELL: mobilon a felugró billentyűzet a képernyő KÖZEL FELÉT elveszi.
 * A felhasználó beír egy keresőszót, majd görgetni kezd a találatok közt — de a
 * billentyűzet nyitva marad, amíg kézzel be nem zárja, tehát a lista fele
 * takarásban van pont akkor, amikor nézné. Az iOS gyári appjai ezért a lefelé
 * görgetésre maguktól elrejtik.
 *
 * ⚠️ SZÁNDÉKOSAN NEM GLOBÁLIS. Űrlapon gépelés közben görgetni teljesen
 * normális (hosszú beküldő-lap), ott a fókusz elvétele bosszantó lenne. Ezért
 * a hook LISTA-képernyőkre való, ahol a keresőmező a találatok FÖLÖTT ül.
 *
 * ⚠️ CSAK LEFELÉ. Felfelé görgetve a felhasználó jellemzően vissza akar érni a
 * mezőhöz — ott a fókusz elvétele pont az ellenkezőjét érné el.
 */

/** Ennyi képpont lefelé mozgás után csukjuk — a véletlen apró mozdulat ne fogja. */
const KUSZOB_PX = 24;

export function useKeyboardDismissOnScroll(aktiv = true) {
  useEffect(() => {
    if (!aktiv) return;
    if (typeof window === "undefined") return;
    // Csak érintőképernyőn — egérrel nincs felugró billentyűzet, ott a fókusz
    // elvétele indokolatlan lenne.
    if (!window.matchMedia?.("(pointer: coarse)").matches) return;

    let kezdoY: number | null = null;

    const fokuszban = (): HTMLElement | null => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const tag = el.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA") return null;
      // A `readonly` és a gomb-szerű mezők nem nyitnak billentyűzetet.
      if ((el as HTMLInputElement).readOnly) return null;
      return el;
    };

    const onStart = (e: TouchEvent) => {
      kezdoY = e.touches[0]?.clientY ?? null;
    };

    const onMove = (e: TouchEvent) => {
      if (kezdoY == null) return;
      const y = e.touches[0]?.clientY;
      if (y == null) return;
      // Az ujj FELFELÉ mozog a képernyőn = a tartalom lefelé görög.
      if (kezdoY - y < KUSZOB_PX) return;
      kezdoY = null;
      fokuszban()?.blur();
    };

    const onEnd = () => {
      kezdoY = null;
    };

    // Passzív figyelők: a görgetést semmiképp ne lassítsuk.
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [aktiv]);
}
