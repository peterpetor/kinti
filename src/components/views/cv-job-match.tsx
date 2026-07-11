"use client";

/**
 * cv-job-match.tsx — „Intelligens állásajánló" a Német Önéletrajz Készítőben.
 *
 * A kész (letöltött) CV szakma-kategóriáját és az app-országot összeveti az aktív
 * hirdetésekkel (/api/jobs/match): az ELSŐ sikeres PDF-letöltés után BottomSheet
 * ugrik fel a találatokkal, bezárás után a lista inline panelként megmarad a
 * letöltés-gomb alatt (a lezárt popup ne veszítse el a tölcsért). Nulla találatnál
 * SEMMI nem jelenik meg — ürességet nem reklámozunk (presence-heatmap tanulság).
 * A Kinti-kártya egyből a /allasok/[id]/jelentkezes oldalra visz; a külső hirdetés
 * kifelé linkel (ugyanazzal a rel-lel, mint a jobs-browser).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon } from "@/components/ui";
import { trackAction } from "@/components/usage-tracker";
import { usePreferredCountry } from "@/lib/country-pref";

interface KintiMatch {
  id: string;
  title: string;
  location: string;
  companyName: string | null;
  featured: boolean;
}
interface ExternalMatch {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  source: string;
  sourceUrl: string;
}
interface MatchData {
  kinti: KintiMatch[];
  external: ExternalMatch[];
}

function MatchList({ data }: { data: MatchData }) {
  return (
    <div className="space-y-2">
      {data.kinti.map((j) => (
        <Link
          key={j.id}
          href={`/allasok/${j.id}/jelentkezes`}
          onClick={() => trackAction("cv-match-apply")}
          className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-card transition active:scale-[0.99]"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-extrabold text-ink">{j.title}</span>
            <span className="block truncate text-[12px] text-ink-muted">
              {[j.companyName, j.location].filter(Boolean).join(" · ")}
            </span>
          </span>
          {j.featured && (
            <span className="shrink-0 rounded-pill bg-star/15 px-2 py-0.5 text-[10.5px] font-bold text-star">
              Kiemelt
            </span>
          )}
          <span className="shrink-0 rounded-pill bg-primary px-3 py-1.5 text-[12px] font-extrabold text-white">
            Jelentkezés
          </span>
        </Link>
      ))}
      {data.external.map((j) => (
        <a
          key={j.id}
          href={j.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() => trackAction("cv-match-out")}
          className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 transition active:scale-[0.99]"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-bold text-ink">{j.title}</span>
            <span className="block truncate text-[12px] text-ink-muted">
              {[j.company, j.location].filter(Boolean).join(" · ")} · külső forrás
            </span>
          </span>
          <span className="shrink-0 text-[13px] font-bold text-ink-faint" aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

export function CvJobMatch({ categoryId, armed }: { categoryId: string; armed: boolean }) {
  const [country] = usePreferredCountry();
  const [data, setData] = useState<MatchData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!armed || !categoryId || !country || data) return;
    let cancelled = false;
    fetch(`/api/jobs/match?country=${country}&category=${encodeURIComponent(categoryId)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Partial<MatchData>>) : null))
      .then((d) => {
        if (cancelled || !d) return;
        const kinti = d.kinti ?? [];
        const external = d.external ?? [];
        if (kinti.length + external.length === 0) return; // nincs találat → csendben semmi
        setData({ kinti, external });
        setSheetOpen(true);
        trackAction("cv-match-shown");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [armed, categoryId, country, data]);

  if (!data) return null;

  return (
    <>
      {/* Inline panel — a sheet bezárása után is megmarad a letöltés-gomb alatt. */}
      <div className="rounded-xl border border-primary/25 bg-primary-soft/30 p-3.5">
        <p className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
          <Icon name="briefcase" size={15} strokeWidth={2.4} className="text-primary" />
          Hozzád illő aktív állások
        </p>
        <MatchList data={data} />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="A CV-d kész! 🎉">
        <div className="space-y-3 pt-1">
          <p className="text-[13.5px] leading-relaxed text-ink-muted">
            A friss német önéletrajzod már az eszközödön van — ezek pedig a szakmádhoz
            illő, most aktív állások. Jelentkezz, amíg friss a CV!
          </p>
          <MatchList data={data} />
          <Link
            href="/allasok"
            className="block rounded-pill border border-line bg-surface px-4 py-2.5 text-center text-[13.5px] font-bold text-ink transition active:scale-[0.98]"
          >
            Összes állás böngészése
          </Link>
          {/* Tölcsér következő lépcsője: állás-radar a CV szakmájára előtöltve —
              az első találat azonnali push/email, a többi napi digest. */}
          <Link
            href={`/allasok?radarcat=${encodeURIComponent(categoryId)}#radar`}
            onClick={() => trackAction("cv-match-radar")}
            className="block rounded-pill border border-primary/30 bg-primary-soft/40 px-4 py-2.5 text-center text-[13.5px] font-bold text-primary transition active:scale-[0.98]"
          >
            🔔 Szóljunk, ha új állás jön a szakmádban?
          </Link>
          {data.external.length > 0 && (
            <p className="text-[10.5px] leading-snug text-ink-faint">
              A „külső forrás" jelölésű hirdetések harmadik felek oldalaira mutatnak,
              tartalmukért nem felelünk.
            </p>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
