"use client";

import { useId } from "react";

/**
 * Sparkline — 14 napos trendvonal TISZTÁN SVG-ből, külső chart-könyvtár nélkül.
 * Simított vonal Catmull-Rom-szerű kvadratikus bézierrel, kitöltött görbe-alatti
 * terület (lineáris gradiens) és kiemelt végpont. A vonal/terület színe a
 * `--primary`, a végpont az `--accent` CSS-változót használja → téma-reaktív.
 * `useId()` az egyedi gradiens-azonosítóhoz → kliens-komponens.
 */
export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, width = 320, height = 90, className }: SparklineProps) {
  const gradId = useId();
  if (data.length < 2) return null;

  const pad = 4;
  const max = Math.max(...data) * 1.1 || 1;
  const xs = data.map((_, i) => pad + (i * (width - pad * 2)) / (data.length - 1));
  const ys = data.map((v) => height - pad - (v / max) * (height - pad * 2));

  // Simított vonal: minden szakasz közepénél kontrollpont.
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    d += ` Q ${cx} ${ys[i]}, ${cx} ${(ys[i] + ys[i + 1]) / 2}`;
    d += ` Q ${cx} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }
  const area = `${d} L ${xs[xs.length - 1]} ${height - pad} L ${xs[0]} ${height - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className={className}
      role="img"
      aria-label="14 napos megtekintés-trend"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" style={{ stopColor: "rgb(var(--primary))", stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: "rgb(var(--primary))", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        className="stroke-primary"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xs[xs.length - 1]}
        cy={ys[ys.length - 1]}
        r={3.5}
        className="fill-accent stroke-surface"
        strokeWidth={2}
      />
    </svg>
  );
}
