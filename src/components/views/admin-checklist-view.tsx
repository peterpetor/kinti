"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { AdminChecklist } from "@/lib/admin-checklists";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { parseWithTerms } from "@/lib/highlight-terms";

const STORAGE_KEY = "kinti.checklists";

interface ChecklistState {
  /** slug → step-index Set (string-eknek mentett számok). */
  [slug: string]: string[];
}

function loadState(): ChecklistState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveState(state: ChecklistState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode → ignore */
  }
}

/**
 * AdminChecklistView — egy szituáció részletes csekklistája, pipálható
 * lépésekkel. A pipálás localStorage-ban tárolva (per-slug).
 */
export function AdminChecklistView({ checklist }: { checklist: AdminChecklist }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  // Initial load
  useEffect(() => {
    const state = loadState();
    const arr = state[checklist.slug] ?? [];
    setChecked(new Set(arr.map((s) => Number(s)).filter((n) => Number.isInteger(n))));
  }, [checklist.slug]);

  function toggle(idx: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      const state = loadState();
      state[checklist.slug] = [...next].map(String);
      saveState(state);
      return next;
    });
  }

  function reset() {
    if (!confirm("Visszaállítod az összes pipát?")) return;
    const state = loadState();
    delete state[checklist.slug];
    saveState(state);
    setChecked(new Set());
  }

  const progress = useMemo(
    () => Math.round((checked.size / checklist.steps.length) * 100),
    [checked, checklist.steps.length],
  );

  return (
    <div className="space-y-4">
      {/* Hero — cím + leírás + meta */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft/50 p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary">
            <Icon name={checklist.icon} size={26} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
              {checklist.title}
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              {checklist.description}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          {checklist.deadline && (
            <MetaCard label="Határidő" value={checklist.deadline} color="#e74c3c" />
          )}
          {checklist.totalDuration && (
            <MetaCard label="Átfutás" value={checklist.totalDuration} color="#3a6ea5" />
          )}
        </div>
      </section>

      {/* Progress bar */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-bold text-ink">
            {checked.size} / {checklist.steps.length} lépés kész
          </p>
          {checked.size > 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-[11px] font-semibold text-ink-faint underline hover:text-accent"
            >
              Visszaállítás
            </button>
          )}
        </div>
        <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              progress === 100 ? "bg-success" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-success">
            <Icon name="check" size={14} strokeWidth={3} className="shrink-0" />
            Minden lépés kész — gratulálunk!
          </p>
        )}
      </section>

      {/* Lépések */}
      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Lépések
        </h2>
        {checklist.steps.map((step, idx) => {
          const isChecked = checked.has(idx);
          return (
            <article
              key={idx}
              className={cn(
                "rounded-card border bg-surface p-4 shadow-card transition",
                isChecked ? "border-success/40 bg-success/5" : "border-line",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition",
                    isChecked
                      ? "border-success bg-success text-white"
                      : "border-line bg-surface text-transparent",
                  )}
                >
                  {isChecked && <Icon name="check" size={13} strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
                      Lépés {idx + 1}
                    </span>
                    {step.duration && (
                      <>
                        <span className="text-ink-faint">·</span>
                        <span className="text-[11.5px] font-semibold text-ink-muted">
                          {step.duration}
                        </span>
                      </>
                    )}
                  </div>
                  <h3
                    className={cn(
                      "text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-pretty",
                      isChecked ? "text-ink line-through decoration-success/40" : "text-ink",
                    )}
                  >
                    {step.title}
                  </h3>
                </div>
              </button>

              {(step.body || step.link) && (
                <div className="mt-2 pl-9">
                  {step.body && (
                    <p className="text-[12.5px] leading-relaxed text-ink-muted whitespace-pre-wrap">
                      {parseWithTerms(step.body, `s${idx}`)}
                    </p>
                  )}
                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-2.5 py-1 text-[11.5px] font-bold text-primary hover:bg-primary-soft transition"
                    >
                      <Icon name="globe" size={12} strokeWidth={2.2} className="shrink-0" /> {step.link.label}
                    </a>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Warnings */}
      {checklist.warnings && checklist.warnings.length > 0 && (
        <section className="rounded-card border border-accent/30 bg-accent-soft p-4 shadow-card">
          <h2 className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-accent">
            <Icon name="alert" size={13} strokeWidth={2.4} className="shrink-0" /> Figyelmeztetések
          </h2>
          <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-ink">
            {checklist.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent shrink-0">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sources */}
      <section className="rounded-card border border-line bg-surface-alt/60 p-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Hivatalos források
        </h2>
        <ul className="space-y-1.5">
          {checklist.sources.map((s, i) => (
            <li key={i}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] font-semibold text-primary underline break-all"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Egységes jogi disclaimer */}
      <LegalDisclaimer
        toolName={`csekklista (${checklist.title})`}
        variant="legal"
        notAdviceFor="jogi vagy hatósági"
        extraWarning="A hivatalos eljárások régiónként és hivatalonként ELTÉRŐEK lehetnek, és időnként változnak. A lépések általános útmutatók — a TE konkrét helyzetedre vonatkozó pontos ügymenetet a lakhelyed szerinti illetékes hivataltól tudd meg."
        officialSources={checklist.sources}
      />
    </div>
  );
}

function MetaCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-surface px-2.5 py-1.5">
      <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </p>
      <p className="mt-0.5 text-[11.5px] font-semibold text-ink leading-tight">{value}</p>
    </div>
  );
}
