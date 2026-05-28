import { ScreenHeader } from "@/components/ui";
import { DigestSubscribeForm } from "@/components/views/digest-subscribe-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Heti hírlevél — kinti",
  description:
    "Hetente egyszer összegyűjtjük az új eseményeket és hirdetéseket a kantonodban. Iratkozz fel ingyen — leiratkozni 1 kattintás.",
};

export default function HirlevelPage() {
  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <ScreenHeader
        eyebrow="Heti hírlevél"
        title={
          <>
            Mi újság ezen a héten
            <br />
            a kantonodban?
          </>
        }
      />

      <div className="rounded-card border border-line bg-surface-alt px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
        <strong className="text-ink">Hetente egyszer</strong> küldünk egy emailt, ami összeszedi
        az új eseményeket és hirdetéseket — csak a választott kantonodból, vagy az egész
        Svájcból, ahogy szeretnéd. Spam-mentes, és <strong>1 kattintással leiratkozhatsz</strong>.
      </div>

      <DigestSubscribeForm />
    </div>
  );
}
