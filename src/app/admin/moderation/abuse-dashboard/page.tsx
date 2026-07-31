import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { listContentReports, type AdminContentReport } from "@/lib/repo-spam";
import { listCorrections } from "@/lib/repo-corrections";
import { CORRECTION_FIELD_LABELS, type CorrectionField } from "@/lib/correction-fields";
import { RestoreReporterButton } from "@/components/admin/restore-reporter-button";
import { CorrectionResolveButtons } from "@/components/admin/correction-resolve-buttons";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bejelentések — Kinti Admin",
  robots: { index: false, follow: false },
};

/**
 * Bejelentés-áttekintő.
 *
 * ⚠️ MIÉRT LÉTEZIK: a bejelentés AZONNAL elrejti a tartalmat (DSA Art. 16,
 * notice-and-action) — ezt a szabályt szándékosan nem gyengítettük. Korábban
 * viszont CSAK bejelentésenként ment egy e-mail, áttekintő nélkül: egy 50-es
 * rosszhiszemű kampány 50 különálló, összefüggés nélküli levélként érkezett
 * volna, miközben 50 vállalkozás rejtve van. Ez az oldal teszi láthatóvá a
 * MINTÁZATOT (ki jelentett sokat), és ad hozzá egykattintásos tömeges
 * visszaállítást.
 *
 * ⚠️ Az `/api/report` végponton három védelmi réteg van (Turnstile, per-IP órás
 * korlát, automatikus-rejtés küszöbe) — ld. tests/unit/report-abuse-guard.test.ts.
 */

interface ReporterGroup {
  ipHash: string;
  reports: AdminContentReport[];
}

const TYPE_LABELS: Record<string, string> = {
  business: "Vállalkozás",
  review: "Vélemény",
  sos: "Segítségkérés",
  b2b: "B2B projekt",
  story: "Élettörténet",
  request: "Igény (Keresek)",
  housing: "Lakáshirdetés",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Nyitott",
  kept: "Visszaállítva",
  removed: "Törölve",
};


/** A bejelentett tartalom publikus útvonala, ahol van ilyen. */
function contentHref(r: AdminContentReport): string | null {
  if (r.contentType === "business") return `/szaknevsor/${r.contentId}`;
  if (r.contentType === "story") return `/elettortenetek/${r.contentId}`;
  return null;
}

/** A D1 `datetime()` "YYYY-MM-DD HH:MM:SS" alakot ad, UTC-ben. */
function parseWhen(iso: string): number {
  return new Date(iso.replace(" ", "T") + "Z").getTime();
}

function formatWhen(iso: string): string {
  const t = parseWhen(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString("hu-HU", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReportsOverviewPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const [open, recent, corrections] = await Promise.all([
    listContentReports({ status: "open", limit: 500 }),
    listContentReports({ status: "all", limit: 100 }),
    listCorrections({ status: "open", limit: 100 }),
  ]);

  // Bejelentőnkénti csoportosítás — a kampány-mintázat ITT válik láthatóvá.
  const byReporter = new Map<string, AdminContentReport[]>();
  for (const r of open) {
    if (!r.reporterIpHash) continue;
    const list = byReporter.get(r.reporterIpHash) ?? [];
    list.push(r);
    byReporter.set(r.reporterIpHash, list);
  }
  const groups: ReporterGroup[] = [...byReporter.entries()]
    .map(([ipHash, reports]) => ({ ipHash, reports }))
    .filter((g) => g.reports.length >= 2)
    .sort((a, b) => b.reports.length - a.reports.length);

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = recent.filter((r) => {
    const t = parseWhen(r.createdAt);
    return !Number.isNaN(t) && t >= dayAgo;
  }).length;

  const biggestGroup = groups[0]?.reports.length ?? 0;

  const stats = [
    { label: "Nyitott bejelentés", value: String(open.length) },
    { label: "Nyitott javaslat", value: String(corrections.length) },
    { label: "Elmúlt 24 óra", value: String(last24h) },
    { label: "Egyedi bejelentő", value: String(byReporter.size) },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link
          href="/admin/moderation"
          className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline"
        >
          ← Vissza a moderációra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Bejelentések</h1>
        <p className="text-[12.5px] text-ink-muted">
          Ki mit jelentett be, és mi rejtőzött el emiatt. A bejelentés azonnal rejt — itt egy
          kattintással vissza is állítható.
        </p>
      </header>

      {/* Kampány-figyelmeztetés — csak akkor, ha van valódi jel. */}
      {biggestGroup >= 3 && (
        <div className="rounded-card border border-accent bg-accent-soft/20 p-4">
          <p className="text-[13px] font-bold text-ink">🚨 Lehetséges tömeges bejelentés</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Egy bejelentőtől {biggestGroup} nyitott bejelentés érkezett. Ha rosszhiszemű
            kampányról van szó, alább egy kattintással mindet visszaállíthatod.
          </p>
        </div>
      )}

      {/* Számok */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-line bg-surface p-3 shadow-card">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {s.label}
            </div>
            <div className="text-2xl font-black text-ink">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sokat jelentő bejelentők — tömeges visszaállítással */}
      {groups.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Több bejelentést tett bejelentők · {groups.length} db
          </h2>
          {groups.map((g) => (
            <div key={g.ipHash} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[12px] text-ink">{g.ipHash.slice(0, 12)}…</div>
                  <div className="text-[12px] text-ink-muted">
                    {g.reports.length} nyitott bejelentés · legutóbb {formatWhen(g.reports[0].createdAt)}
                  </div>
                </div>
                <RestoreReporterButton reporterIpHash={g.ipHash} count={g.reports.length} />
              </div>
              <ul className="mt-3 space-y-1 border-t border-line pt-3">
                {g.reports.slice(0, 8).map((r) => (
                  <li key={r.id} className="text-[12px] text-ink-muted">
                    <span className="font-semibold text-ink">
                      {TYPE_LABELS[r.contentType] ?? r.contentType}
                    </span>{" "}
                    · {r.contentId}
                  </li>
                ))}
                {g.reports.length > 8 && (
                  <li className="text-[12px] text-ink-faint">
                    …és további {g.reports.length - 8} tétel
                  </li>
                )}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* „Javíts rajta" javaslatok — NEM rejtenek el semmit, csak sorban állnak.
          ⚠️ Az adatot az admin a cég-szerkesztőn vezeti át; itt csak lezárjuk a
          javaslatot. Nincs „egy kattintással beírom" út, mert az egy nyílt
          űrlapról érkező értéket tenne ellenőrzés nélkül a szaknévsorba. */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Adatjavítási javaslatok · {corrections.length} db
        </h2>
        {corrections.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-4 text-center shadow-card">
            <p className="text-[12.5px] text-ink-muted">Nincs nyitott javaslat.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {corrections.map((c) => (
              <li key={c.id} className="rounded-card border border-line bg-surface p-3 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                    {CORRECTION_FIELD_LABELS[c.field as CorrectionField] ?? c.field}
                  </span>
                  <span className="text-[11px] text-ink-faint">{formatWhen(c.createdAt)}</span>
                </div>
                <div className="mt-1.5 text-[12.5px]">
                  <Link
                    href={`/szaknevsor/${c.businessId}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    {c.businessId}
                  </Link>
                </div>
                {c.suggestion && (
                  <p className="mt-1 text-[12.5px] text-ink">
                    Javasolt érték: <span className="font-semibold">{c.suggestion}</span>
                  </p>
                )}
                {c.note && <p className="mt-0.5 text-[12.5px] text-ink-muted">„{c.note}”</p>}
                <CorrectionResolveButtons id={c.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Teljes lista */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Legutóbbi bejelentések · {recent.length} db
        </h2>
        {recent.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
            <p className="text-[13px] text-ink-muted">Még nem érkezett bejelentés.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => {
              const href = contentHref(r);
              return (
                <li key={r.id} className="rounded-card border border-line bg-surface p-3 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                      {TYPE_LABELS[r.contentType] ?? r.contentType}
                    </span>
                    <span
                      className={
                        r.status === "open"
                          ? "rounded-pill bg-accent-soft/30 px-2 py-0.5 text-[11px] font-bold text-ink"
                          : "rounded-pill bg-surface-alt px-2 py-0.5 text-[11px] font-bold text-ink-muted"
                      }
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    <span className="text-[11px] text-ink-faint">{formatWhen(r.createdAt)}</span>
                  </div>
                  <div className="mt-1.5 text-[12.5px] text-ink">
                    {href ? (
                      <Link href={href} className="font-semibold text-accent hover:underline">
                        {r.contentId}
                      </Link>
                    ) : (
                      <span className="font-mono text-[12px]">{r.contentId}</span>
                    )}
                  </div>
                  {r.reason && (
                    <p className="mt-1 text-[12.5px] text-ink-muted">
                      „{r.reason.length > 200 ? r.reason.slice(0, 200) + "…" : r.reason}”
                    </p>
                  )}
                  {r.status === "open" && (
                    <div className="mt-2 flex gap-2">
                      <a
                        href={`/api/report/moderate/${r.moderateToken}?action=keep`}
                        className="rounded-pill border border-line bg-surface px-3 py-1 text-[11px] font-bold text-ink-muted"
                      >
                        ↩ Visszaállítás
                      </a>
                      <a
                        href={`/api/report/moderate/${r.moderateToken}?action=remove`}
                        className="rounded-pill border border-line bg-surface px-3 py-1 text-[11px] font-bold text-ink-muted"
                      >
                        🗑 Végleges törlés
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
