import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { INDUSTRY_LESSONS } from "./data";
import { KintiLogo } from "@/components/ui/kinti-logo";

export const metadata = {
  title: "Szakmai Gyors-Szótár | Kinti",
  description: "Szakmaspecifikus svájci-német és német kifejezések, hanganyaggal.",
};

export default function SzakmaiSzotarPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
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
        {INDUSTRY_LESSONS.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/allasok/szakmai-szotar/${lesson.id}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:scale-[1.02] hover:shadow-card"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {lesson.industry}
                </span>
                <span className="text-[12px] font-bold text-accent">+{lesson.xpReward} XP</span>
              </div>
              <h2 className="text-[16px] font-extrabold text-ink group-hover:text-primary transition-colors">
                {lesson.title}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                {lesson.description}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-primary">
              Lecke indítása <Icon name="arrowRight" size={14} strokeWidth={2.5} />
            </div>
          </Link>
        ))}
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
