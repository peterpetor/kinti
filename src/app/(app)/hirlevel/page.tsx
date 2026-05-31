import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Hírlevél — átállás push-értesítésre",
  description:
    "A heti email-hírlevél megszűnt. Aki értesítést kérne új eseményekről, push-feliratkozással kapja a böngészőjében.",
};

/**
 * /hirlevel — DEPRECATED.
 *
 * A GDPR adatminimalizálás keretében az email-alapú heti hírlevél megszűnik.
 * A meglevő feliratkozók még kapnak emailt a teljes deprecation időszakig
 * (cron-digest tovább fut), de új feliratkozó nincs. Helyette Web Push-ra
 * tereljük az érdeklődőket.
 */
export default function HirlevelPage() {
  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ScreenHeader
        eyebrow="Hírlevél — megszűnt"
        title="Push-értesítésre álltunk át"
      />

      <div className="rounded-card border border-line bg-surface-alt px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
        Az email-hírlevél <strong className="text-ink">megszűnt</strong> — a GDPR
        adatminimalizálás miatt semmilyen email-címet nem szeretnénk tárolni a
        kintinél. Helyette a böngésződ <strong className="text-ink">push-értesítést</strong>{" "}
        kaphat új eseményekről a kantonodban.
      </div>

      <div className="rounded-card border border-line bg-surface p-5 shadow-card text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary text-lg">
          🔔
        </div>
        <h2 className="mt-3 text-[16px] font-extrabold tracking-tight text-ink">
          Iratkozz fel push-értesítésre
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13px] leading-relaxed text-ink-muted">
          A Közösség oldalon találsz egy „Értesítések" gombot. Egy
          kattintás, és a böngésződ küld neked üzenetet, amikor új tartalom jön.
        </p>
        <Link
          href="/kozosseg"
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
        >
          Irány a Közösséghez
          <Icon name="arrowRight" size={15} strokeWidth={2.4} />
        </Link>
      </div>

      <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[11.5px] leading-relaxed text-ink-faint">
        <strong className="text-ink">Régi feliratkozó vagy?</strong> A meglevő email-feliratkozások
        még futnak egy átmeneti ideig. A leiratkozó linket az utolsó leveledben találod.
      </div>
    </div>
  );
}
