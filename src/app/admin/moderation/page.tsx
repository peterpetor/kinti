import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import {
  listModerationQueue,
  moderationCount,
  type ModerationTable,
} from "@/lib/repo";
import { ModerationDecideButtons } from "@/components/admin/moderation-decide-buttons";
import { mediaUrl } from "@/lib/media";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Moderáció — Kinti Admin",
  robots: { index: false, follow: false },
};

const TABLE_LABELS: Record<ModerationTable, string> = {
  reviews: "Vélemények",
  businesses: "Vállalkozások",
  events: "Események",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Beérkezett",
  approved: "Elfogadott",
  rejected: "Elutasított",
};

const STATUS_VALUES: Record<string, 0 | 1 | 2> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

type SearchParams = {
  status?: string;
  type?: string;
};

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const statusParam =
    searchParams.status && STATUS_VALUES[searchParams.status] !== undefined
      ? searchParams.status
      : "pending";
  const statusValue = STATUS_VALUES[statusParam];

  const typeParam =
    searchParams.type && TABLE_LABELS[searchParams.type as ModerationTable]
      ? (searchParams.type as ModerationTable)
      : "reviews";

  // Számlálók minden táblára (csak pending) — a tab-okon való gyorsbadge.
  const [
    pendingReviews,
    pendingBusinesses,
    pendingEvents,
    items,
  ] = await Promise.all([
    moderationCount("reviews", 0),
    moderationCount("businesses", 0),
    moderationCount("events", 0),
    listModerationQueue(typeParam, statusValue, 100),
  ]);

  const pendingPerType: Record<ModerationTable, number> = {
    reviews: pendingReviews,
    businesses: pendingBusinesses,
    events: pendingEvents,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link
          href="/admin"
          className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline"
        >
          ← Vissza az Admin dashboardra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
          Moderációs sor
        </h1>
        <p className="text-[12.5px] text-ink-muted">
          Minden új vélemény, vállalkozás és esemény admin-jóváhagyásra vár.
          Spontán találkozók, Hofladen-térkép és Akciók automatikusan élesednek.
        </p>
      </header>

      {/* Tab: status */}
      <div className="flex gap-1 rounded-pill border border-line bg-surface p-1">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/moderation?status=${s}&type=${typeParam}`}
            className={`flex-1 rounded-pill px-3 py-1.5 text-center text-[12px] font-bold transition ${
              statusParam === s
                ? "bg-primary text-white shadow-card"
                : "text-ink-muted hover:bg-surface-alt"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Tab: type */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(TABLE_LABELS) as ModerationTable[]).map((t) => {
          const pending = pendingPerType[t];
          return (
            <Link
              key={t}
              href={`/admin/moderation?status=${statusParam}&type=${t}`}
              className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[11.5px] font-bold transition ${
                typeParam === t
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-surface text-ink-muted hover:bg-surface-alt"
              }`}
            >
              {TABLE_LABELS[t]}
              {pending > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                  {pending}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          {STATUS_LABELS[statusParam]} {TABLE_LABELS[typeParam].toLowerCase()} ·{" "}
          {items.length} db
        </p>

        {items.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-10 text-center text-[12.5px] text-ink-muted">
            Nincs ilyen tétel.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const imageUrl = it.imageKey ? mediaUrl(it.imageKey) : null;
              return (
                <article
                  key={it.id}
                  className="rounded-card border border-line bg-surface p-3 shadow-card"
                >
                  <div className="flex gap-3">
                    {imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-[10px] object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-extrabold text-ink">
                        {it.title || "(cím nélkül)"}
                      </p>
                      {it.preview && (
                        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-ink-muted">
                          {it.preview}
                        </p>
                      )}
                      <p className="mt-1 text-[10.5px] text-ink-faint">
                        {it.submitterEmail && (
                          <>📧 {it.submitterEmail} · </>
                        )}
                        {it.createdAt && <>{fmtAgo(it.createdAt)}</>}
                        {statusParam !== "pending" && it.moderationDecisionAt && (
                          <>
                            {" · "}
                            <span className="italic">
                              döntve: {fmtAgo(it.moderationDecisionAt)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-line/60 pt-2">
                    <Link
                      href={previewLink(typeParam, it.id)}
                      target="_blank"
                      className="text-[10.5px] font-bold text-ink-muted hover:text-primary"
                    >
                      ↗ Megnyitás új tab-ban
                    </Link>
                    <ModerationDecideButtons
                      table={typeParam}
                      id={it.id}
                      current={it.moderationStatus}
                      submitterIpHash={it.submitterIpHash}
                      submitterEmail={it.submitterEmail}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function previewLink(table: ModerationTable, id: string): string {
  switch (table) {
    case "businesses":
      return `/szaknevsor/${id}`;
    case "events":
      return `/kozosseg/esemeny/${id}`;
    case "reviews":
      return `/admin/moderation`; // vélemények csak a profil-page-en jelennek meg
  }
}

function fmtAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(
    iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"),
  ).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} perce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} órája`;
  return `${Math.floor(h / 24)} napja`;
}
