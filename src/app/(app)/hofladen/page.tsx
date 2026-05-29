import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { HofladenView } from "./hofladen-view";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hofladen-térkép — 24h becsületkasszás farmer-boltok Svájcban",
  description:
    "Helyi termelők (Hofladen) térképe — friss tej, tojás, sajt, hús a közeledben. 24h becsületkasszás vagy Twint-es svájci farmerek.",
};

export default function HofladenPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-12">
      <div className="px-5">
        <header className="flex items-center gap-3 mb-3">
          <Link
            href="/"
            aria-label="Vissza a Főoldalra"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
          </Link>
          <KintiLogo size={28} />
          <span className="text-[16px] font-extrabold tracking-tight text-ink">
            Hofladen-térkép
          </span>
        </header>

        {/* Hero */}
        <section className="rounded-card border-2 border-success/20 bg-success/5 p-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-success text-white text-xl">
              🌾
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[18px] font-extrabold tracking-tight text-ink">
                Friss farmer-termékek a közeledben
              </h1>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
                Helyi termelők — 24h becsületkasszás, Twint-es boltok. Friss tej, tojás, sajt, hús.
              </p>
            </div>
          </div>
        </section>
      </div>

      <HofladenView turnstileSiteKey={turnstileSiteKey} />

      <div className="px-5">
        <LegalDisclaimer
          toolName="Hofladen-térkép"
          variant="info"
          notAdviceFor="fogyasztói, élelmiszeripari vagy kereskedelmi"
          extraWarning="A pontok FELHASZNÁLÓK ÁLTAL BEADOTT jelentések. A nyitva tartás, kínálat, fizetési mód és pontos elérhetőség idővel változhat — vásárlás előtt mindig győződj meg a helyszínen. A becsületkasszás fizetés bizalmi alapon működik. A termékek minőségéért, élelmiszer-biztonságáért az adott farmer felel, NEM az üzemeltető. Csalás vagy higiéniai probléma esetén jelezd: abuse@kinti.app."
        />
      </div>
    </div>
  );
}
