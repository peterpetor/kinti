import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui";
import { AiInterviewSimulator } from "@/components/views/ai-interview-simulator";
import { isPro } from "@/lib/subscriptions";
import { ProLockOverlay } from "@/components/pro-lock-overlay";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Munkainterjú Szimulátor | Kinti",
  description: "Gyakorolj külföldi munkainterjúkra mesterséges intelligenciával.",
};

export default async function AiInterviewPage() {
  // Nem-PRO (és nem bejelentkezett) user is BELÉPHET és LÁTJA az előnézetet — a
  // használatot az overlay + a szerver-oldali API-kapu (403) zárja.
  const { userId } = await auth();
  const pro = userId ? await isPro(userId) : false;
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
      <header className="mb-6">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">
          Munkainterjú Szimulátor 🤖
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          A külföldi HR menedzserek más típusú kérdéseket tesznek fel, mint otthon.
          Gyakorold a bemutatkozást és a válaszadást a helyi nyelven, stresszmentesen!
        </p>
      </header>

      {pro ? (
        <AiInterviewSimulator />
      ) : (
        <ProLockOverlay
          title="Interjú Szimulátor — PRO"
          subtitle="Gyakorolj külföldi munkainterjút AI HR-menedzserrel a helyi nyelven — stresszmentesen, akárhányszor."
        >
          <AiInterviewSimulator />
        </ProLockOverlay>
      )}

      {/* AI-átláthatóság (EU AI Act 50. cikk): a teljes beszélgetés AI-generált,
          a visszajelzés gyakorlási segédlet — nem valós munkáltatói értékelés. */}
      <div className="mt-6">
        <LegalDisclaimer
          toolName="AI interjú-szimulátor"
          variant="info"
          notAdviceFor="karrier- vagy munkajogi"
          extraWarning="Minden kérdés és visszajelzés mesterséges intelligencia által generált — hibázhat és torzíthat. A visszajelzés gyakorlási segédlet a felkészülésedhez, nem valós munkáltatói értékelés, és semmilyen felvételi döntésre nincs hatása. Részletek: kinti.app/ai-atlathatosag"
        />
      </div>
    </div>
  );
}
