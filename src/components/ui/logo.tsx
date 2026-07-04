"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * KintiLogo — térkép-pin három vízszintes sávval (piros/krém/zöld), de inkább
 * absztrakt márkajel, mint zászló. A színek SZÁNDÉKOSAN fix márka-hexek (a
 * világos téma palettája), NEM téma-tokenek: a logónak minden témában
 * ugyanúgy kell kinéznie (sötét módban a token-alapú változat krém sávja
 * feketévé vált — user-visszajelzés, 2026-07-04).
 * `useId()` miatt kliens-komponens (egyedi clipPath id minden példánynak).
 */
const BRAND = {
  red: "#c8392e",
  cream: "#f4ede0",
  green: "#1d4434",
} as const;
export interface KintiLogoProps {
  size?: number;
  withFlag?: boolean;
  className?: string;
}

const PIN =
  "M20 1.5C9.8 1.5 2.5 9.4 2.5 19.4c0 9 8.2 18 14.8 24.3a3.8 3.8 0 0 0 5.4 0c6.6-6.3 14.8-15.3 14.8-24.3 0-10-7.3-17.9-17.5-17.9z";

export function KintiLogo({ size = 36, withFlag = true, className }: KintiLogoProps) {
  const clipId = useId();
  return (
    <svg
      width={size}
      height={size * 1.18}
      viewBox="0 0 40 47"
      fill="none"
      role="img"
      aria-label="kinti"
      className={cn("block kinti-logo", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={PIN} />
        </clipPath>
      </defs>
      {withFlag ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="40" height="16" fill={BRAND.red} />
          <rect x="0" y="16" width="40" height="16" fill={BRAND.cream} />
          <rect x="0" y="32" width="40" height="15" fill={BRAND.green} />
        </g>
      ) : (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="40" height="47" fill={BRAND.green} />
        </g>
      )}
      <path d={PIN} fill="none" stroke={BRAND.green} strokeWidth="2.2" />
      <circle cx="20" cy="19" r="5" fill={BRAND.cream} stroke={BRAND.green} strokeWidth="2.2" />
    </svg>
  );
}
