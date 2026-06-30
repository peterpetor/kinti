import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { UtalasAssistant } from "@/components/views/utalas-assistant";

// Force-static KLIENS-SHELL: az asszisztens kliensoldalon kéri az árfolyamot
// (/api/exchange-rate), így a lap NEM fogyaszt edge-route-ot (lásd deploy-plafon).
export const dynamic = "force-static";

export const metadata = {
  title: "Utalás-asszisztens — mérhető spórolás a hazautaláson | Kinti PRO",
  description:
    "Megmondja, mikor és melyik szolgáltatóval (Wise/Revolut vs. bank) éri meg hazautalni, és vezeti, mennyit spóroltál. Kinti PRO funkció.",
};

export default function UtalasPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink truncate">
          Utalás-asszisztens
        </span>
        <Link
          href="/arfolyam"
          aria-label="Vissza az árfolyamhoz"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <p className="text-[13px] leading-snug text-ink-muted">
        Mérhető havi spórolás a hazautaláson: beállítod a szokásos összeged, az asszisztens megmondja,
        <strong className="text-ink"> mikor</strong> és <strong className="text-ink">melyik szolgáltatóval</strong> éri
        meg utalni — és vezeti, mennyit spóroltál a banki utaláshoz képest.
      </p>

      <UtalasAssistant />
    </div>
  );
}
