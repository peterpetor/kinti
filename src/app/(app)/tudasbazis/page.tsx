import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { GUIDES, GUIDES_DISCLAIMER } from "@/lib/guides";

export const runtime = "edge";

export const metadata = {
  title: "Tudásbázis — útmutatók magyaroknak Svájcban",
  description:
    "Hivatalos forrásból: bejelentkezés, egészségbiztosítás (Krankenkasse), adózás és iskola — kint élő magyaroknak Svájcban.",
};

export default function TudasbazisPage() {
  return (
    <div className="space-y-4 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ScreenHeader
        eyebrow="Tudásbázis · Svájc"
        title={
          <>
            Hasznos tudnivalók,
            <br />
            hivatalos forrásból.
          </>
        }
      />

      <div className="grid gap-2.5">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/tudasbazis/${g.slug}`}
            className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
              <Icon name={g.icon} size={19} strokeWidth={2.3} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold tracking-[-0.01em] text-ink">
                {g.title}
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">
                {g.summary}
              </span>
            </span>
            <Icon name="chevR" size={16} strokeWidth={2.2} className="mt-1 shrink-0 text-ink-muted" />
          </Link>
        ))}
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-ink-faint">{GUIDES_DISCLAIMER}</p>
    </div>
  );
}
