import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { getUnclaimedBusinesses, countUnclaimedBusinesses } from "@/lib/repo";
import { COUNTRIES } from "@/lib/countries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Átvételre vár — Kinti Admin",
  robots: { index: false, follow: false },
};

const MESSAGE_TEMPLATE = `Szia! Rád találtam a Kinti magyar szaknévsorában — a profilod már fent van, ingyen (nem én tettem fel, egy nyilvános forrásból került be). Ha szeretnéd, 2 perc alatt átveheted és kiegészítheted (fotó, nyitvatartás, weboldal): {profil_link}
Ha nem érdekel, bátran hagyd figyelmen kívül — a profil enélkül is látszik.`;

export default async function AdminUnclaimedPage({
  searchParams,
}: {
  searchParams: { q?: string; country?: string; page?: string };
}) {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const q = (searchParams.q ?? "").trim();
  const country = (searchParams.country ?? "").trim();
  const pageSize = 40;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const [rows, total] = await Promise.all([
    getUnclaimedBusinesses({ q, country: country || undefined, limit: pageSize, offset: (page - 1) * pageSize }),
    countUnclaimedBusinesses({ q, country: country || undefined }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const qs = (p: number) =>
    new URLSearchParams({ ...(q ? { q } : {}), ...(country ? { country } : {}), page: String(p) }).toString();
  const csvHref = `/api/admin/unclaimed-export?${new URLSearchParams({ ...(q ? { q } : {}), ...(country ? { country } : {}) }).toString()}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link href="/admin" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline">
          ← Vissza az Admin dashboardra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Átvételre vár</h1>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          Még nem foglalt (<code>claimed=0</code>), DE telefonszámmal elérhető cégek — a piacra lépési
          terv legolcsóbb, legmelegebb lead-forrása. Minden profil élőben látszik, csak a tulajdonos
          nem vette még át; egy személyes megkeresés a legjobb konverziós út.
        </p>
      </header>

      <details className="rounded-card border border-dashed border-line bg-surface-alt/50 px-4 py-3 text-[12.5px] text-ink-muted">
        <summary className="cursor-pointer font-bold text-ink">📋 Másolható megkereső-üzenet minta</summary>
        <p className="mt-2 whitespace-pre-line rounded-[10px] bg-surface p-3 text-[12px] leading-relaxed text-ink">
          {MESSAGE_TEMPLATE}
        </p>
        <p className="mt-1.5 text-[11px] text-ink-faint">
          {"{profil_link}"} = a lenti lista "Profil ↗" linkje az adott cégnél.
        </p>
      </details>

      <form method="get" action="/admin/atvetelre-var" className="flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="🔎 Keresés névre / kategóriára…"
          className="min-w-0 flex-1 rounded-[12px] border border-line bg-surface-alt px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
        <select
          name="country"
          defaultValue={country}
          className="rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[13px] font-bold text-ink focus:border-primary focus:outline-none"
        >
          <option value="">Minden ország</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded-pill bg-primary px-4 py-2 text-[13px] font-extrabold text-white shadow-card">Keresés</button>
        {(q || country) && (
          <Link href="/admin/atvetelre-var" className="self-center text-[12px] font-bold text-ink-muted hover:underline">Törlés</Link>
        )}
        <a
          href={csvHref}
          className="ml-auto inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-primary shadow-card"
        >
          ⬇ CSV export ({total})
        </a>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface px-4 py-10 text-center text-[13px] text-ink-muted">
          Nincs találat erre a szűrésre.
        </div>
      ) : (
        <>
          <p className="text-[12px] font-bold text-ink-muted">{total} átvételre váró cég{q ? ` · „${q}"` : ""}{country ? ` · ${country}` : ""}</p>
          <div className="space-y-2">
            {rows.map((b) => {
              const bizCountry = COUNTRIES.find((c) => c.code === b.countryCode);
              return (
                <div key={b.id} className="rounded-card border border-line bg-surface p-3.5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-extrabold tracking-tight text-ink">
                        {bizCountry?.flag ?? ""} {b.name}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                        {b.categoryLabel ?? "—"}{b.address ? ` · ${b.address}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/szaknevsor/${b.id}`}
                      target="_blank"
                      className="shrink-0 rounded-pill bg-surface-alt border border-line px-3 py-1.5 text-[12px] font-bold text-primary active:scale-95"
                    >
                      Profil ↗
                    </Link>
                  </div>
                  <a href={`tel:${b.phone.replace(/\s+/g, "")}`} className="mt-2 inline-block text-[12.5px] font-semibold text-primary hover:underline">
                    📞 {b.phone}
                  </a>
                </div>
              );
            })}
          </div>
          {total > pageSize && (
            <div className="flex items-center justify-center gap-3 pt-2">
              {page > 1 ? (
                <Link href={`/admin/atvetelre-var?${qs(page - 1)}`} className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink">‹ Előző</Link>
              ) : (
                <span className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink-faint opacity-40">‹ Előző</span>
              )}
              <span className="text-[12.5px] font-semibold text-ink-muted">{page}. / {totalPages}. oldal</span>
              {page < totalPages ? (
                <Link href={`/admin/atvetelre-var?${qs(page + 1)}`} className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink">Következő ›</Link>
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
