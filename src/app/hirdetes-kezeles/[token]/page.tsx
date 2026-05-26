import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, KintiLogo } from "@/components/ui";
import { getBulletinPostByManageToken } from "@/lib/repo";
import { ManageActions } from "@/components/views/manage-actions";
import { RenewButton } from "@/components/views/renew-button";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Hirdetés kezelése" };

/**
 * /hirdetes-kezeles/<token>  — a feladó saját posztjának kezelő oldala.
 *
 * Auth nincs — a token MAGA a bizonyíték. A token 122 bit entrópiájú UUID,
 * gyakorlatilag brute-force-hatatlan. Az URL-t a megerősítő emailben kapta a
 * felhasználó, és csak az ő postafiókjában van.
 */
export default async function HirdetesKezelesPage({
  params,
}: {
  params: { token: string };
}) {
  const post = await getBulletinPostByManageToken(params.token);
  if (!post) notFound();

  const expiresHu = post.expiresAt ? fmtHu(post.expiresAt) : null;
  const isExpired = post.expiresAt ? new Date(post.expiresAt) < new Date() : false;

  // Lejár-e 7 napon belül (nem lejárt, de hamarosan)?
  const expiresSoon = post.expiresAt && !isExpired
    ? new Date(post.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false;

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
          {isExpired && (
            <span className="ml-auto rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              lejárt
            </span>
          )}
          {expiresSoon && !isExpired && (
            <span className="ml-auto rounded-md bg-[#e3a233]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9a6b00]">
              hamarosan lejár
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
          <p className={`mt-4 text-[11.5px] ${isExpired ? "text-accent font-semibold" : "text-ink-faint"}`}>
            {isExpired ? "Lejárt:" : "Automatikus lejárat:"}{" "}
            <span className="font-semibold text-ink-muted">{expiresHu}</span>
          </p>
        )}
      </section>

      {/* Hosszabbítás szekció — csak ha van expires_at (nem seed-adat) */}
      {post.expiresAt && post.manageToken && (
        <section className={`rounded-card border p-5 shadow-card ${isExpired ? "border-accent/30 bg-accent/5" : expiresSoon ? "border-[#e3a233]/40 bg-[#fff8ed]" : "border-line bg-surface"}`}>
          <div className="flex items-start gap-3">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg ${isExpired ? "bg-accent/10" : "bg-[#e3a233]/15"}`}>
              ⏰
            </div>
            <div className="flex-1">
              <p className={`text-[13.5px] font-bold ${isExpired ? "text-accent" : "text-[#9a6b00]"}`}>
                {isExpired
                  ? "Ez a hirdetés lejárt"
                  : expiresSoon
                    ? "A hirdetésed hamarosan lejár"
                    : "Hirdetés meghosszabbítása"}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                {isExpired
                  ? "A hirdetés már nem látható a közösség számára. Ha szeretnéd, meghosszabbíthatod az előző lejárattól számítva újabb 30 nappal."
                  : "Egyetlen kattintással meghosszabbíthatod újabb 30 nappal — nem kell semmit újra megírni!"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <RenewButton token={params.token} />
          </div>
        </section>
      )}

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
