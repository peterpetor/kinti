import Link from "next/link";

/**
 * Egységes jogi felelősség-kizáró komponens — minden eszköz, kalkulátor és
 * tájékoztató oldal végén megjelenik. Cél: jogi védettség a hibás döntésekkel
 * szembeni perekkel szemben.
 *
 * Variánsok:
 *   - "info"     — egyszerű tájékoztató (alap)
 *   - "legal"    — jogi vonatkozású (vám, bírság, engedély)
 *   - "critical" — komoly tét (állampolgárság, vízum, adózás)
 */

interface OfficialSource {
  label: string;
  url: string;
}

interface LegalDisclaimerProps {
  /** Az eszköz neve. */
  toolName: string;
  /** Milyen típusú tartalom — meghatározza a vizuális hangsúlyt. */
  variant?: "info" | "legal" | "critical";
  /** Mihez NEM ad tanácsot az eszköz (pl. "jogi", "pénzügyi", "orvosi"). */
  notAdviceFor?: string;
  /** Hivatalos források ahova a felhasználónak fordulnia kell. */
  officialSources?: OfficialSource[];
  /** Esetleges plusz figyelmeztetés. */
  extraWarning?: string;
}

const VARIANT_STYLE: Record<NonNullable<LegalDisclaimerProps["variant"]>, { border: string; bg: string; icon: string }> = {
  info:     { border: "border-line",          bg: "bg-surface-alt/60",    icon: "ℹ️" },
  legal:    { border: "border-[#e3a233]/40",  bg: "bg-[#fff8ed]",         icon: "⚠️" },
  critical: { border: "border-accent/30",     bg: "bg-accent-soft",       icon: "🚨" },
};

export function LegalDisclaimer({
  toolName,
  variant = "info",
  notAdviceFor = "jogi, pénzügyi, vámjogi, orvosi vagy adóügyi",
  officialSources = [],
  extraWarning,
}: LegalDisclaimerProps) {
  const style = VARIANT_STYLE[variant];

  return (
    <section
      className={`rounded-card border-2 ${style.border} ${style.bg} px-4 py-4 text-[11.5px] leading-relaxed text-ink space-y-2.5`}
      role="note"
      aria-label="Jogi felelősség-kizáró nyilatkozat"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-base">{style.icon}</span>
        <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-ink">
          Fontos jogi tájékoztató
        </h2>
      </div>

      <p>
        <strong>A {toolName} TÁJÉKOZTATÓ JELLEGŰ eszköz, NEM számít {notAdviceFor} tanácsnak.</strong>{" "}
        A megjelenített adatok pontosságát, frissességét és teljességét NEM garantáljuk.
      </p>

      <ul className="space-y-1.5 pl-1">
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            <strong>Az eszköz használata saját felelősségedre történik.</strong> A kinti.app
            üzemeltetője nem felelős semmilyen olyan döntésért vagy következményért,
            amit az eszköz adatai alapján hozol.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            <strong>Hivatalos döntés előtt mindig a hivatalos forrást ellenőrizd</strong>
            {" "}— a hatóság, illetékes hivatal, szakértő (ügyvéd, adótanácsadó, jogász).
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            A megadott becslések, számítások és magyarázatok <strong>történelmi adatok,
            általános minták és publikus források</strong> alapján készültek — az egyedi
            esetedre eltérő szabályok vonatkozhatnak.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            <strong>A szabályok, díjak, árfolyamok és hatósági eljárások bármikor
            megváltozhatnak, előzetes értesítés nélkül.</strong>{" "}
            Az itt szereplő adatok az utolsó szerkesztés időpontjában voltak érvényesek —
            a kinti.app nem vállal felelősséget az azóta bekövetkezett változásokból eredő
            károkért vagy tévedésekért.
          </span>
        </li>
      </ul>

      {extraWarning && (
        <p className="rounded-md bg-white/60 px-2.5 py-1.5 text-[11.5px] font-semibold">
          {extraWarning}
        </p>
      )}

      {officialSources.length > 0 && (
        <div className="pt-1">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            Hivatalos források
          </p>
          <div className="flex flex-wrap gap-1.5">
            {officialSources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary-soft transition"
              >
                🔗 {s.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="pt-1 text-[10.5px] text-ink-muted">
        Részletek:{" "}
        <Link href="/aszf" className="underline font-bold">Felhasználási Feltételek</Link>{" "}
        ·{" "}
        <Link href="/impresszum" className="underline font-bold">Impresszum</Link>
      </p>
    </section>
  );
}
