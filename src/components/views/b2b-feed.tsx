"use client";

import { useMemo, useState } from "react";
import { EmptyState, Icon } from "@/components/ui";
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
        // ⚠️ A KÉT ÜRES ÁLLAPOT KÉT KÜLÖNBÖZŐ DOLOG, és más a következő lépés is.
        // Ha EGYÁLTALÁN nincs projekt, a felhasználó nem tud mit szűrni — ott
        // az „írj ki te" a valódi kiút. Ha csak a SZŰRŐ nem ad találatot, a
        // kiút a szűrő törlése, és azt egy gombbal el is lehet végezni ahelyett,
        // hogy a szöveg elmagyarázza, mit csináljon.
        <EmptyState
          icon="briefcase"
          title={projects.length === 0 ? "Még nincs nyitott projekt" : "Nincs a szűrőknek megfelelő projekt"}
          description={
            projects.length === 0
              ? "A fenti űrlappal te lehetsz az első, aki munkát ír ki a magyar cégeknek."
              : "Ezzel az országgal és szakmával nincs találat."
          }
          // ⚠️ A NULLA-PROJEKT ÁGBAN SZÁNDÉKOSAN NINCS GOMB. A kiíró űrlap
          // (B2bComposer) ugyanezen az oldalon, KÖZVETLENÜL e fölött a blokk
          // fölött ül — egy „Írj ki egy projektet" gomb vagy oda görgetne
          // vissza (értelmetlen), vagy egy nem létező útvonalra vinne.
          action={
            projects.length === 0
              ? undefined
              : {
                  label: "Szűrők törlése",
                  onClick: () => {
                    setCountry("all");
                    setCategory("all");
                  },
                }
          }
        />
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
