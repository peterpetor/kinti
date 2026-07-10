import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui";
import { Sparkline } from "@/components/ui/sparkline";
import { cn } from "@/lib/cn";
import { COUNTRIES, getCountry } from "@/lib/countries";
import { getAdminUserId } from "@/lib/admin";
import { AdminVerifyToggle } from "@/components/views/admin-verify-toggle";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminCopyManageButton } from "@/components/admin/admin-copy-manage-button";
import { ModerationDecideButtons } from "@/components/admin/moderation-decide-buttons";
import { ReindexSearchButton } from "@/components/admin/reindex-search-button";
import {
  getAdminStats,
  getAdminTrends,
  getAiUsageStats,
  getEmailUsageStats,
  getFeatureUsageStats,
  listOpenReports,
  listBusinessesForAdmin,
  listB2bProjectsForAdmin,
  listCvSubmissionsForAdmin,
} from "@/lib/repo";
import { relTimeFromMs } from "@/lib/relative-time";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Admin — kinti", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: { c?: string; p?: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  // Ország-szűrő (admin tab): a tartalom-listák ország szerint, hogy 6 országgal
  // se legyen káosz. "all" = összes ország.
  const country = searchParams?.c && searchParams.c !== "all" ? searchParams.c : "all";
  const countryName = country === "all" ? "összes ország" : getCountry(country)?.name ?? country;
  // Vállalkozás-lista lapozása (100/oldal): ?p=2 → második 100, stb.
  const bizPage = Math.max(1, parseInt(searchParams?.p ?? "1", 10) || 1);

  const [stats, trends, aiUsage, emailUsage, featureUsage, openReports, businesses, b2bProjects, cvSubmissions] =
    await Promise.all([
      getAdminStats(country),
      getAdminTrends(),
      getAiUsageStats(),
      getEmailUsageStats(),
      getFeatureUsageStats(7),
      listOpenReports(),
      listBusinessesForAdmin(country, bizPage),
      listB2bProjectsForAdmin(),
      listCvSubmissionsForAdmin(),
    ]);

  const fmt = (n: number) => n.toLocaleString("hu-HU");
  const emailPct = Math.min(100, Math.round((emailUsage.todayCount / emailUsage.dailyFreeLimit) * 100));
  const emailColor = emailPct >= 90 ? "#c2410c" : emailPct >= 70 ? "#cc7700" : "#2e7d52";
  const FREE_NEURONS_DAY = 10000; // CF ingyenes napi keret (tájékoztató)

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-6">
      <header className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Kinti Admin</p>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Moderációs dashboard</h1>
        <p className="text-[12.5px] text-ink-muted">
          Csak admin email-címek érik el (<code className="text-[11px]">ADMIN_EMAILS</code> env).
        </p>
      </header>

      {/* Ország-szűrő: a country_code-os adatok (vállalkozás, esemény, állás) + listák */}
      <nav className="flex flex-wrap gap-1.5">
        <CountryTab code="all" label="🌍 Mind" active={country === "all"} />
        {COUNTRIES.map((c) => (
          <CountryTab key={c.code} code={c.code} label={`${c.flag} ${c.name}`} active={country === c.code} live={c.enabled} />
        ))}
      </nav>

      {country !== "all" && (
        <p className="-mt-3 text-[11.5px] leading-snug text-ink-faint">
          Az ország-szűrő a <strong className="font-semibold text-ink-muted">vállalkozás · esemény · állás</strong> számokra és a tartalom-listákra hat. A platform-metrikák (vélemény, push, munkaadó, hírlevél, AI, e-mail, használat, trendek) <strong className="font-semibold text-ink-muted">globálisak</strong>.
        </p>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Vállalkozás" value={stats.businesses} sub={`${stats.businessesVerified} verified`} />
        <Stat label="Vélemény" value={stats.reviews} />
        <Stat label="Push" value={stats.pushSubscriptions} sub="feliratkozó" />
        <Stat label="Állás" value={stats.jobs} sub="aktív" />
        <Stat label="Munkaadó" value={stats.employers} />
        <Stat label="Hírlevél" value={stats.digestSubscribersConfirmed} sub="megerősített" />
        <Stat label="Nyitott jelentés" value={openReports.length} accent={openReports.length > 0} />
      </section>

      {/* AI-használat (Workers AI token-fogyás) */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">AI-használat (Workers AI){country !== "all" && <GlobalTag />}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Ma — token" value={aiUsage.todayTokens} sub={`${fmt(aiUsage.todayCalls)} hívás`} accent={aiUsage.todayTokens > 0} />
          <Stat label="7 nap — token" value={aiUsage.last7Tokens} sub={`${fmt(aiUsage.last7Calls)} hívás`} />
        </div>
        {aiUsage.todayByModel.length > 0 ? (
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="px-3 py-2 text-left font-bold">Modell (ma)</th>
                  <th className="px-3 py-2 text-right font-bold">Hívás</th>
                  <th className="px-3 py-2 text-right font-bold">Input</th>
                  <th className="px-3 py-2 text-right font-bold">Output</th>
                  <th className="px-3 py-2 text-right font-bold">Összes token</th>
                </tr>
              </thead>
              <tbody>
                {aiUsage.todayByModel.map((r) => (
                  <tr key={r.model} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2 font-mono text-[11px] text-ink">{r.model.replace("@cf/", "")}</td>
                    <td className="px-3 py-2 text-right text-ink-muted">{fmt(r.calls)}</td>
                    <td className="px-3 py-2 text-right text-ink-muted">{fmt(r.promptTokens)}</td>
                    <td className="px-3 py-2 text-right text-ink-muted">{fmt(r.completionTokens)}</td>
                    <td className="px-3 py-2 text-right font-bold text-ink">{fmt(r.totalTokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[12px] text-ink-muted">Ma még nem volt AI-hívás (vagy a 0077 migráció még nem futott).</p>
        )}
        <p className="text-[11px] text-ink-faint">
          A token app-szintű, becsült/valós érték — a pontos <strong>Neuron-fogyás és számla</strong> a Cloudflare
          dashboard → AI → Workers AI alatt. Tájékoztató: az ingyenes keret kb. <strong>{fmt(FREE_NEURONS_DAY)} Neuron/nap</strong> (≠ token).
        </p>
      </section>

      {/* Email-küldés (Resend napi limit) */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">Email-küldés (Resend){country !== "all" && <GlobalTag />}</h2>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-baseline justify-between">
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">Ma elküldve</span>
            <span className="text-[15px] font-extrabold" style={{ color: emailColor }}>
              {fmt(emailUsage.todayCount)} / {fmt(emailUsage.dailyFreeLimit)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-alt">
            <div className="h-full rounded-full transition-all" style={{ width: `${emailPct}%`, backgroundColor: emailColor }} />
          </div>
          <p className="mt-2 text-[11.5px] text-ink-muted">
            {emailPct >= 90
              ? "⚠️ Majdnem elérted a Resend ingyenes napi limitjét (100/nap) — fontold meg a Resend Pro-t (~$20/hó)."
              : emailPct >= 70
                ? "Közelíted a napi 100-as ingyenes Resend-keretet — tartsd szemmel."
                : `7 nap: ${fmt(emailUsage.last7Count)} email. Az ingyenes keret 100/nap; fölötte a küldés elakadhat.`}
          </p>
        </div>
        <p className="text-[11px] text-ink-faint">
          Csak a sikeres küldések számítanak (megerősítők, lead-ek, digest, admin-értesítők). A 0078 migráció
          aktiválja; addig 0-t mutat.
        </p>
      </section>

      {/* Funkció-használat — melyik modult használják (privacy-first, azonosító nélkül) */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">Funkció-használat (utolsó 7 nap){country !== "all" && <GlobalTag />}</h2>
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          {featureUsage.rows.length === 0 ? (
            <p className="text-[12.5px] text-ink-muted">
              Még nincs adat. A 0079 migráció (db:migrate:remote) aktiválja; utána itt látszik, melyik
              funkciót használják valójában.
            </p>
          ) : (
            <ul className="space-y-2">
              {featureUsage.rows.map((r) => {
                const maxCount = featureUsage.rows[0]?.count ?? 1;
                const w = Math.max(4, Math.round((r.count / maxCount) * 100));
                const label = r.event.replace(/^page:/, "📄 ").replace(/^action:/, "⚡ ");
                return (
                  <li key={r.event}>
                    <div className="flex items-baseline justify-between text-[12.5px]">
                      <span className="font-semibold text-ink">{label}</span>
                      <span className="font-bold text-ink-muted">{fmt(r.count)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-alt">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="text-[11px] text-ink-faint">
          Aggregált, azonosító nélküli (nincs cookie/IP) — sessionönként egyszer/oldal. A legritkábban használt
          funkciókat érdemes összevonni vagy archiválni.
        </p>
      </section>

      {/* Trendek — utolsó 14 nap */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">Trendek (utolsó 14 nap){country !== "all" && <GlobalTag />}</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <TrendCard
            label="Új vállalkozás"
            data={trends.businessRegistrations}
            total7d={trends.newBusinesses7d}
          />
          <TrendCard
            label="Benchmark-beküldés"
            data={trends.benchmarkSubmissions}
            total7d={trends.newBenchmark7d}
            sub="bér + lakbér"
          />
          <TrendCard
            label="Aktív beküldő"
            data={trends.activeContributors}
            total7d={trends.activeContributors7d}
            sub="egyedi IP / 7 nap"
          />
        </div>
        <p className="text-[11px] leading-snug text-ink-faint">
          Az „aktív beküldő" a fő közreműködési táblák (benchmark, vállalkozás-beküldés, vélemény) egyedi
          IP-hash-eit számolja naponta — account/azonosító nincs, így ez a beküldői aktivitás proxyja (nem a
          passzív olvasóké).
        </p>
      </section>

      {/* Open reports */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Folyamatban lévő jelentések ({openReports.length})
        </h2>
        {openReports.length === 0 ? (
          <Empty label="Nincs nyitott jelentés. 🎉" />
        ) : (
          <div className="space-y-2">
            {openReports.map((r) => (
              <div key={r.id} className="rounded-card border border-line bg-surface p-3 shadow-card">
                <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
                  <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-accent">{r.contentType}</span>
                  <span className="text-ink-faint">{fmtAgo(r.createdAt)}</span>
                </div>
                {r.excerpt && (
                  <p className="mt-1.5 text-[13px] font-semibold text-ink truncate">{r.excerpt}</p>
                )}
                {r.reason && (
                  <p className="mt-1 text-[12px] italic text-ink-muted">„{r.reason}"</p>
                )}
                <div className="mt-2 flex gap-2">
                  <a
                    href={`/api/report/moderate/${r.moderateToken}?action=keep`}
                    className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface-alt px-3 py-1 text-[11.5px] font-bold text-ink"
                  >
                    ↩︎ Visszaállítás
                  </a>
                  <a
                    href={`/api/report/moderate/${r.moderateToken}?action=remove`}
                    className="inline-flex items-center gap-1 rounded-pill bg-accent px-3 py-1 text-[11.5px] font-bold text-white"
                  >
                    🗑 Törlés
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* B2B projektpiac — moderáció: a zárt feed posztjai admin-szemmel (rejtett/
          függő cégé is), törlés-gombbal. A feed maga csak jóváhagyott cég posztját
          mutatja; itt a problémás tartalom is látszik és eltávolítható. */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          B2B projektpiac ({b2bProjects.length})
        </h2>
        {b2bProjects.length === 0 ? (
          <Empty label="Nincs B2B projekt." />
        ) : (
          <div className="space-y-1.5">
            {b2bProjects.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 shadow-card">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide"
                      style={p.status === "open"
                        ? { backgroundColor: "#dcfce7", color: "#15803d" }
                        : { backgroundColor: "#f1f5f9", color: "#64748b" }}
                    >
                      {p.status === "open" ? "Nyitott" : "Lezárt"}
                    </span>
                    <span className="truncate text-[13px] font-bold text-ink">{p.title}</span>
                  </div>
                  <p className="truncate text-[11px] text-ink-muted">
                    {p.businessName ?? "⚠️ törölt cég"} · {getCountry(p.targetCountry)?.flag ?? ""} {p.targetCity ?? p.targetCountry} · {relTimeFromMs(p.createdAt)}
                  </p>
                </div>
                <AdminDeleteButton
                  type="b2b"
                  id={p.id}
                  small
                  confirmText={`Biztos törlöd a(z) "${p.title}" B2B projektet? Ez nem visszavonható.`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Önéletrajz-profilok — a Német CV-készítőből hozzájárulással mentett jelöltek
          (közvetítési lead). PII → GDPR-törlés gombbal. */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Önéletrajz-profilok (CV-lead) ({cvSubmissions.length})
        </h2>
        {cvSubmissions.length === 0 ? (
          <Empty label="Nincs mentett önéletrajz-profil." />
        ) : (
          <div className="space-y-1.5">
            {cvSubmissions.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 shadow-card">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-ink">
                    {c.fullName}
                    {c.professionDe ? <span className="font-normal text-ink-muted"> · {c.professionDe}</span> : null}
                  </p>
                  <p className="truncate text-[11px] text-ink-muted">
                    {[c.city, c.yearsExperience != null ? `${c.yearsExperience} év tap.` : null, c.email, c.phone]
                      .filter(Boolean)
                      .join(" · ")} · {fmtAgo(c.createdAt)}
                  </p>
                </div>
                <AdminDeleteButton
                  type="cv"
                  id={c.id}
                  small
                  confirmText={`Törlöd a(z) "${c.fullName}" mentett önéletrajz-profilját? (GDPR törlés)`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Businesses + verify toggle + delete — lapozva (100/oldal) */}
      <section className="space-y-2">
        <h2 className="text-[14px] font-extrabold text-ink">
          Vállalkozások — Verified + törlés ({businesses.total}) · {countryName}
          {businesses.pages > 1 && (
            <span className="ml-1.5 text-[11.5px] font-semibold text-ink-muted">
              · {(businesses.page - 1) * 100 + 1}–{Math.min(businesses.page * 100, businesses.total)}. ({businesses.page}/{businesses.pages}. oldal)
            </span>
          )}
        </h2>
        {businesses.rows.length === 0 ? (
          <Empty label="Nincs vállalkozás a Szaknévsorban." />
        ) : (
          <div className="space-y-1.5">
            {businesses.rows.map((b) => {
              const st =
                b.moderationStatus === 1
                  ? { label: "Jóváhagyva", bg: "#dcfce7", fg: "#15803d", border: "#22c55e" }
                  : b.moderationStatus === 2
                    ? { label: "Elutasítva", bg: "#f1f5f9", fg: "#64748b", border: "#cbd5e1" }
                    : { label: "Függőben", bg: "#fef3c7", fg: "#b45309", border: "#f59e0b" };
              return (
              <div
                key={b.id}
                className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 shadow-card"
                style={{ borderLeft: `4px solid ${st.border}` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide"
                      style={{ backgroundColor: st.bg, color: st.fg }}
                    >
                      {st.label}
                    </span>
                    <Link href={`/szaknevsor/${b.id}`} className="truncate text-[13px] font-bold text-ink hover:text-primary">
                      {b.name}
                    </Link>
                  </div>
                  <p className="truncate text-[11px] text-ink-muted">
                    {b.categoryLabel ?? "—"}
                    {b.source ? ` · ${b.source}` : ""}
                    {b.rating > 0 ? ` · ⭐ ${b.rating} (${b.reviews})` : ""}
                  </p>
                </div>
                <ModerationDecideButtons
                  table="businesses"
                  id={b.id}
                  current={b.moderationStatus}
                  submitterIpHash={null}
                  submitterEmail={null}
                />
                <AdminVerifyToggle businessId={b.id} initial={b.verified} />
                <AdminCopyManageButton type="businesses" manageToken={b.manageToken} />
                <AdminDeleteButton
                  type="businesses"
                  id={b.id}
                  small
                  confirmText={`Biztos törlöd a(z) "${b.name}" vállalkozást? A vélemények is törlődnek.`}
                />
              </div>
              );
            })}
          </div>
        )}
        <Pager current={businesses.page} pages={businesses.pages} country={country} />
      </section>


      {/* Egyéb admin linkek */}
      <section className="space-y-2 border-t border-line pt-4">
        <h2 className="text-[14px] font-extrabold text-ink">Egyéb admin</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/moderation"
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12px] font-extrabold text-white shadow-card"
          >
            🛡️ Moderációs sor (kézi jóváhagyás)
          </Link>
          <Link
            href="/admin/job-board"
            className="inline-flex items-center gap-1.5 rounded-pill bg-success px-4 py-2 text-[12px] font-extrabold text-white shadow-card"
          >
            💼 Állásportál moderáció
          </Link>
          <Link
            href="/admin/jeloltek"
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12px] font-extrabold text-white shadow-card"
          >
            🤝 Jelöltek (közvetítés)
          </Link>
          <Link
            href="/admin/kozvetites"
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12px] font-extrabold text-white shadow-card"
          >
            🔎 Közvetítő-kereső
          </Link>
          <Link
            href="/admin/blocklist"
            className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-[12px] font-extrabold text-white shadow-card"
          >
            🚫 Tiltólista (ban)
          </Link>

          <Link
            href="/admin/claims"
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink"
          >
            <Icon name="flag" size={13} strokeWidth={2.4} /> Claim-igénylések
          </Link>
          <Link
            href="/admin/newsletter"
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink"
          >
            <Icon name="send" size={13} strokeWidth={2.4} /> Hírlevél küldése
          </Link>
          <Link
            href="/admin/moderation/audit-log"
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink"
          >
            📋 Audit log (idővonal)
          </Link>
          {/* Szemantikus kereső: teljes Vectorize-újraindexelés (seed-import után kell) */}
          <ReindexSearchButton />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-card border bg-surface p-3 shadow-card ${accent ? "border-accent/40" : "border-line"}`}>
      <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className={`mt-0.5 text-[22px] font-extrabold tracking-tight ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
      {sub && <p className="text-[11px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function TrendCard({ label, data, total7d, sub }: { label: string; data: number[]; total7d: number; sub?: string }) {
  const max = Math.max(...data, 0);
  return (
    <div className="rounded-card border border-line bg-surface p-3 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
        <span className="text-[11px] font-bold text-ink-faint">csúcs: {max}</span>
      </div>
      <p className="mt-0.5 text-[22px] font-extrabold tracking-tight text-ink">
        {total7d}
        <span className="ml-1 text-[11px] font-bold text-ink-faint">/ 7 nap{sub ? ` · ${sub}` : ""}</span>
      </p>
      <div className="mt-1.5">
        {max > 0 ? (
          <Sparkline data={data} height={48} />
        ) : (
          <p className="py-3 text-center text-[11px] text-ink-faint">Nincs adat az időszakban.</p>
        )}
      </div>
    </div>
  );
}

/** Jelzi, hogy egy szekció platform-szintű (nincs ország-dimenziója → az ország-szűrő nem hat rá). */
function GlobalTag() {
  return (
    <span className="ml-2 align-middle rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-faint">
      🌍 globális
    </span>
  );
}

/** Lapozó a vállalkozás-listához (100/oldal) — az ország-szűrőt megtartja. */
function Pager({ current, pages, country }: { current: number; pages: number; country: string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Vállalkozás-lista lapozás" className="flex flex-wrap items-center gap-1.5 pt-1">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={`/admin?c=${country}&p=${n}`}
          aria-current={n === current ? "page" : undefined}
          className={cn(
            "inline-flex min-w-[36px] items-center justify-center rounded-pill px-3 py-1.5 text-[12px] font-bold transition",
            n === current
              ? "bg-primary text-white shadow-card"
              : "border border-line bg-surface text-ink hover:bg-surface-alt",
          )}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}

function CountryTab({ code, label, active, live = true }: { code: string; label: string; active: boolean; live?: boolean }) {
  return (
    <Link
      href={`/admin?c=${code}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-[12px] font-bold transition",
        active
          ? "bg-primary text-white shadow-card"
          : "border border-line bg-surface text-ink hover:bg-surface-alt",
        !live && !active && "opacity-55",
      )}
      title={live ? undefined : "Még nem élő ország (tartalom-szűrőként már használható)"}
    >
      {label}
    </Link>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-6 text-center text-[12.5px] text-ink-muted">
      {label}
    </div>
  );
}

function fmtAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")).getTime();
  if (Number.isNaN(diffMs)) return iso;
  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `${min}p`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}n`;
}
