"use client";

import { Icon } from "@/components/ui/icons";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryAdjective } from "@/lib/countries";

/**
 * A Kinti PRO előnyök ország-tudatos listája (a /allasok/pro upsell-oldalhoz).
 * Eddig fixen svájci tartalom volt — DE/NL-en is „svájci" jelent meg. Most a
 * választott ország szerint helyes (nyelvkurzus + interjú-szöveg), és csak a
 * tényleg létező elemeket mutatja (szakmai szótár CH-only, állampolgársági teszt mind a 4 országra).
 */
export function ProFeatures() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const adj = countryAdjective(country); // svájci / osztrák / német / holland

  const langLabel =
    country === "CH" ? "Svájci Német (Mundart)"
    : country === "AT" ? "Osztrák Német"
    : country === "DE" ? "Német (Hochdeutsch)"
    : country === "NL" ? "Holland (Nederlands)"
    : "Nyelvi";
  const citizenship = " + Állampolgársági teszt szimulátor";

  const items: { title: string; desc: string }[] = [];
  if (country === "CH") {
    items.push({ title: "Teljes Szakmai Gyors-Szótár", desc: "500+ svájci szakmai kifejezés és munkahelyi párbeszéd hanganyaggal." });
  }
  items.push({ title: "AI Munkainterjú Szimulátor + CV-audit", desc: `Gyakorolj ${adj} cégek interjúira, és elemeztesd az önéletrajzod mesterséges intelligenciával.` });
  items.push({ title: `${langLabel} mesterkurzus${citizenship}`, desc: "A teljes nyelvi felkészülés egy helyen, lépésről lépésre." });
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
