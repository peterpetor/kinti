import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, KintiLogo } from "@/components/ui";
import { getBulletinPostByManageToken } from "@/lib/repo";
import { ManageActions } from "@/components/views/manage-actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Hirdetés kezelése" };

/**
 * /hirdetes-kezeles/<token>  — a feladó saját posztjának kezelő oldala.
 *
 * Auth nincs — a token MAGA a bizonyíték. A token 122 bit entrópiájú UUID,
 * gyakorlatilag brute-force-hatatlan. Az URL-t a megerősítő emailben kapta a
 * felhasználó, és csak az ő postafiókjában van.
 *
 * Itt jelenleg törlést kínálunk; a szerkesztést későbbi iterációban (ha sok
 * felhasználó használja, és kéri).
 */
export default async function HirdetesKezelesPage({
  params,
}: {
  params: { token: string };
}) {
  const post = await getBulletinPostByManageToken(params.token);
  if (!post) notFound();

  const expiresHu = post.expiresAt ? fmtHu(post.expiresAt) : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-10">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[18px] font-extrabold tracking-tight text-ink">
          Hirdetés kezelése
        </span>
      </header>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-1.5 flex items-center gap-2">
          {post.kind?.color && (
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: post.kind.color }}
            />
          )}
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            {post.kind?.label ?? "—"}
          </span>
          {post.expiresAt && new Date(post.expiresAt) < new Date() && (
            <span className="ml-auto rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              lejárt
            </span>
          )}
        </div>

        <h2 className="text-[17px] font-extrabold leading-snug tracking-tight text-ink text-pretty">
          {post.title}
        </h2>
        {post.meta && (
          <p className="mt-1 text-[12.5px] text-ink-muted">{post.meta}</p>
        )}
        {post.body && (
          <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
            {post.body}
          </p>
        )}

        {expiresHu && (
          <p className="mt-4 text-[11.5px] text-ink-faint">
            Automatikus lejárat: <span className="font-semibold text-ink-muted">{expiresHu}</span>
          </p>
        )}
      </section>

      {post.kind && (
        <ManageActions token={params.token} />
      )}

      <Link
        href="/kozosseg"
        className="self-start text-[12.5px] font-semibold text-ink-muted underline"
      >
        ← Vissza a közösséghez
      </Link>
    </div>
  );
}

function fmtHu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const HU_MONTH = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  return `${d.getFullYear()}. ${HU_MONTH[d.getMonth()]} ${d.getDate()}.`;
}
