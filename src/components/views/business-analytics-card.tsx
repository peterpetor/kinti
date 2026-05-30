import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";
import type { BusinessAnalytics } from "@/lib/repo";

/**
 * BusinessAnalyticsCard — a manage-page-en jelenik meg, a vállalkozó saját
 * statisztikáit mutatja. Server-renderelt, anonim számok (nincs IP- vagy
 * user-listázás).
 */
export function BusinessAnalyticsCard({ stats }: { stats: BusinessAnalytics }) {
  const maxDaily = Math.max(
    1,
    ...stats.daily.map((d) => Math.max(d.views, d.phoneClicks)),
  );

  // utolsó 14 nap egyfajta egyszerű bar-jellegű soráig
  const last14 = stats.daily.slice(0, 14).reverse();

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-primary-soft text-primary">
          <Icon name="trending" size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
            Profil-statisztika
          </h2>
          <p className="text-[11.5px] text-ink-muted">
            Anonim — sem mi, sem te nem látsz nevet vagy IP-t.
          </p>
        </div>
      </div>

      {/* KPI-mátrix */}
      <div className="grid grid-cols-3 gap-2">
        <Kpi label="Összes megtekintés" value={stats.views.total} icon="eye" />
        <Kpi label="Utolsó 7 nap" value={stats.views.last7Days} icon="trending" />
        <Kpi label="Utolsó 30 nap" value={stats.views.last30Days} icon="calendar" />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <Kpi
          label="Telefon-kattintás"
          value={stats.phoneClicks.total}
          icon="phone"
          accent
        />
        <Kpi
          label="Utolsó 7 nap"
          value={stats.phoneClicks.last7Days}
          icon="trending"
          accent
        />
        <Kpi
          label="Utolsó 30 nap"
          value={stats.phoneClicks.last30Days}
          icon="calendar"
          accent
        />
      </div>

      {/* 14-napos sáv */}
      {last14.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Utolsó {last14.length} nap (megtekintés)
          </p>
          <div className="flex items-end gap-1 h-[60px]">
            {last14.map((d) => {
              const h = Math.max(2, Math.round((d.views / maxDaily) * 100));
              return (
                <div
                  key={d.day}
                  title={`${d.day} — ${d.views} megtekintés, ${d.phoneClicks} hívás`}
                  className="flex-1 rounded-sm bg-primary/40 hover:bg-primary/70 transition"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
          <p className="mt-1 text-[10.5px] text-ink-faint">
            Vidd a kurzort a sávra a részletekért.
          </p>
        </div>
      )}

      {stats.views.total === 0 && (
        <p className="mt-3 text-[12px] text-ink-muted">
          Még nincs adat. Amint látogatók érkeznek a profilodra, itt megjelennek a számok.
        </p>
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: IconName;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-card border ${accent ? "border-accent/20 bg-accent/5" : "border-line bg-surface-alt/60"} p-2.5`}
    >
      <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
        <Icon name={icon} size={10} strokeWidth={2.4} />
        <span className="truncate">{label}</span>
      </div>
      <p className={`mt-1 text-[20px] font-extrabold tracking-tight ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
