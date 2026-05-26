import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { BusinessForm } from "@/components/views/business-form";
import { getCategories } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vállalkozásod hozzáadása" };

/**
 * /szaknevsor/uj — account-mentes, self-service vállalkozás-feladás.
 *
 * NEM Clerk-védett: bárki bejelentheti a vállalkozását, a spam-szűrés a
 * Turnstile + email-megerősítés + svájci cím-ellenőrzés rétegen történik.
 * Megerősítés után AZONNAL fent van a Szaknévsorban (nincs kézi jóváhagyás).
 */
export default async function UjVallalkozasPage() {
  const categories = (await getCategories()).filter((c) => c.id !== "all");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <ScreenHeader
        title="Vállalkozásod hozzáadása"
        left={
          <Link
            href="/szaknevsor"
            aria-label="Vissza"
            className="grid h-9 w-9 place-items-center rounded-[12px] border border-line bg-surface text-ink"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
          </Link>
        }
      />

      <div className="mb-4 rounded-card border border-line bg-surface-alt px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted">
        <strong className="text-ink">Ingyenes, és nem kell regisztráció.</strong> Add meg a
        vállalkozásod adatait + az emailedet, kapsz egy megerősítő linket — egy kattintás, és
        fent vagy a Szaknévsorban. Csak <strong className="text-ink">svájci</strong> vállalkozások.
      </div>

      <BusinessForm categories={categories} turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
