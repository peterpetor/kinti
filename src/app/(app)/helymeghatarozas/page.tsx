import { KintiLogo } from "@/components/ui";
import { BackButton } from "@/components/back-button";
import { LocationSettings } from "@/components/views/location-settings";

// Statikus oldal (kliens-shell) — nem fogyaszt edge-route-ot (deploy-plafon).
export const dynamic = "force-static";

export const metadata = { title: "Helymeghatározás" };

export default function LocationPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pb-24 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <BackButton
          fallback="/"
          className="ml-auto order-last grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        />
        <div className="flex items-center gap-2">
          <KintiLogo size={22} />
          <h1 className="text-[18px] font-extrabold tracking-tight text-ink">Helymeghatározás</h1>
        </div>
      </header>

      <LocationSettings />
    </div>
  );
}
