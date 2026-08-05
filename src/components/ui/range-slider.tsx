"use client";

import type { InputHTMLAttributes, CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * RangeSlider — az app EGYETLEN csúszkája.
 *
 * ⚠️ MIÉRT KELL KÜLÖN KOMPONENS EGY `<input type="range">`-HEZ?
 * Mert a natív csúszka sötét témán VAKÍTÓ FEHÉR sínt rajzol. Az `accent-color`
 * (Tailwind `accent-primary`) csak a KITÖLTÖTT részt és a fogantyút színezi, a
 * kitöltetlen sín a böngésző világos alapértelmezése marad — a `color-scheme:
 * dark` sem viszi el. Mérve a /berkalkulator és a /hova-koltozzek csúszkáján.
 *
 * A sínt CSAK `appearance: none` mellett lehet átszínezni (globals.css), az
 * viszont a KITÖLTÉST is elviszi. Ezért a kitöltés innentől gradiens, amihez
 * ismerni kell az aktuális arányt — ezt adja át a `--kitoltes` változó.
 *
 * ⚠️ ÚJ CSÚSZKÁHOZ EZT HASZNÁLD, ne nyers `<input type="range">`-et: a nyers
 * változat a `--kitoltes` nélkül a tartalék 50%-nál rajzolná a kitöltést, azaz
 * a zöld sáv és a fogantyú ELVÁLNA egymástól. Teszt őrzi.
 */
export function RangeSlider({
  min,
  max,
  value,
  className,
  style,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  min: number;
  max: number;
  value: number;
}) {
  // Nullával való osztás ellen: min === max esetén a csúszka amúgy sem mozdul.
  const tartomany = max - min;
  const arany = tartomany > 0 ? (Number(value) - min) / tartomany : 0;
  const szazalek = Math.min(100, Math.max(0, arany * 100));

  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      className={cn("w-full cursor-pointer accent-primary", className)}
      style={{ ...style, ["--kitoltes" as string]: `${szazalek}%` } as CSSProperties}
      {...rest}
    />
  );
}
