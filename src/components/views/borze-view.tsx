"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CANTONS } from "@/lib/cantons";
import type { BulletinPost } from "@/lib/types";
import { BulletinCard, loadSavedIds, saveSavedIds } from "./community-view";

/**
 * BorzeView — dedikált, témára szabott hirdetés-böngésző (Albérlet / Állás).
 *
 * A hirdetéskártyát (BulletinCard) a Közösség-nézettől örököljük, így a kapcsolat-
 * modal, megosztás, mentés, kép-lightbox mind egységes marad. Itt csak a témára
 * szabott szűrőket adjuk: kanton + kereső + (albérletnél) ár-rendezés + mentett.
 */
type SortMode = "newest" | "price-asc" | "price-desc";

export interface BorzeViewProps {
  posts: BulletinPost[]; // szerverről már EGY kategóriára szűrve
  title: string;
  subtitle: string;
  icon: IconName;
  /** Ár-rendezés mutatása (albérletnél hasznos, állásnál nem). */
  showPriceSort: boolean;
  turnstileSiteKey: string;
  /** Új hirdetés link (a kategóriát a feladó választja). */
  newAdHref: string;
}

export function BorzeView({
  posts,
  title,
  subtitle,
  icon,
  showPriceSort,
  turnstileSiteKey,
  newAdHref,
}: BorzeViewProps) {
  const [q, setQ] = useState("");
  const [canton, setCanton] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [savedOnly, setSavedOnly] = useState(false);

  const [saved, setSaved] = useState<Set<string>>(new Set());
  useEffect(() => {
    setSaved(loadSavedIds());
  }, []);
  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSavedIds(next);
      return next;
    });
  }

  const availableCantons = useMemo(() => {
    const codes = new Set(posts.map((p) => p.cantonCode).filter((c): c is string => !!c));
    return CANTONS.filter((c) => codes.has(c.code));
  }, [posts]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = posts.filter((p) => {
      const byCanton = canton === "all" || p.cantonCode === canton;
      const bySaved = !savedOnly || saved.has(p.id);
      const byText =
        !needle ||
        p.title.toLowerCase().includes(needle) ||
        (p.meta ?? "").toLowerCase().includes(needle) ||
        (p.body ?? "").toLowerCase().includes(needle) ||
        (p.poster ?? "").toLowerCase().includes(needle);
      return byCanton && bySaved && byText;
    });

    if (showPriceSort && (sort === "price-asc" || sort === "price-desc")) {
      const dir = sort === "price-asc" ? 1 : -1;
      return [...list].sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return (a.price - b.price) * dir;
      });
    }
    return list;
  }, [posts, q, canton, sort, savedOnly, saved, showPriceSort]);

  const hasFilter = q.trim() !== "" || canton !== "all" || savedOnly;

  return (
    <div className="space-y-4 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* Fejléc */}
      <header className="flex items-start gap-3">
        <Link
          href="/kozosseg"
          aria-label="Vissza a Közösséghez"
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-primary-soft text-primary">
              <Icon name={icon} size={15} strokeWidth={2.4} />
            </span>
            <h1 className="text-[22px] font-extrabold tracking-tight text-ink">{title}</h1>
          </div>
          <p className="mt-1 text-[13px] leading-snug text-ink-muted">{subtitle}</p>
        </div>
      </header>

      {/* Új hirdetés CTA */}
      <Link
        href={newAdHref}
        className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/60 p-3.5 transition active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary text-white">
          <Icon name="plus" size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
            Hirdetést adnék fel
          </div>
          <div className="text-[11.5px] text-ink-muted">Regisztráció nélkül, pár perc</div>
        </div>
        <Icon name="chevR" size={14} className="text-ink-muted" />
      </Link>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
          <Icon name={icon} size={26} className="text-ink-faint" />
          <p className="text-[13.5px] font-semibold text-ink">Még nincs hirdetés ebben a témában</p>
          <p className="text-[12px] text-ink-muted">Légy te az első, aki feladja!</p>
        </div>
      ) : (
        <>
          {/* Kereső */}
          <div className="flex items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3 py-2.5 shadow-card">
            <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Keresés…"
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

          {/* Kanton + (ár-)rendezés + mentett + darabszám */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 shadow-card">
              <Icon name="pin" size={12} strokeWidth={2.2} className="shrink-0 text-accent" />
              <select
                value={canton}
                onChange={(e) => setCanton(e.target.value)}
                aria-label="Kanton szűrő"
                className="appearance-none bg-transparent text-[12.5px] font-bold tracking-[-0.01em] text-ink outline-none"
              >
                <option value="all">Egész Svájc</option>
                {(availableCantons.length > 0 ? availableCantons : CANTONS).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <Icon name="chevD" size={12} strokeWidth={2.2} className="text-ink-muted" />
            </label>

            {showPriceSort && (
              <label className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-2.5 py-1.5 shadow-card">
                <Icon name="filter" size={12} strokeWidth={2.2} className="shrink-0 text-primary" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  aria-label="Rendezés"
                  className="appearance-none bg-transparent text-[12.5px] font-bold tracking-[-0.01em] text-ink outline-none"
                >
                  <option value="newest">Legújabb elöl</option>
                  <option value="price-asc">Ár szerint ↑</option>
                  <option value="price-desc">Ár szerint ↓</option>
                </select>
                <Icon name="chevD" size={12} strokeWidth={2.2} className="text-ink-muted" />
              </label>
            )}

            <button
              type="button"
              onClick={() => setSavedOnly((v) => !v)}
              aria-pressed={savedOnly}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 text-[12.5px] font-bold shadow-card transition",
                savedOnly ? "bg-accent text-white" : "border border-line bg-surface text-ink",
              )}
            >
              <Icon name="bookmark" size={12} strokeWidth={2.4} filled={savedOnly} />
              Mentett{saved.size > 0 && ` (${saved.size})`}
            </button>

            <span className="ml-auto text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
              {filtered.length} hirdetés
            </span>
          </div>

          {/* Találatok */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-surface-alt px-6 py-10 text-center">
              <Icon name="search" size={24} className="text-ink-faint" />
              <p className="text-[13px] font-semibold text-ink">Nincs ilyen hirdetés</p>
              {hasFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setCanton("all");
                    setSavedOnly(false);
                  }}
                  className="mt-1 rounded-pill bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white"
                >
                  Szűrők törlése
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <BulletinCard
                  key={p.id}
                  post={p}
                  isSaved={saved.has(p.id)}
                  onToggleSaved={() => toggleSaved(p.id)}
                  turnstileSiteKey={turnstileSiteKey}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
