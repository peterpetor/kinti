import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { RecruiterSearch } from "@/components/admin/recruiter-search";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Közvetítő-kereső — Kinti Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKozvetitesPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link href="/admin" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline">
          ← Vissza az Admin dashboardra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Közvetítő-kereső</h1>
        <p className="text-[12.5px] text-ink-muted">
          Add meg a jelölt szakmáját és az országot — egy kattintással keresel a fő állásportálokon. Onnan veszed fel a kapcsolatot a hirdetővel.
        </p>
      </header>

      <RecruiterSearch />

      <div className="rounded-card border border-dashed border-line bg-surface-alt/50 px-4 py-3 text-[11.5px] leading-snug text-ink-muted">
        ⚖️ A linkek <strong>élő keresésre</strong> visznek a portálokon (nem tárolunk idegen hirdetést — jogtiszta). Csak <strong>EU-ba</strong> közvetíts (AT/DE/NL); a jelölttől díjat NEM szedsz, a munkáltató fizet.
        {" "}A jelentkező-oldali (opt-inolt) jelölteket a{" "}
        <Link href="/admin/jeloltek" className="font-bold text-primary hover:underline">Jelöltek</Link> konzolon találod.
      </div>
    </div>
  );
}
