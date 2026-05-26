"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { CANTONS } from "@/lib/cantons";

const CANTON_KEY = "kinti.canton";

/**
 * HomeCantonSelector — a főoldali kanton-rövidítő. Választáskor a Szaknévsorba
 * navigál (`?canton=`), ÉS elmenti a választást a `kinti.canton`
 * localStorage-kulcsba, hogy az időjárás-widget ugyanezt a kantont kövesse.
 */
export function HomeCantonSelector() {
  const router = useRouter();
  const [canton, setCanton] = useState("all");

  // Korábbi választás betöltése + a widget változásainak figyelése.
  useEffect(() => {
    try {
      const v = localStorage.getItem(CANTON_KEY);
      if (v) setCanton(v);
    } catch {
      /* sandbox / letiltott localStorage */
    }
    const onCanton = (e: Event) => {
      const code = (e as CustomEvent<string>).detail;
      if (typeof code === "string") setCanton(code);
    };
    window.addEventListener("kinti:canton", onCanton);
    return () => window.removeEventListener("kinti:canton", onCanton);
  }, []);

  const label =
    canton === "all"
      ? "Egész Svájc"
      : `${CANTONS.find((c) => c.code === canton)?.name ?? canton} (${canton})`;

  const handleCantonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCanton(selected);
    try {
      localStorage.setItem(CANTON_KEY, selected);
      window.dispatchEvent(new CustomEvent("kinti:canton", { detail: selected }));
    } catch {
      /* ignore */
    }
    router.push(selected === "all" ? "/szaknevsor" : `/szaknevsor?canton=${selected}`);
  };

  return (
    <label className="relative inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface/60 px-3 py-1.5 text-sm font-semibold text-ink shadow-card backdrop-blur-md cursor-pointer hover:bg-surface/80 transition">
      <Icon name="pin" size={14} strokeWidth={2.2} className="text-accent shrink-0" />
      <span className="font-bold tracking-[-0.01em] text-ink pr-1">{label}</span>
      <Icon name="chevD" size={13} strokeWidth={2.2} className="text-ink-muted shrink-0" />
      <select
        value={canton}
        onChange={handleCantonChange}
        aria-label="Kanton választó"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="all">Egész Svájc</option>
        {CANTONS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name} ({c.code})
          </option>
        ))}
      </select>
    </label>
  );
}
