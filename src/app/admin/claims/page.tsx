import Link from "next/link";
import { getAdminUserId } from "@/lib/admin";
import { listBusinessClaims } from "@/lib/repo";
import { Icon, KintiLogo } from "@/components/ui";
import { ClaimsManager } from "@/components/admin/claims-manager";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Admin · Claim-igénylések" };

export default async function AdminClaimsPage() {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Icon name="close" size={22} strokeWidth={2.4} />
          </div>
          <h1 className="text-[18px] font-extrabold text-ink">Csak adminoknak</h1>
          <Link href="/" className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12px] font-bold text-white">
            Vissza a főoldalra
          </Link>
        </div>
      </main>
    );
  }

  const claims = await listBusinessClaims("pending");

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={26} />
        <span className="text-[16px] font-extrabold tracking-tight">Kinti · admin</span>
        <span className="ml-auto rounded-pill bg-accent/10 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-accent">
          Admin
        </span>
      </header>

      <h1 className="mt-6 text-[26px] font-extrabold tracking-tight text-ink">
        Claim-igénylések
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        „Foglald el a vállalkozásod" kérések. <strong>Jóváhagyás</strong> → a vállalkozás
        megerősítetté válik, és a kezelő-linket e-mailben elküldjük az igénylőnek. Ellenőrizd,
        hogy az igénylő tényleg a vállalkozáshoz tartozik-e (e-mail / weboldal egyezés).
      </p>

      <ClaimsManager initialClaims={claims} />
    </main>
  );
}
