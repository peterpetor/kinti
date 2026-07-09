"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  TUDASTAR_COUNTRIES,
  TUDASTAR_CATEGORIES,
  countryMeta,
  type TudastarCountry,
  type TudastarCategory,
} from "@/lib/tudastar";

/** A katalógushoz elég karcsú vetület (a nagy contentHtml nélkül). */
export interface CatalogGuide {
  slug: string;
  country: TudastarCountry;
  category: TudastarCategory;
  title: string;
  description: string;
  readTime: string;
}

export function TudastarCatalog({ guides }: { guides: CatalogGuide[] }) {
  const searchParams = useSearchParams();
  const initialCountry = searchParams?.get("country") ?? "all";
  const [country, setCountry] = useState<string>(
    TUDASTAR_COUNTRIES.some((c) => c.code === initialCountry) ? initialCountry : "all",
  );
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guides.filter((g) => {
      if (country !== "all" && g.country !== country) return false;
      if (!needle) return true;
      return (
        g.title.toLowerCase().includes(needle) ||
        g.description.toLowerCase().includes(needle)
      );
    });
  }, [guides, country, q]);

  // Kategóriánként csoportosítva (a fix kategória-sorrendben), üres csoport kihagyva.
  const grouped = useMemo(
    () =>
      TUDASTAR_CATEGORIES.map((cat) => ({
        cat,
        items: filtered.filter((g) => g.category === cat.id),
      })).filter((group) => group.items.length > 0),
    [filtered],
  );

  return (
    <div className="space-y-4">
      {/* Ország-szűrő */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-0.5">
        <FilterChip active={country === "all"} onClick={() => setCountry("all")} label="🌍 Mind" />
        {TUDASTAR_COUNTRIES.map((c) => (
          <FilterChip
            key={c.code}
            active={country === c.code}
            onClick={() => setCountry(c.code)}
            label={`${c.flag} ${c.label}`}
          />
        ))}
      </div>

      {/* Kereső */}
      <div className="flex items-center gap-2 rounded-[16px] border border-line bg-surface px-3.5 py-2.5 shadow-card">
        <Icon name="search" size={18} className="shrink-0 text-ink-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Keresés a cikkek között…"
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-ink-faint"
        />
        {q && (
          <button
            type="button"
            aria-label="Törlés"
            onClick={() => setQ("")}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-surface-alt text-ink-muted"
          >
            <Icon name="close" size={13} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* Eredmények kategóriánként */}
      {grouped.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center text-[13px] text-ink-muted">
          Nincs találat erre a szűrőre. Próbálj másik országot vagy keresőszót.
        </div>
      ) : (
        grouped.map(({ cat, items }) => (
          <section key={cat.id} className="space-y-2">
            <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              {cat.emoji} {cat.label}
            </h2>
            <div className="grid gap-2.5">
              {items.map((g) => (
                <GuideCard key={`${g.country}-${g.slug}`} guide={g} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-pill border px-3.5 py-2 text-[12.5px] font-bold transition active:scale-[0.97]",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-line bg-surface text-ink-muted hover:bg-surface-alt",
      )}
    >
      {label}
    </button>
  );
}

function GuideCard({ guide }: { guide: CatalogGuide }) {
  const c = countryMeta(guide.country);
  return (
    <Link
      href={`/tudastar/${guide.country}/${guide.slug}`}
      className="block rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-0.5 text-[10.5px] font-bold text-ink-muted">
          {c?.flag} {c?.label}
        </span>
        <span className="text-[10.5px] text-ink-faint">· {guide.readTime}</span>
      </div>
      <h3 className="mt-1.5 text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-ink text-balance">
        {guide.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-muted">{guide.description}</p>
    </Link>
  );
}
