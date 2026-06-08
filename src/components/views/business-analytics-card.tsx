"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";
import type { BusinessAnalytics } from "@/lib/repo";
import { cn } from "@/lib/cn";

type Tab = "overview" | "chart" | "competitors";

/**
 * BusinessAnalyticsDashboard — Prémium analitika panel a manage oldalon.
 * Tartalmazza: KPI kártyák, 30 napos bar chart, értékelés összesítő,
 * és versenytárs összehasonlítás.
 */
export function BusinessAnalyticsDashboard({ stats }: { stats: BusinessAnalytics }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [chartMetric, setChartMetric] = useState<"views" | "phoneClicks" | "leads">("views");

  const last30 = [...stats.daily].reverse(); // ASC by day
  const maxVal = Math.max(1, ...last30.map((d) => Math.max(d.views, d.phoneClicks, d.leads)));

  const conversionRate = stats.views.total > 0
    ? ((stats.phoneClicks.total / stats.views.total) * 100).toFixed(1)
    : "0";

  const ordinalLabel = (n: number) => {
    if (n === 1) return "1.";
    if (n === 2) return "2.";
    if (n === 3) return "3.";
    return `${n}.`;
  };

  return (
    <section className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-primary/5 to-accent/5 border-b border-line">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-primary text-white shadow-md">
            <Icon name="trending" size={18} strokeWidth={2.4} />
          </span>
          <div>
            <h2 className="text-[15.5px] font-extrabold tracking-tight text-ink">Analytics Dashboard</h2>
            <p className="text-[11.5px] text-ink-muted">Anonim statisztikák — valódi adatok</p>
          </div>
        </div>

        {/* Tab pills */}
        <div className="mt-4 flex gap-1.5">
          {(["overview", "chart", "competitors"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-xl py-2 text-[12px] font-bold transition-all",
                tab === t
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-alt text-ink-muted hover:bg-primary/10 hover:text-primary"
              )}
            >
              {t === "overview" && "📊 Áttekintés"}
              {t === "chart" && "📈 Grafikon"}
              {t === "competitors" && "🏆 Verseny"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="p-5 space-y-4">
          {/* Conversion callout */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-[12px] font-black uppercase tracking-wide text-primary">Konverzió</p>
              <p className="text-[22px] font-extrabold text-ink leading-none">{conversionRate}%</p>
              <p className="text-[11px] text-ink-muted">megtekintőből kattintott telefonra</p>
            </div>
          </div>

          {/* KPI grid — Views */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-ink-muted mb-2 px-0.5">
              👁️ Megtekintések
            </p>
            <div className="grid grid-cols-3 gap-2">
              <KpiCard label="Összes" value={stats.views.total} icon="eye" />
              <KpiCard label="7 nap" value={stats.views.last7Days} icon="trending" highlight />
              <KpiCard label="30 nap" value={stats.views.last30Days} icon="calendar" />
            </div>
          </div>

          {/* KPI grid — Phone */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-ink-muted mb-2 px-0.5">
              📞 Telefon-kattintások
            </p>
            <div className="grid grid-cols-3 gap-2">
              <KpiCard label="Összes" value={stats.phoneClicks.total} icon="phone" accent />
              <KpiCard label="7 nap" value={stats.phoneClicks.last7Days} icon="trending" accent />
              <KpiCard label="30 nap" value={stats.phoneClicks.last30Days} icon="calendar" accent />
            </div>
          </div>

          {/* KPI grid — Leads */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-ink-muted mb-2 px-0.5">
              📋 Árajánlat-kérések (Lead)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <KpiCard label="Összes" value={stats.leads.total} icon="send" success />
              <KpiCard label="7 nap" value={stats.leads.last7Days} icon="trending" success />
              <KpiCard label="30 nap" value={stats.leads.last30Days} icon="calendar" success />
            </div>
          </div>

          {/* Rating summary */}
          <div className="rounded-2xl border border-line bg-surface-alt/60 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-ink-muted mb-2">⭐ Értékelések</p>
            <div className="flex items-center gap-3">
              <div className="text-[32px] font-extrabold text-ink leading-none">
                {stats.reviewSummary.rating.toFixed(1)}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <span key={i} className={cn("text-base", i <= Math.round(stats.reviewSummary.rating) ? "text-star" : "text-line")}>★</span>
                  ))}
                </div>
                <p className="text-[11.5px] text-ink-muted mt-0.5">{stats.reviewSummary.reviews} értékelés alapján</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Chart */}
      {tab === "chart" && (
        <div className="p-5 space-y-4">
          {/* Metric selector */}
          <div className="flex gap-2">
            {(["views", "phoneClicks", "leads"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                className={cn(
                  "flex-1 rounded-xl py-2 text-[11.5px] font-bold transition-all",
                  chartMetric === m ? "bg-primary text-white" : "bg-surface-alt text-ink-muted"
                )}
              >
                {m === "views" && "👁️ Nézettség"}
                {m === "phoneClicks" && "📞 Hívások"}
                {m === "leads" && "📋 Leadek"}
              </button>
            ))}
          </div>

          {last30.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line py-10 text-center text-[13px] text-ink-muted">
              Még nincs elegendő adat a grafikon megjelenítéséhez.
            </div>
          ) : (
            <>
              <div className="flex items-end gap-0.5 h-[120px] mt-2">
                {last30.map((d) => {
                  const val = d[chartMetric];
                  const h = Math.max(3, Math.round((val / maxVal) * 100));
                  const isToday = d.day === new Date().toISOString().slice(0, 10);
                  return (
                    <div
                      key={d.day}
                      className="flex-1 flex flex-col items-center justify-end gap-0.5 group"
                      title={`${d.day}: ${val}`}
                    >
                      <div
                        className={cn(
                          "w-full rounded-t-sm transition-all",
                          isToday ? "bg-primary" : "bg-primary/35 group-hover:bg-primary/60"
                        )}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-ink-faint px-0.5">
                <span>{last30[0]?.day?.slice(5)}</span>
                <span className="text-primary font-bold">Ma</span>
              </div>
              <p className="text-[11px] text-ink-muted text-center">
                Utolsó {last30.length} nap — összesen:{" "}
                <strong className="text-ink">
                  {last30.reduce((s, d) => s + d[chartMetric], 0)}
                </strong>
              </p>
            </>
          )}
        </div>
      )}

      {/* Tab: Competitors */}
      {tab === "competitors" && (
        <div className="p-5 space-y-4">
          {stats.competitorRank ? (
            <>
              <div className={cn(
                "rounded-2xl border-2 px-5 py-4 text-center",
                stats.competitorRank.rank === 1 ? "border-star/40 bg-star/5" :
                stats.competitorRank.rank <= 3 ? "border-success/40 bg-success/5" :
                "border-line bg-surface-alt/50"
              )}>
                <p className="text-[11px] font-black uppercase tracking-wider text-ink-muted mb-1">
                  Rangsor — {stats.competitorRank.categoryLabel}
                </p>
                <p className={cn(
                  "text-[56px] font-extrabold leading-none",
                  stats.competitorRank.rank === 1 ? "text-star" :
                  stats.competitorRank.rank <= 3 ? "text-success" :
                  "text-ink"
                )}>
                  {ordinalLabel(stats.competitorRank.rank)}
                </p>
                <p className="text-[13px] text-ink-muted mt-1">
                  {stats.competitorRank.total} regisztrált vállalkozóból
                </p>
                {stats.competitorRank.rank === 1 && (
                  <p className="mt-2 text-[12px] font-bold text-star">🥇 Te vagy a legjobban értékelt!</p>
                )}
                {stats.competitorRank.rank === 2 && (
                  <p className="mt-2 text-[12px] font-bold text-success">🥈 Csak egy lépés az első helytől!</p>
                )}
                {stats.competitorRank.rank === 3 && (
                  <p className="mt-2 text-[12px] font-bold text-success">🥉 Top 3-ban vagy!</p>
                )}
                {stats.competitorRank.rank > 3 && (
                  <p className="mt-2 text-[12px] text-ink-muted">
                    Tipp: kérj több véleményt ügyfeleidtől, hogy feljebb kerülj!
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-surface-alt/60 border border-line p-4 space-y-2.5">
                <p className="text-[12px] font-extrabold text-ink">💡 Hogyan kerülj feljebb?</p>
                <TipRow icon="star" text="Kérd meg elégedett ügyfeleidet, hogy írjanak értékelést a profilodra." />
                <TipRow icon="check" text="Töltsd ki teljesen a profilodat (logo, galéria, nyitvatartás, leírás)." />
                <TipRow icon="send" text="Kapcsold be az árajánlat-kérést, hogy passzív leadeket kapj." />
                <TipRow icon="globe" text="Add hozzá a közösségi oldalaidat (Facebook, Instagram)." />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-line py-10 text-center text-[13px] text-ink-muted">
              <p className="text-2xl mb-2">🔍</p>
              A versenytárs összehasonlítás akkor jelenik meg, ha a profilod jóváhagyásra kerül.
            </div>
          )}
        </div>
      )}

      {/* Footer note */}
      <div className="px-5 pb-4">
        <p className="text-[10.5px] text-ink-faint text-center leading-relaxed">
          Anonim adatok — sem te, sem mi nem látunk nevet vagy IP-t.
          Adatok 30 napos ablakon belül tárolódnak.
        </p>
      </div>
    </section>
  );
}

// --- Sub-components ---

function KpiCard({
  label, value, icon, accent, success, highlight,
}: {
  label: string; value: number; icon: IconName;
  accent?: boolean; success?: boolean; highlight?: boolean;
}) {
  const color = accent ? "text-accent" : success ? "text-success" : "text-ink";
  const bg = accent ? "bg-accent/5 border-accent/15"
    : success ? "bg-success/5 border-success/15"
    : highlight ? "bg-primary/5 border-primary/15"
    : "bg-surface-alt/60 border-line";

  return (
    <div className={cn("rounded-[14px] border p-2.5", bg)}>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
        <Icon name={icon} size={9} strokeWidth={2.4} />
        <span className="truncate">{label}</span>
      </div>
      <p className={cn("mt-1 text-[22px] font-extrabold tracking-tight leading-none", color)}>
        {value.toLocaleString("hu-HU")}
      </p>
    </div>
  );
}

function TipRow({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary mt-0.5">
        <Icon name={icon} size={12} strokeWidth={2.4} />
      </span>
      <p className="text-[12px] leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}
