import Link from "next/link";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";

/**
 * TrustBar — bizalmi lábléc a kezdőlap alján. A komolyság-jelek (bejegyzett cég,
 * Merchant of Record fizetés, GDPR, jogi oldalak) eddig csak a „…" menüben /
 * jogi oldalakon voltak — itt láthatóvá tesszük. Minden adat VALÓDI:
 * üzemeltető Feedback Jobs S.R.L. (lásd /impresszum), fizetés Paddle (MoR).
 */
const LEGAL: { href: string; label: string }[] = [
  { href: "/impresszum", label: "Impresszum" },
  { href: "/aszf", label: "ÁSZF" },
  { href: "/adatvedelem", label: "Adatvédelem" },
  { href: "/visszateres", label: "Visszatérítés" },
];

export function TrustBar() {
  return (
    <section className="mt-2 rounded-card border border-line bg-surface-alt/50 px-4 py-4">
      <div className="grid grid-cols-3 gap-2">
        <TrustItem icon="briefcase" title="Bejegyzett cég" sub="Feedback Jobs S.R.L." />
        <TrustItem icon="lock" title="Biztonságos fizetés" sub="Paddle · Merchant of Record" />
        <TrustItem icon="check" title="GDPR-kompatibilis" sub="Adataid védve" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-line pt-3 text-[11.5px] font-semibold text-ink-muted">
        {LEGAL.map((l) => (
          <Link key={l.href} href={l.href} className="transition hover:text-ink hover:underline">
            {l.label}
          </Link>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-faint">
        © 2024–2026 Feedback Jobs S.R.L. · kinti.app
      </p>
    </section>
  );
}

function TrustItem({ icon, title, sub }: { icon: IconName; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon name={icon} size={16} strokeWidth={2.2} />
      </span>
      <span className="text-[11px] font-extrabold leading-tight text-ink">{title}</span>
      <span className="text-[10.5px] leading-tight text-ink-muted">{sub}</span>
    </div>
  );
}
