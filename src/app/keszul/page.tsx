import Link from "next/link";
import { KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hamarosan érkezünk — kinti",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <div className="flex items-center gap-3">
        <KintiLogo size={48} />
        <span className="text-[34px] font-extrabold tracking-tight text-ink">
          kinti
        </span>
      </div>

      <div className="space-y-3">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
          Hamarosan érkezünk
        </h1>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          A kinti.app jelenleg karbantartás alatt áll, és új formában készülünk
          visszatérni. Köszönjük a türelmedet — hamarosan jelentkezünk!
        </p>
      </div>

      <div className="grid w-full gap-3 pt-4">
        <Link
          href="/belepes"
          className="rounded-pill bg-primary px-6 py-3 text-[13.5px] font-bold text-white shadow-card transition active:scale-[0.99]"
        >
          Bejelentkezés
        </Link>
        <a
          href="mailto:info@kinti.app"
          className="rounded-pill border border-line bg-surface px-6 py-3 text-[13.5px] font-bold text-ink transition active:scale-[0.99]"
        >
          Kapcsolat
        </a>
      </div>

      <footer className="pt-6 text-[11.5px] text-ink-faint">
        © kinti.app · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
