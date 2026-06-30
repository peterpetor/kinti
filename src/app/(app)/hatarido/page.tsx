import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { HataridoAssistant } from "@/components/views/hatarido-assistant";

// Force-static KLIENS-SHELL: minden kliensoldalon (localStorage) — NEM fogyaszt edge-route-ot.
export const dynamic = "force-static";

export const metadata = {
  title: "Határidő-asszisztens — soha ne maradj le egy határidőről | Kinti PRO",
  description:
    "Tartsd számon a fontos határidőidet (tartózkodási engedély, biztosítás, adó, iskola) — ország-tudatos sablonokkal és hivatalos linkekkel. Kinti PRO funkció.",
};

export default function HataridoPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Határidő-asszisztens
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <p className="text-[13px] leading-snug text-ink-muted">
        <strong className="text-ink">Soha ne maradj le egy fontos határidőről.</strong> Tartózkodási engedély,
        biztosítás, adóbevallás, iskolai beiratkozás — az asszisztens számon tartja, sürgősség szerint,
        és odavezet, hol intézheted.
      </p>

      <HataridoAssistant />
    </div>
  );
}
