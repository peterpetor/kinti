import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { EventForm } from "@/components/views/event-form";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Esemény beküldése" };

/**
 * /kozosseg/uj-esemeny — account-mentes eseménybeküldő oldal.
 * 3-lépéses troll-védelem: profanity filter → email confirm → admin jóváhagyás.
 */
export default function UjEsemenyPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <ScreenHeader
        title="Esemény beküldése"
        back={
          <Link
            href="/kozosseg"
            aria-label="Vissza"
            className="grid h-9 w-9 place-items-center rounded-[12px] border border-line bg-surface text-ink"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
          </Link>
        }
      />

      <div className="mb-4 rounded-card border border-line bg-surface-alt px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted">
        <strong className="text-ink">Nincs regisztráció, nincs email.</strong>{" "}
        Töltsd ki és küldd — moderátor-jóváhagyás után megjelenik a közösségi
        naptárban. 🗓️ Kapsz egy <strong className="text-ink">kezelő-linket</strong>{" "}
        (QR-kód is jön) — bármikor szerkesztheted vagy törölheted.
      </div>

      <EventForm turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
