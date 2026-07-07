import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { KintiPassCard } from "@/components/views/kinti-pass-card";

// Force-static KLIENS-SHELL: a kártya (név, kód, óra, QR) teljesen kliensoldali
// — a lap NEM fogyaszt edge-route-ot (lásd deploy-plafon).
export const dynamic = "force-static";

export const metadata = {
  title: "Kinti Pass — digitális kedvezménykártya",
  description:
    "Mutasd fel a Kinti Pass digitális kártyát a szerződött magyar vállalkozásoknál, és kapj kedvezményt. Az elfogadóhelyeket a Szaknévsorban találod.",
};

export default function KintiPassPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-12">
      <ScreenHeader
        title="Kinti Pass"
        eyebrow="Kedvezménykártya"
        back={
          <Link
            href="/szaknevsor"
            aria-label="Vissza a Szaknévsorhoz"
            className="grid h-9 w-9 place-items-center rounded-[12px] border border-line bg-surface text-ink"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
          </Link>
        }
      />

      <p className="text-[13px] leading-snug text-ink-muted">
        Mutasd fel ezt a kártyát a <strong className="text-ink">Kinti Pass elfogadóhelyeken</strong>{" "}
        (magyar vállalkozások a Szaknévsorból) — ők kedvezményt adnak a Kinti közösség tagjainak.
        Ingyenes, regisztráció nélkül.
      </p>

      <KintiPassCard />
    </div>
  );
}
