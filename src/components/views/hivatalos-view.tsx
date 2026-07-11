"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry, countryLocative } from "@/lib/countries";
import {
  OFFICIAL_CATEGORIES, getConsulate, getEmergencyNumbers, getOfficialLinks,
  KONZINFO_APPOINTMENT_URL, KONZULI_EMERGENCY_PHONE, KONZULI_SERVICE_URL,
  type OfficialCategory,
} from "@/lib/official-links";

export function HivatalosView() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryName = getCountry(country)?.name ?? "Svájc";

  const consulate = getConsulate(country);
  const emergency = getEmergencyNumbers(country);
  const links = useMemo(() => getOfficialLinks(country), [country]);

  const [filter, setFilter] = useState<OfficialCategory | "all">("all");
  const visible = filter === "all" ? links : links.filter((l) => l.category === filter);

  return (
    <div className="space-y-4">
      {/* Jogi keret: NEM tanácsadás, hanem a hivatalos forráshoz vezet. */}
      <p className="rounded-card border border-line bg-surface-alt px-4 py-3 text-[12px] leading-snug text-ink-muted">
        A Kinti <strong>nem ad hatósági tanácsot</strong>. Megmutatjuk, <strong>melyik hivatalos oldalon</strong> intézheted az ügyed — magyarul elmagyarázva, egy kattintásra. Minden link a hivatalos (állami / konzuli) oldalra visz.
      </p>

      {/* Konzulátus-kártya — a középpont */}
      <section className="rounded-card border border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">🇭🇺</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">{consulate.name}</h2>
            <p className="text-[12.5px] text-ink-muted">{consulate.city} — magyar konzuli képviselet {countryLocative(country)}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <OutLink href={KONZINFO_APPOINTMENT_URL} primary>📅 Konzuli időpontfoglalás (Konzinfo)</OutLink>
          <div className="grid grid-cols-2 gap-2">
            <OutLink href={consulate.website}>🌐 Nagykövetség</OutLink>
            <OutLink href={KONZULI_SERVICE_URL}>📜 Konzuli Szolgálat</OutLink>
          </div>
        </div>

        {consulate.extra && consulate.extra.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {consulate.extra.map((e) => (
              <a key={e.url} href={e.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-pill border border-primary/20 bg-surface px-2.5 py-1 text-[11.5px] font-bold text-primary">
                {e.name} ↗
              </a>
            ))}
          </div>
        )}

        <p className="mt-3 flex items-center gap-2 rounded-[10px] bg-accent/10 px-3 py-2 text-[12px] font-bold text-accent">
          🆘 Konzuli ügyelet (0–24):
          <a href={`tel:${KONZULI_EMERGENCY_PHONE.replace(/\s/g, "")}`} className="underline">{KONZULI_EMERGENCY_PHONE}</a>
        </p>
      </section>

      {/* Vészhelyzeti számok */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <h3 className="mb-2 text-[13px] font-extrabold text-ink">🚨 Vészhelyzeti számok — {countryName}</h3>
        <div className="flex flex-wrap gap-1.5">
          {emergency.map((e) => (
            <a key={e.number} href={`tel:${e.number}`}
              className="inline-flex items-center gap-1.5 rounded-pill bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink">
              <span className="text-accent">{e.number}</span>
              <span className="text-ink-muted font-medium">{e.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* „Itt intézheted" — trigger-indexelt hivatalos linkek */}
      <div>
        <h3 className="mb-2 text-[14px] font-extrabold text-ink">Mit szeretnél elintézni?</h3>
        <div className="no-scrollbar kinti-hfade -mx-5 mb-3 flex gap-2 overflow-x-auto px-5">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="Mind" />
          {OFFICIAL_CATEGORIES.map((c) => (
            <FilterPill key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={`${c.emoji} ${c.label}`} />
          ))}
        </div>

        <div className="space-y-2.5">
          {visible.map((l) => (
            <a key={l.trigger} href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-xl">{l.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">{l.trigger}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">{l.explain}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-bold text-primary">
                  Itt intézheted: {l.source} ↗
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutLink({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-pill px-3 py-2.5 text-[13px] font-bold transition active:scale-[0.98]",
        primary ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink",
      )}>
      {children}
    </a>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("shrink-0 rounded-pill px-3 py-1.5 text-[12px] font-bold transition", active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink-muted")}>
      {label}
    </button>
  );
}
