import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, KintiLogo } from "@/components/ui";
import { getReviewByManageToken } from "@/lib/repo";
import { ReviewManageActions } from "@/components/views/review-manage-actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vélemény kezelése" };

/**
 * /velemeny-kezeles/<token> — a véleményíró saját véleményének kezelő oldala.
 * Token = bizonyíték (122 bit entrópia). Jelenleg törlés érhető el.
 */
export default async function VelemenyKezelesPage({
  params,
}: {
  params: { token: string };
}) {
  const review = await getReviewByManageToken(params.token);
  if (!review) notFound();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-10">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[18px] font-extrabold tracking-tight text-ink">
          Vélemény kezelése
        </span>
      </header>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        {review.businessName && (
          <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
            {review.businessName}
          </p>
        )}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex gap-px text-star">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                name="star"
                size={16}
                filled={i < review.rating}
                className={i < review.rating ? "text-star" : "text-line-strong"}
              />
            ))}
          </div>
          <span className="text-[12.5px] font-semibold text-ink-muted">
            {review.rating}/5
          </span>
        </div>

        <p className="mt-3 text-[11.5px] text-ink-faint">
          Megjelenő név:{" "}
          <span className="font-semibold text-ink-muted">{review.reviewerName}</span>
        </p>
      </section>

      <ReviewManageActions token={params.token} />

      <Link
        href={`/szaknevsor/${review.businessId}`}
        className="self-start text-[12.5px] font-semibold text-ink-muted underline"
      >
        ← Vissza a vállalkozáshoz
      </Link>
    </div>
  );
}
