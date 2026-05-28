import Link from "next/link";
import { notFound } from "next/navigation";
import { KintiLogo } from "@/components/ui";
import { LogoUploader } from "@/components/views/logo-uploader";
import { BusinessManageForm } from "@/components/views/business-manage-form";
import { getBusinessByManageToken } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vállalkozás kezelése", robots: { index: false, follow: false } };

/**
 * /szaknevsor/kezeles/<token> — a feladó saját vállalkozásának kezelő oldala.
 *
 * Auth nincs — a token (122 bit entrópia) maga a bizonyíték, hogy a feladó vagyunk.
 * Az URL-t a megerősítő e-mailben kapja, csak az ő postafiókjában van.
 *
 * NEM kell Clerk-fiók. Email-only flow.
 */
export default async function BusinessManagePage({ params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);
  if (!business) notFound();

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Vállalkozás kezelése
        </span>
      </header>

      <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        <strong className="text-ink">{business.name}</strong> — ez a kezelő oldal csak ezzel a
        linkkel érhető el. Tedd el a böngésződ könyvjelzői közé, vagy az emailedben tartsd meg
        (a Resend e-mailben kaptad).
      </div>

      <LogoUploader
        currentKey={business.logoKey}
        fallbackGradient={business.photo}
        manageToken={params.token}
      />

      <BusinessManageForm business={business} token={params.token} />

      <Link
        href="/szaknevsor"
        className="block self-start text-[12.5px] font-semibold text-ink-muted underline"
      >
        ← Vissza a Szaknévsorhoz
      </Link>
    </div>
  );
}
