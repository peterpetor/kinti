import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

/**
 * StatCard — vállalkozói dashboard KPI-kártyája (ikon · nagy érték · címke ·
 * pozitív delta). Az `accent` változat paprikapiros ikonháttérrel emel ki.
 */
export interface StatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
  delta?: string | null;
  accent?: boolean;
}

export function StatCard({ icon, value, label, delta, accent }: StatCardProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-3 shadow-card">
      <div
        className={cn(
          "mb-1.5 grid h-7 w-7 place-items-center rounded-lg",
          accent ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary",
        )}
      >
        <Icon name={icon} size={14} strokeWidth={2.4} />
      </div>
      <div className="text-[22px] font-extrabold leading-none tracking-tight text-ink">{value}</div>
      <div className="mt-0.5 text-[10.5px] font-semibold leading-tight text-ink-muted">{label}</div>
      {delta && <div className="mt-1 text-[11px] font-bold text-success">↑ {delta}</div>}
    </div>
  );
}
