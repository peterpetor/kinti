"use client";

/**
 * kinti-assistant.tsx — „Kinti Asszisztens" prompt-kártya a kezdőlapon.
 *
 * A user szabad szövegben leírja a problémáját („eltört a vízvezeték Bécsben,
 * mit csináljak?"), és útmutató-cikkeket + magyar szakembereket kap vissza —
 * az asszisztens IRÁNYÍT, nem tanácsol (a válasz-generálás szándékosan kimaradt:
 * hallucináció + jogi kockázat). A motor: heurisztika-először, AI csak
 * értelmezésre (lásd /api/asszisztens).
 */

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { trackAction } from "@/components/usage-tracker";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

interface AssistantResult {
  categoryId: string | null;
  cantonCode: string | null;
  explanation: string;
  guides: { slug: string; title: string }[];
  businesses: { id: string; name: string; categoryLabel: string | null; featured: boolean }[];
}

const EXAMPLES = [
  "Csőtörés van, a főbérlő nem veszi fel — ki segít?",
  "Hogyan működik az adóbevallás?",
  "Magyar fodrászt keresek a közelben",
];

export function KintiAssistant() {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssistantResult | null>(null);

  async function ask(text: string) {
    const q = text.trim();
    if (q.length < 3 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    trackAction("assistant-ask");
    try {
      const res = await fetch("/api/asszisztens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, country }),
      });
      const data = (await res.json().catch(() => ({}))) as AssistantResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Hiba történt — próbáld újra.");
        return;
      }
      setResult(data);
    } catch {
      setError("Hálózati hiba — ellenőrizd a kapcsolatot.");
    } finally {
      setLoading(false);
    }
  }

  const hasHits = !!result && (result.guides.length > 0 || result.businesses.length > 0);
  const szaknevsorHref = result?.categoryId
    ? `/szaknevsor?cat=${encodeURIComponent(result.categoryId)}${result.cantonCode ? `&canton=${encodeURIComponent(result.cantonCode)}` : ""}`
    : "/szaknevsor";

  return (
    <section className="rounded-card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-surface p-4 shadow-card">
      <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink">
        <Icon name="sparkles" size={16} strokeWidth={2.2} className="text-primary" />
        Miben segítsünk?
      </p>
      <p className="mt-0.5 text-[11.5px] text-ink-muted">
        Írd le a problémád — útmutatót és magyar szakembert ajánlunk hozzá.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(query);
        }}
        className="mt-2.5 flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={300}
          placeholder="pl. csőtörés van, ki segít?"
          className="h-11 min-w-0 flex-1 rounded-pill border border-line bg-surface px-4 text-[14px] text-ink outline-none transition focus:border-primary/50"
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 3}
          aria-label="Kérdés elküldése"
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white transition active:scale-95",
            (loading || query.trim().length < 3) && "opacity-50",
          )}
        >
          {loading ? (
            <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Icon name="send" size={17} strokeWidth={2.4} />
          )}
        </button>
      </form>

      {/* Példa-chipek — az üres prompt hidegindítója. */}
      {!result && !loading && (
        <div className="no-scrollbar kinti-hfade -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
                void ask(ex);
              }}
              className="shrink-0 rounded-pill border border-line bg-surface px-3 py-1.5 text-[11.5px] font-semibold text-ink-muted transition active:scale-95"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-[12px] font-semibold text-accent">{error}</p>}

      {result && (
        <div className="mt-3 space-y-3">
          {/* A magyarázat csak TALÁLAT mellett hasznos — üres eredménynél a
              (néha sután fogalmazó) AI-mondat többet árt, mint segít. */}
          {hasHits && result.explanation && (
            <p className="text-[12px] italic text-ink-muted">💡 {result.explanation}</p>
          )}

          {result.guides.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Hasznos útmutatók</p>
              <div className="space-y-1.5">
                {result.guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/tudasbazis/${g.slug}`}
                    onClick={() => trackAction("assistant-click")}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition active:scale-[0.99]"
                  >
                    <span className="text-base">📖</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink">{g.title}</span>
                    <Icon name="chevR" size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.businesses.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Magyar szakemberek</p>
              <div className="space-y-1.5">
                {result.businesses.map((b) => (
                  <Link
                    key={b.id}
                    href={`/szaknevsor/${b.id}`}
                    onClick={() => trackAction("assistant-click")}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition active:scale-[0.99]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-ink">{b.name}</span>
                      {b.categoryLabel && (
                        <span className="block truncate text-[11px] text-ink-muted">{b.categoryLabel}</span>
                      )}
                    </span>
                    {b.featured && (
                      <span className="shrink-0 rounded-pill bg-star/15 px-2 py-0.5 text-[10px] font-bold text-star">Kiemelt</span>
                    )}
                    <Icon name="chevR" size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
                  </Link>
                ))}
              </div>
              <Link
                href={szaknevsorHref}
                onClick={() => trackAction("assistant-click")}
                className="mt-1.5 block text-center text-[12px] font-bold text-primary"
              >
                Összes találat a Szaknévsorban →
              </Link>
            </div>
          )}

          {!hasHits && (
            <p className="rounded-xl border border-line bg-surface-alt/60 px-3.5 py-2.5 text-[12.5px] leading-snug text-ink-muted">
              Erre így nem találtam pontos találatot — próbáld másképp megfogalmazni,
              vagy böngészd a{" "}
              <Link href="/szaknevsor" className="font-bold text-primary underline">Szaknévsort</Link> és a{" "}
              <Link href="/tudasbazis" className="font-bold text-primary underline">Tudásbázist</Link>.
            </p>
          )}

          <p className="text-[10px] leading-snug text-ink-faint">
            Az asszisztens útmutatókhoz és szakemberekhez irányít — nem ad jogi, pénzügyi
            vagy egészségügyi tanácsot.
          </p>
        </div>
      )}
    </section>
  );
}
