import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { countConfirmedNewsletterSubscribersByCountry } from "@/lib/repo-newsletter";
import { getEmailUsageStats } from "@/lib/repo";
import { COUNTRIES } from "@/lib/countries";
import { NewsletterComposer } from "@/components/admin/newsletter-composer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hírlevél — Kinti Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewsletterPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const [counts, usage] = await Promise.all([
    countConfirmedNewsletterSubscribersByCountry(),
    getEmailUsageStats(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, usage.dailyFreeLimit - usage.todayCount);

  // Mind + 4 ország, mindegyiknél a megerősített feliratkozók számával.
  const options = [
    { code: "all", label: "🌍 Mind", count: total },
    ...COUNTRIES.map((c) => ({ code: c.code, label: `${c.flag} ${c.name}`, count: counts[c.code] ?? 0 })),
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-6">
      <header className="space-y-1">
        <Link href="/admin" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline">
          ← Vissza az Admin dashboardra
        </Link>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Hírlevél küldése</h1>
        <p className="text-[12.5px] text-ink-muted">
          Ország-szegmentált küldés a <strong>megerősített</strong> feliratkozóknak (Resend). Minden e-mailben kötelező leiratkozó-link.
        </p>
      </header>

      {total === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface-alt px-4 py-10 text-center text-[13px] text-ink-muted">
          Még nincs megerősített feliratkozó. Amint lesz, itt tudsz nekik hírlevelet küldeni.
        </div>
      ) : (
        <NewsletterComposer options={options} dailyRemaining={remaining} />
      )}

      <p className="text-[11.5px] leading-snug text-ink-faint">
        Napi keret: <strong className="text-ink-muted">{usage.todayCount}/{usage.dailyFreeLimit}</strong> elküldve ma (Resend free).
        Egy küldés egyszerre legfeljebb {Math.min(100, remaining)} címzettet ér el; a többit holnap (vagy a keret feloldódása után) küldheted ki.
      </p>
    </div>
  );
}
