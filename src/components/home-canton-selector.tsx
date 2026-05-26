"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { CANTONS } from "@/lib/cantons";

export function HomeCantonSelector() {
  const router = useRouter();

  const handleCantonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "all") {
      router.push("/szaknevsor");
    } else {
      router.push(`/szaknevsor?canton=${selected}`);
    }
  };

  return (
    <label className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface/60 px-3 py-1.5 text-sm font-semibold text-ink shadow-card backdrop-blur-md cursor-pointer hover:bg-surface/80 transition">
      <Icon name="pin" size={14} strokeWidth={2.2} className="text-accent shrink-0" />
      <select
        defaultValue="all"
        onChange={handleCantonChange}
        aria-label="Kanton választó"
        className="bg-transparent font-bold tracking-[-0.01em] text-ink outline-none cursor-pointer pr-1"
      >
        <option value="all">Válassz kantont...</option>
        {CANTONS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name} ({c.code})
          </option>
        ))}
      </select>
      <Icon name="chevD" size={13} strokeWidth={2.2} className="text-ink-muted shrink-0" />
    </label>
  );
}
