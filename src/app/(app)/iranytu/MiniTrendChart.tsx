"use client";

/** Mini SVG vonaldiagram — külső library nélkül */
export function MiniTrendChart({ data }: {
  data: { month: string; avg_salary: number }[];
}) {
  if (data.length < 2) {
    return (
      <div className="py-4 text-center text-[12px] text-ink-faint">
        Még nincs elegendő adat a trendhez. (Min. 2 hónap szükséges)
      </div>
    );
  }

  const W = 280, H = 80;
  const PAD = { t: 8, r: 8, b: 20, l: 40 };
  const vals = data.map(d => d.avg_salary);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const range = hi - lo || 1;

  const x = (i: number) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - lo) / range) * (H - PAD.t - PAD.b);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.avg_salary).toFixed(1)}`).join(" ");
  const fill = `${line} L ${x(data.length - 1).toFixed(1)} ${(H - PAD.b).toFixed(1)} L ${x(0).toFixed(1)} ${(H - PAD.b).toFixed(1)} Z`;

  const labelIdxs = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#tg)" />
      <path d={line} fill="none" stroke="rgb(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.avg_salary)} r="3"
          fill="white" stroke="rgb(var(--primary))" strokeWidth="2">
          <title>{d.month}: {d.avg_salary.toLocaleString("hu-HU")} CHF</title>
        </circle>
      ))}
      {labelIdxs.map(i => (
        <text key={i} x={x(i)} y={H} textAnchor="middle" fontSize="9" fill="rgb(var(--text-muted))">
          {data[i].month.slice(5)}
        </text>
      ))}
      <text x={PAD.l - 3} y={PAD.t + 5} textAnchor="end" fontSize="9" fill="rgb(var(--text-muted))">
        {(hi / 1000).toFixed(0)}k
      </text>
      <text x={PAD.l - 3} y={H - PAD.b + 1} textAnchor="end" fontSize="9" fill="rgb(var(--text-muted))">
        {(lo / 1000).toFixed(0)}k
      </text>
    </svg>
  );
}
