import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

/**
 * Egységes keret a jogi oldalakhoz (impresszum, adatvédelem, ÁSZF).
 * NEM része az (app)/layout.tsx-nek (nincs TabBar), önálló oldalak.
 */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  /** "2026-05-25" formátum — megjelenítéshez ISO-magyar formára konvertáljuk. */
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Kezdőlap"
          className="inline-flex items-center gap-2 text-ink"
        >
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight">Kinti</span>
        </Link>
        <span className="flex-1" />
        <Link
          href="/"
          aria-label="Vissza"
          className="grid h-9 w-9 place-items-center rounded-[12px] border border-line bg-surface text-ink"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
        </Link>
      </header>

      <h1 className="mb-1 text-[28px] font-extrabold leading-tight tracking-tight text-ink">
        {title}
      </h1>
      <p className="mb-8 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
        Utolsó frissítés: {formatHu(updatedAt)}
      </p>

      <article className="prose-kinti">{children}</article>

      <footer className="mt-12 border-t border-line pt-6 text-[12px] leading-relaxed text-ink-muted">
        Kérdés vagy észrevétel:{" "}
        <a href="mailto:info@kinti.app" className="underline">info@kinti.app</a>
        <span className="mx-2">·</span>
        Visszaélés-bejelentés:{" "}
        <a href="mailto:abuse@kinti.app" className="underline">abuse@kinti.app</a>
      </footer>

      <nav className="mt-4 flex flex-wrap gap-3 text-[12.5px] font-semibold text-ink-muted">
        <Link href="/impresszum" className="underline">Impresszum</Link>
        <Link href="/adatvedelem" className="underline">Adatkezelési Tájékoztató</Link>
        <Link href="/aszf" className="underline">Felhasználási Feltételek</Link>
      </nav>
    </div>
  );
}

function formatHu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const HU_MONTH = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  return `${d.getFullYear()}. ${HU_MONTH[d.getMonth()]} ${d.getDate()}.`;
}
