import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { getPlacementCandidates, countPlacementCandidates } from "@/lib/repo";
import { COUNTRIES } from "@/lib/countries";
import { getRegions } from "@/lib/regions";
import { jobCategoryLabel } from "@/lib/job-categories";
import { ImportToPipeline } from "@/components/admin/import-to-pipeline";
import { RemoveFromPlacement } from "@/components/admin/remove-from-placement";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jelöltek — Kinti Admin",
  robots: { index: false, follow: false },
};

/** canton_code → „🇦🇹 Bécs" felirat (országok közt keresve). */
function regionLabel(code: string | null): string {
  if (!code) return "—";
  for (const c of COUNTRIES) {
    const r = getRegions(c.code).find((x) => x.code === code);
    if (r) return `${c.flag} ${r.name}`;
  }
  return code;
}

function fmtDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminJeloltekPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  // Csak az AKTÍV közvetítést kérő jelöltek (layer3_opt_in) — ők kifejezetten
  // hozzájárultak, hogy a Feedback Jobs állást keressen nekik és átadja a CV-t.
  // Szerveroldali keresés + lapozás (több ezernél is gyors).
  const q = (searchParams.q ?? "").trim();
  const pageSize = 30;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const [candidates, total] = await Promise.all([
    getPlacementCandidates({ q, limit: pageSize, offset: (page - 1) * pageSize }),
    countPlacementCandidates({ q }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageHref = (p: number) => `/admin/jeloltek?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) }).toString()}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link href="/admin" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline">
          ← Vissza az Admin dashboardra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Jelöltek (közvetítés)</h1>
        <p className="text-[12.5px] text-ink-muted">
          Az <strong>aktív közvetítést kérő</strong> jelöltek (külön opt-in a Feedback Jobs-hoz). Töltsd le a CV-t, nézd meg a régiót/szakmát, és vedd fel velük a kapcsolatot.
        </p>
      </header>

      <div className="rounded-card border border-dashed border-line bg-surface-alt/50 px-4 py-2.5 text-[11.5px] leading-snug text-ink-muted">
        ⚖️ Csak EU-országokba közvetíts (AT/DE/NL) — Svájc kimarad (SECO-engedély). A jelölttől díjat NEM szedünk, a munkáltató fizet.
      </div>

      {/* Szerveroldali kereső (sima GET-form — JS nélkül is működik) */}
      <form method="get" action="/admin/jeloltek" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="🔎 Keresés névre / e-mailre…"
          className="flex-1 rounded-[12px] border border-line bg-surface-alt px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
        <button type="submit" className="rounded-pill bg-primary px-4 py-2 text-[13px] font-extrabold text-white shadow-card">Keresés</button>
        {q ? <Link href="/admin/jeloltek" className="self-center text-[12px] font-bold text-ink-muted hover:underline">Törlés</Link> : null}
      </form>

      {candidates.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface px-4 py-10 text-center text-[13px] text-ink-muted">
          {q
            ? `Nincs találat erre: „${q}". Próbálj más kifejezést.`
            : `Még nincs aktív közvetítést kérő jelölt. Amint valaki bepipálja az „Aktív állásközvetítés" opciót a CV-feltöltőn, itt megjelenik.`}
        </div>
      ) : (
        <>
          <p className="text-[12px] font-bold text-ink-muted">{total} jelölt{q ? ` · „${q}"` : ""}</p>
          <div className="space-y-2.5">
            {candidates.map((w) => (
              <div key={w.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-extrabold tracking-tight text-ink">{w.fullName}</p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {regionLabel(w.cantonCode)}
                      {w.category ? <> · {jobCategoryLabel(w.category)}</> : null}
                      {w.expectedSalaryMin ? <> · elvárás: {w.expectedSalaryMin.toLocaleString("de-CH")}+</> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <ImportToPipeline workerId={w.id} />
                    {w.cvKey ? (
                      <a
                        href={`/api/admin/candidate-cv/${w.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-pill bg-surface-alt border border-line px-3.5 py-1.5 text-[12px] font-bold text-primary active:scale-95"
                      >
                        CV ↗
                      </a>
                    ) : (
                      <span className="rounded-pill bg-surface-alt px-3 py-1.5 text-[11px] font-bold text-ink-faint">nincs CV</span>
                    )}
                    <RemoveFromPlacement workerId={w.id} />
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold">
                  <a href={`mailto:${w.email}`} className="text-primary hover:underline">✉️ {w.email}</a>
                  {w.phone && <a href={`tel:${w.phone}`} className="text-primary hover:underline">📞 {w.phone}</a>}
                  <span className="text-ink-faint">Frissítve: {fmtDate(w.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
          {total > pageSize && (
            <div className="flex items-center justify-center gap-3 pt-2">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink">‹ Előző</Link>
              ) : (
                <span className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink-faint opacity-40">‹ Előző</span>
              )}
              <span className="text-[12.5px] font-semibold text-ink-muted">{page}. / {totalPages}. oldal</span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink">Következő ›</Link>
              ) : (
                <span className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink-faint opacity-40">Következő ›</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
