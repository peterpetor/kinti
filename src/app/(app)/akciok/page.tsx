import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { AkciokView } from "./akciok-view";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Akciók — Migros/Coop leárazások a térképen",
  description:
    "Közösségi akció-térkép: hol vannak most -25% / -50% leárazások a Migros/Coop/Denner/Lidl boltokban Svájcban. Lejár éjfélkor.",
};

export default function AkciokPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-12">
      <div className="px-5">
        <header className="flex items-center gap-3 mb-3">
          <KintiLogo size={28} />
          <span className="text-[16px] font-extrabold tracking-tight text-ink">
            Akciók
          </span>
          <Link
            href="/"
            aria-label="Vissza a Főoldalra"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
          </Link>
        </header>

        {/* Hero */}
        <section className="rounded-card border-2 border-accent/20 bg-accent/5 p-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent text-white text-xl">
              🏷️
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[18px] font-extrabold tracking-tight text-ink">
                Hol érdemes ma vásárolni?
              </h1>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
                Közösségi akció-térkép. Friss leárazások a térképen — éjfélkor automatikusan eltűnnek.
              </p>
            </div>
          </div>
        </section>
      </div>

      <AkciokView turnstileSiteKey={turnstileSiteKey} />

      <div className="px-5">
        <LegalDisclaimer
          toolName="Akciók térkép"
          variant="info"
          notAdviceFor="kereskedelmi vagy fogyasztóvédelmi"
          extraWarning="Az akció-bejelentéseket a platform felhasználói teszik közzé saját tapasztalataik alapján, az adatok NEM hivatalosak és NEM ellenőrzöttek. Az aktuális árakhoz és akcicskhoz mindig az érintett boltlánc weboldalát vagy az alkalmazott kiszólálóját kell alapul venni. A kinti.app nem vállal felelősséget az eltelt akciszámított vásárlásokból eredett károkért."
        />
      </div>
    </div>
  );
}
