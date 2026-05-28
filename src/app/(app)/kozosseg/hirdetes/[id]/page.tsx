import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui";
import { getBulletinPostById } from "@/lib/repo";
import { mediaUrl } from "@/lib/media";
import { CANTONS } from "@/lib/cantons";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await getBulletinPostById(params.id);
  if (!post) return { title: "Hirdetés" };
  return {
    title: post.title,
    description: post.meta ?? post.body?.slice(0, 160) ?? undefined,
    openGraph: { title: post.title, description: post.meta ?? undefined },
  };
}

const HU_MONTHS_FULL = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];

function fmtPrice(n: number | null): string | null {
  if (n == null) return null;
  return `${n.toLocaleString("hu-HU").replace(/,/g, " ")} CHF`;
}

function fmtAbsoluteDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}. ${HU_MONTHS_FULL[d.getMonth()]} ${d.getDate()}.`;
}

function fmtDaysRemaining(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = Date.parse(expiresAt) - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return "lejárt";
  const days = Math.ceil(ms / 86_400_000);
  if (days === 1) return "még 1 nap";
  return `még ${days} nap`;
}

function parseImageKeys(keyStr: string | null | undefined): string[] {
  if (!keyStr) return [];
  if (keyStr.startsWith("[")) {
    try {
      return JSON.parse(keyStr) as string[];
    } catch {
      return [keyStr];
    }
  }
  return [keyStr];
}

/**
 * /kozosseg/hirdetes/<id> — megosztható mély-link egy hirdetésre.
 * Csak publikus, nem lejárt posztokat ad vissza (`is_pending=0 AND expires_at > now`).
 */
export default async function HirdetesPage({ params }: { params: { id: string } }) {
  const post = await getBulletinPostById(params.id);
  if (!post) notFound();

  const color = post.kind?.color ?? undefined;
  const cantonName = post.cantonCode
    ? CANTONS.find((c) => c.code === post.cantonCode)?.name ?? post.cantonCode
    : null;
  const priceLabel = fmtPrice(post.price);
  const expiryLabel = fmtDaysRemaining(post.expiresAt);
  const images = parseImageKeys(post.imageKey);

  return (
    <div className="mx-auto max-w-md space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <Link
        href="/kozosseg"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-muted hover:text-ink"
      >
        <Icon name="arrowLeft" size={14} strokeWidth={2.4} /> Vissza a hirdetőtáblához
      </Link>

      <article className="rounded-card border border-line bg-surface p-5 shadow-card">
        {/* fejléc */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.kind?.label && (
            <span
              className="rounded-md px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide"
              style={{ color, backgroundColor: color ? `${color}22` : undefined }}
            >
              {post.kind.label}
            </span>
          )}
          {cantonName && (
            <span className="inline-flex items-center gap-0.5 rounded-md border border-line bg-surface-alt px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
              <span className="text-[11px] leading-none">🇨🇭</span> {cantonName}
            </span>
          )}
          {expiryLabel && (
            <span className="rounded-md bg-surface-alt px-1.5 py-0.5 text-[10.5px] font-bold text-ink-muted">
              ⏳ {expiryLabel}
            </span>
          )}
        </div>

        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          {post.title}
        </h1>

        {priceLabel && (
          <p className="mt-2 text-[20px] font-extrabold tracking-tight text-primary">
            {priceLabel}
          </p>
        )}

        {post.meta && (
          <p className="mt-1 text-[13.5px] font-medium text-ink-muted">{post.meta}</p>
        )}

        {/* Képek */}
        {images.length > 0 && (
          <div className="mt-4 grid gap-2">
            {images.map((k) => {
              const url = mediaUrl(k);
              if (!url) return null;
              return (
                <div
                  key={k}
                  className="overflow-hidden rounded-xl border border-line bg-surface-alt"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full object-cover" loading="lazy" decoding="async" />
                </div>
              );
            })}
          </div>
        )}

        {/* Leírás */}
        {post.body && (
          <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
            {post.body}
          </p>
        )}

        {/* Feladó + dátum */}
        <div className="mt-5 flex items-center gap-2.5 border-t border-dashed border-line pt-4">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-white">
            {post.poster?.charAt(0)?.toUpperCase() || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-bold text-ink">
              {post.poster ?? "Anonim"}
            </div>
            <div className="text-[11.5px] text-ink-muted">
              Feladva: {fmtAbsoluteDate(post.publishedAt)}
            </div>
          </div>
        </div>
      </article>

      <p className="px-1 text-center text-[11px] leading-snug text-ink-faint">
        A hirdetésre választ a hirdetőtábla nézetből küldhetsz az „Írok neki" gombbal.
      </p>
    </div>
  );
}
