import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { KeresekView } from "@/components/views/keresek-view";
import { TelegramBotCard } from "@/components/telegram-bot-card";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Keresek — magyar szakembert keresel?",
  description:
    "Add fel, mit keresel (pl. magyarul beszélő villanyszerelőt Münchenben jövő hétre), és a szakik jelentkeznek. Ingyenes, moderált.",
};

export default function KeresekPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return (
    <div className="space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Keresek</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <p className="text-[12.5px] leading-snug text-ink-muted">
        Keresel egy magyar szakembert egy konkrét melóra? Add fel itt — a környékbeli magyar szakik látják és jelentkeznek a megadott elérhetőségen.
      </p>

      <KeresekView turnstileSiteKey={turnstileSiteKey} />

      {/* Telegram-bot promó — ugyanez a kereső a csoportjaidban is él. */}
      <TelegramBotCard />
    </div>
  );
}
