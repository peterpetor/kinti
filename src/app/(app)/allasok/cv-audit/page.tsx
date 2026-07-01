import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui";
import { CvAssistant } from "@/components/views/cv-assistant";
import { isPro } from "@/lib/subscriptions";
import { getWorkerProfileByUser } from "@/lib/repo";
import { ProLockOverlay } from "@/components/pro-lock-overlay";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI CV-audit | Kinti",
  description: "Az AI átnézi a CV-det a helyi HR-elvárások szerint — pontszám, erősségek, konkrét javítások.",
};

export default async function CvAuditPage() {
  // Nem-PRO (és nem bejelentkezett) user is BELÉPHET és LÁTJA az előnézetet — a
  // használatot az overlay + a szerver-oldali API-kapu (401/403) zárja. A CV-t a
  // profilnál lehet feltölteni; ez az oldal az auditot futtatja a feltöltöttön.
  const { userId } = await auth();
  const [pro, profile] = userId
    ? await Promise.all([isPro(userId), getWorkerProfileByUser(userId)])
    : ([false, null] as const);

  return (
    <div className="mx-auto max-w-2xl px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-24">
      <div className="mb-4 flex justify-end">
        <Link
          href="/allasok"
          aria-label="Vissza"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </div>
      <header className="mb-6">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">AI CV-audit 📄</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Az AI átnézi a feltöltött CV-det a helyi HR-elvárások szerint: pontszám, erősségek és
          szakaszonkénti konkrét javítások — hogy magabiztosabban pályázz.
        </p>
      </header>

      {pro ? (
        <CvAssistant hasCv={!!profile?.cvKey} />
      ) : (
        <ProLockOverlay
          title="AI CV-audit — PRO"
          subtitle="Átnézi a CV-det, pontozza a helyi HR-elvárások szerint, és konkrét javításokat + újraírt szakaszokat ad."
        >
          <CvAssistant hasCv={false} />
        </ProLockOverlay>
      )}
    </div>
  );
}
