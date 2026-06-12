import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { INDUSTRY_LESSONS } from "./data";
import { KintiLogo } from "@/components/ui/kinti-logo";
import { cn } from "@/lib/cn";
import { auth } from "@clerk/nextjs/server";
import { isPro } from "@/lib/subscriptions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Szakmai Gyors-Szótár | Kinti",
  description: "Szakmaspecifikus svájci-német és német kifejezések, hanganyaggal.",
};

export default async function SzakmaiSzotarPage() {
  const { userId } = await auth();
  const userIsPro = userId ? await isPro(userId) : false;

  return (
    <div className="mx-auto max-w-2xl px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
      <div className="mb-4 flex justify-end">
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </div>
      <header className="mb-6 flex flex-col items-center text-center">
        <KintiLogo size={42} />
        <h1 className="mt-4 text-[24px] font-extrabold tracking-tight text-ink">
          Szakmai Szótár 👷‍♂️🍽️
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Pörgesd végig ezeket a 20 perces gyorstalpalókat, mielőtt hétfőn kezdenél 
          az új svájci munkahelyeden! Tipikus szituációk és szakszavak.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        {INDUSTRY_LESSONS.map((lesson) => {
          const requiresPro = lesson.isPro && !userIsPro;
          const href = requiresPro ? "/allasok/pro" : `/allasok/szakmai-szotar/${lesson.id}`;
          
          return (
            <Link
              key={lesson.id}
              href={href}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-surface p-5 shadow-sm transition hover:scale-[1.02] hover:shadow-card",
                lesson.isPro ? "border-[#e3a233]/40 bg-gradient-to-br from-surface to-[#e3a233]/5" : "border-line"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                    lesson.isPro ? "bg-[#e3a233]/20 text-[#e3a233]" : "bg-primary/10 text-primary"
                  )}>
                    {lesson.industry}
                  </span>
                  <span className={cn(
                    "text-[12px] font-bold",
                    lesson.isPro ? "text-[#e3a233]" : "text-accent"
                  )}>
                    +{lesson.xpReward} XP
                  </span>
                </div>
                <h2 className="text-[16px] font-extrabold text-ink group-hover:text-primary transition-colors flex items-center gap-2">
                  {lesson.title} {requiresPro && <span className="text-[14px]">🔒</span>}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                  {lesson.description}
                </p>
              </div>

              <div className={cn(
                "mt-4 flex items-center gap-1.5 text-[12px] font-bold",
                requiresPro ? "text-[#e3a233]" : "text-primary"
              )}>
                {requiresPro ? (
                  <>Prémium Feloldása <Icon name="lock" size={14} strokeWidth={2.5} /></>
                ) : (
                  <>Lecke indítása <Icon name="arrowRight" size={14} strokeWidth={2.5} /></>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <Link
          href="/allasok"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-ink transition underline"
        >
          ← Vissza az állásokhoz
        </Link>
      </div>
    </div>
  );
}
