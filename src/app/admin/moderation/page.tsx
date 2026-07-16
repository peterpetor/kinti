import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/cn";
import { COUNTRIES, getCountry } from "@/lib/countries";
import { getAdminUserId } from "@/lib/admin";
import { relTimeFromIso } from "@/lib/relative-time";
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
  service_requests: "Keresések",
  stories: "Élettörténetek",
  kinti_housing_listings: "Albérlet-hirdetések",
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
  c?: string;
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

  // Ország-szűrő (a vállalkozás/esemény táblákra; a vélemény nem ország-szűrhető).
  const country = searchParams?.c && searchParams.c !== "all" ? searchParams.c : "all";
  const countryName = country === "all" ? "összes ország" : getCountry(country)?.name ?? country;

  // Számlálók minden táblára (csak pending) — a tab-okon való gyorsbadge.
  const [
    pendingReviews,
    pendingBusinesses,
    pendingRequests,
    pendingStories,
    pendingHousing,
    items,
  ] = await Promise.all([
    moderationCount("reviews", 0),
    moderationCount("businesses", 0, country),
    moderationCount("service_requests", 0, country),
    moderationCount("stories", 0, country),
    moderationCount("kinti_housing_listings", 0, country),
    listModerationQueue(typeParam, statusValue, 100, country),
  ]);

  const pendingPerType: Record<ModerationTable, number> = {
    reviews: pendingReviews,
    businesses: pendingBusinesses,
    service_requests: pendingRequests,
    stories: pendingStories,
    kinti_housing_listings: pendingHousing,
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
          Akciók automatikusan élesednek.
        </p>
      </header>

      {/* Tab: status */}
      <div className="flex gap-1 rounded-pill border border-line bg-surface p-1">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/moderation?status=${s}&type=${typeParam}&c=${country}`}
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
              href={`/admin/moderation?status=${statusParam}&type=${t}&c=${country}`}
              className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[11.5px] font-bold transition ${
                typeParam === t
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-surface text-ink-muted hover:bg-surface-alt"
              }`}
            >
              {TABLE_LABELS[t]}
              {pending > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10.5px] font-extrabold text-white">
                  {pending}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Ország-szűrő (a vállalkozás/esemény táblákra — a vélemény nem ország-szűrhető) */}
      {typeParam !== "reviews" && (
        <div className="flex flex-wrap gap-1.5">
          <CountryTab code="all" label="🌍 Mind" active={country === "all"} status={statusParam} type={typeParam} />
          {COUNTRIES.map((c) => (
            <CountryTab key={c.code} code={c.code} label={`${c.flag} ${c.code}`} active={country === c.code} live={c.enabled} status={statusParam} type={typeParam} />
          ))}
        </div>
      )}

      {/* Audit Log & Abuse Dashboard Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/moderation/audit-log"
          className="rounded-card border border-line bg-surface p-4 shadow-card transition hover:bg-surface-alt"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            📋 Audit Log
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">Admin döntések naplója</div>
        </Link>
        <Link
          href="/admin/moderation/abuse-dashboard"
          className="rounded-card border border-line bg-surface p-4 shadow-card transition hover:bg-surface-alt"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            📊 Abuse Dashboard
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">Rate limits & patterns</div>
        </Link>
      </div>

      {/* Lista */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          {STATUS_LABELS[statusParam]} {TABLE_LABELS[typeParam].toLowerCase()}
          {typeParam !== "reviews" ? ` · ${countryName}` : ""} · {items.length} db
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
                      <p className="mt-1 text-[11.5px] text-ink-faint">
                        {it.submitterEmail && (
                          <>📧 {it.submitterEmail} · </>
                        )}
                        {it.createdAt && <>{relTimeFromIso(it.createdAt)}</>}
                        {statusParam !== "pending" && it.moderationDecisionAt && (
                          <>
                            {" · "}
                            <span className="italic">
                              döntve: {relTimeFromIso(it.moderationDecisionAt)}
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
                      className="text-[11.5px] font-bold text-ink-muted hover:text-primary"
                    >
                      ↗ Megnyitás új tab-ban
                    </Link>
                    <ModerationDecideButtons
                      table={typeParam}
                      id={it.id}
                      current={it.moderationStatus}
                      submitterIpHash={it.submitterIpHash}
                      submitterEmail={it.submitterEmail}
                      // Elutasításnál indok-mező (DSA Art. 17): a beküldő emailben
                      // kapja az indokot, ha van email-elérhetősége (történet:
                      // contactEmail; cég: kapcsolati email; Keresek: email-formájú
                      // kontakt). A housing-nál a kártyán van in-app indoklás.
                      askRejectReason={
                        typeParam === "stories" || typeParam === "businesses" || typeParam === "service_requests"
                      }
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

function CountryTab({ code, label, active, status, type, live = true }: { code: string; label: string; active: boolean; status: string; type: string; live?: boolean }) {
  return (
    <Link
      href={`/admin/moderation?status=${status}&type=${type}&c=${code}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-[11.5px] font-bold transition",
        active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink hover:bg-surface-alt",
        !live && !active && "opacity-55",
      )}
    >
      {label}
    </Link>
  );
}

function previewLink(table: ModerationTable, id: string): string {
  switch (table) {
    case "businesses":
      return `/szaknevsor/${id}`;
    case "reviews":
      return `/admin/moderation`; // vélemények csak a profil-page-en jelennek meg
    case "service_requests":
      return `/keresek`;
    case "stories":
      // A történet-oldal id-vel is felold, de NEM-publikáltat csak adminnak
      // mutat (teljes szöveg a döntés előtt — „én ellenőrzöm mindet" flow).
      return `/tortenetek/${id}`;
    case "kinti_housing_listings":
      // Jóváhagyott hirdetésnél a mély-link odagörget + kiemel; pending a
      // publikus börzén nem látszik (ott a queue-preview elegendő a döntéshez),
      // ilyenkor a link egyszerűen a Piactéren landol.
      return `/piacter?hirdetes=${id}`;
  }
}

