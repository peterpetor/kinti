"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";
import type { B2bProjectView } from "@/lib/repo-b2b";
import { B2bProjectCard } from "@/components/views/b2b-project-card";

/**
 * B2bFeed — a nyitott projektek listája kliens-oldali ország/szakma szűrővel.
 * A projektek szerveroldalról jönnek (SSR), a szűrés böngészőben történik
 * (nincs extra edge-route), a create/close után `router.refresh()` frissít.
 */
export function B2bFeed({
  projects,
  categories,
}: {
  projects: B2bProjectView[];
  categories: Category[];
}) {
  const [country, setCountry] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const catLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.label);
    return m;
  }, [categories]);

  // Csak azokat a szakma-szűrőket kínáljuk, amikre VAN nyitott projekt.
  const usedCategories = useMemo(() => {
    const ids = new Set(projects.map((p) => p.categoryNeeded).filter(Boolean) as string[]);
    return categories.filter((c) => ids.has(c.id));
  }, [projects, categories]);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (country === "all" || p.targetCountry === country) &&
          (category === "all" || p.categoryNeeded === category),
      ),
    [projects, country, category],
  );

  const pill = (active: boolean) =>
    cn(
      "shrink-0 rounded-pill px-3 py-1.5 text-[12.5px] font-bold transition",
      active ? "bg-primary text-white" : "bg-surface-alt text-ink-muted",
    );

  return (
    <section className="space-y-3">
      {/* Ország-szűrő */}
      <div className="kinti-hfade -mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button type="button" onClick={() => setCountry("all")} className={pill(country === "all")}>
          Minden ország
        </button>
        {COUNTRIES.map((c) => (
          <button key={c.code} type="button" onClick={() => setCountry(c.code)} className={pill(country === c.code)}>
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      {/* Szakma-szűrő — csak ha van rá nyitott projekt */}
      {usedCategories.length > 0 && (
        <div className="kinti-hfade -mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => setCategory("all")} className={pill(category === "all")}>
            Minden szakma
          </button>
          {usedCategories.map((c) => (
            <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={pill(category === c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt p-8 text-center">
          <Icon name="briefcase" size={26} strokeWidth={1.8} className="mx-auto mb-2 text-ink-faint" />
          <p className="text-[13.5px] font-bold text-ink">Nincs nyitott projekt</p>
          <p className="mx-auto mt-1 max-w-xs text-[12px] text-ink-muted">
            {projects.length === 0
              ? "Te lehetsz az első, aki munkát ír ki a magyar cégeknek."
              : "Ezzel a szűrővel nincs találat — próbálj másik országot vagy szakmát."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <B2bProjectCard
              key={p.id}
              project={p}
              categoryLabel={p.categoryNeeded ? catLabel.get(p.categoryNeeded) ?? null : null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
