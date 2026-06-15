import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { BusinessSuggestForm } from "@/components/views/business-suggest-form";
import { getCategories } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Ajánlj egy magyar vállalkozást" };

/**
 * /szaknevsor/ajanlas — közösségi vállalkozás-ajánlás (nem a sajátod).
 * Moderációval kerül be; jóváhagyás után nem-megerősített listaként jelenik
 * meg, a tulaj később átveheti.
 */
export default async function AjanlasPage() {
  const categories = await getCategories();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <ScreenHeader
        title="Ajánlj egy vállalkozást"
        back={
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
        Ismersz egy <strong className="text-ink">magyar vállalkozást</strong> Svájcban, ami hiányzik
        a Szaknévsorból? Ajánld 30 másodperc alatt — mi ellenőrizzük és felvesszük. A tulajdonos
        később <strong className="text-ink">átveheti</strong> a profilt.
      </div>

      <BusinessSuggestForm categories={categories} turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
