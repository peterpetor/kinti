import { Icon } from "@/components/ui";
import type { QaPar } from "@/lib/guide-schema";

/**
 * CikkGyik — a cikk saját kérdés-válasz párjai, tömören.
 *
 * ⚠️ EZ NEM MÁSOLJA A CIKKET. A kérdés a fejezet címe, a válasz pedig a
 * fejezet ELSŐ állítása — a teljes szöveg helyett. Aki többet akar, a
 * horgonyra koppintva a fejezethez ugrik. Így a blokk navigáció és
 * gyors-válasz, nem duplikált tartalom.
 *
 * Szerver-komponens: nincs benne állapot, és a válaszgépeknek a szerver által
 * kiszolgált HTML-ben kell látniuk (kliensoldali render nélkül is).
 */
export function CikkGyik({ parok }: { parok: QaPar[] }) {
  if (parok.length === 0) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <h2 className="mb-2.5 flex items-center gap-2 text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">
        <span className="text-[15px]">💬</span>
        Gyors válaszok
      </h2>
      <dl className="space-y-2.5">
        {parok.map((p) => (
          <div key={p.anchor} className="rounded-[12px] bg-surface-alt/60 px-3.5 py-2.5">
            <dt className="text-[13px] font-bold leading-snug text-ink">{p.kerdes}</dt>
            <dd className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              {p.rovid}{" "}
              <a href={`#${p.anchor}`} className="whitespace-nowrap font-bold text-primary-ink underline underline-offset-2">
                Részletek
                <Icon name="chevR" size={11} strokeWidth={2.8} className="ml-0.5 inline-block align-[-1px]" />
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
