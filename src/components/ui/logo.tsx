"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * KintiLogo — térkép-pin három vízszintes sávval (piros/krém/zöld), de inkább
 * absztrakt márkajel, mint zászló. A színek Tailwind `fill-*`/`stroke-*`
 * tokeneken keresztül jönnek (primary/accent/bg) → automatikusan téma-reaktív.
 * `useId()` miatt kliens-komponens (egyedi clipPath id minden példánynak).
 */
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
      className={cn("block", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={PIN} />
        </clipPath>
      </defs>
      {withFlag ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="40" height="16" className="fill-accent" />
          <rect x="0" y="16" width="40" height="16" className="fill-bg" />
          <rect x="0" y="32" width="40" height="15" className="fill-primary" />
        </g>
      ) : (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="40" height="47" className="fill-primary" />
        </g>
      )}
      <path d={PIN} fill="none" className="stroke-primary" strokeWidth="2.2" />
      <circle cx="20" cy="19" r="5" className="fill-bg stroke-primary" strokeWidth="2.2" />
    </svg>
  );
}
