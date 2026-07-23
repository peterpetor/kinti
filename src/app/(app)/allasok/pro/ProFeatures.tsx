"use client";

import { Icon } from "@/components/ui/icons";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryAdjective } from "@/lib/countries";

/**
 * A Kinti PRO előnyök ország-tudatos listája (a /allasok/pro upsell-oldalhoz).
 * Eddig fixen svájci tartalom volt — DE/NL-en is „svájci" jelent meg. Most a
 * választott ország szerint helyes (CV-audit szöveg), és csak a
 * tényleg létező elemeket mutatja (szakmai szótár CH-only, állampolgársági teszt mind a 4 országra).
 */
export function ProFeatures() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const adj = countryAdjective(country); // svájci / osztrák / német / holland

  // A nyelvkurzus 2026-07-11 óta INGYENES mind a 4 országban (user-döntés) —
  // ezért NEM szerepel a PRO-értékajánlatban; ne tedd vissza.
  const items: { title: string; desc: string }[] = [];
  if (country === "CH") {
    items.push({ title: "Teljes Szakmai Gyors-Szótár", desc: "500+ svájci szakmai kifejezés és munkahelyi párbeszéd hanganyaggal." });
  }
  items.push({ title: "AI CV-audit", desc: `Elemeztesd az önéletrajzod mesterséges intelligenciával, ${adj} elvárásokhoz igazítva.` });
  items.push({ title: "Állampolgársági teszt-szimulátor", desc: "Vizsga-szimuláció a saját országod kérdéssorával — mind a 4 országra." });
  items.push({ title: "Minden prémium modul + jövőbeni PRO funkció", desc: "Minden új funkció és frissítés az előfizetés része marad." });

  return (
    <ul className="p-6 space-y-4">
      {items.map((it) => (
        <li key={it.title} className="flex gap-3">
          <span className="text-star shrink-0 mt-0.5"><Icon name="check" size={20} strokeWidth={3} /></span>
          <div>
            <strong className="text-[14px] text-ink block">{it.title}</strong>
            <span className="text-[13px] text-ink-muted">{it.desc}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
