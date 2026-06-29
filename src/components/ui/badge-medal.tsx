"use client";

import { useId } from "react";

/**
 * BadgeMedal — egy kitűző „érem" megjelenítése tisztán SVG/CSS-ből (nincs külső
 * asset): gradiens korong + perem + fény-csillanás, a ritkaság szerinti színnel
 * (ritka = arany + halo, sima = zöld), középen az ikonnal. Zárolt állapotban
 * szürke korong + lakat. Így a kitűzők „rajzolt jelvénynek" hatnak, nem lapos
 * emojinak — de a forrás-ikon (emoji) marad a középpont.
 */
export function BadgeMedal({
  icon,
  earned,
  rare,
  size = 46,
}: {
  icon: string;
  earned: boolean;
  rare?: boolean;
  size?: number;
}) {
  const id = useId();
  const pal = !earned
    ? { from: "#dcd6ca", to: "#b6af9f", rim: "#a09888", shine: "#ffffff" }
    : rare
      ? { from: "#fbe491", to: "#d9971b", rim: "#a9740f", shine: "#fff7dd" }
      : { from: "#46b585", to: "#1d4434", rim: "#103626", shine: "#dcf6e8" };

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        aria-hidden="true"
        className={earned && rare ? "drop-shadow-[0_2px_7px_rgba(217,151,27,0.5)]" : undefined}
      >
        <defs>
          <radialGradient id={`${id}-disc`} cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor={pal.from} />
            <stop offset="100%" stopColor={pal.to} />
          </radialGradient>
        </defs>
        {/* perem */}
        <circle cx="24" cy="24" r="22.5" fill={pal.rim} />
        {/* korong */}
        <circle cx="24" cy="24" r="20" fill={`url(#${id}-disc)`} />
        {/* belső gyűrű */}
        <circle cx="24" cy="24" r="16" fill="none" stroke={pal.shine} strokeOpacity="0.28" strokeWidth="1" />
        {/* fény-csillanás */}
        <ellipse cx="18" cy="15" rx="9" ry="5" fill={pal.shine} opacity="0.34" />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center"
        style={{
          fontSize: size * 0.42,
          lineHeight: 1,
          filter: earned ? undefined : "grayscale(1)",
          opacity: earned ? 1 : 0.5,
        }}
      >
        {icon}
      </span>
      {!earned && (
        <span className="absolute -bottom-0.5 -right-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-surface text-[10px] shadow ring-1 ring-line">
          🔒
        </span>
      )}
    </div>
  );
}
