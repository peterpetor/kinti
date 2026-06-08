import { notFound } from "next/navigation";
import { getAdminUserId } from "@/lib/admin";
import { getJobLeads, updateJobLeadStatus } from "@/lib/repo-leads";
import { revalidatePath } from "next/cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Talent Leads | Admin" };

export default async function AdminTalentPage() {
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const leads = await getJobLeads();

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as any;
    if (id && status) {
      await updateJobLeadStatus(id, status);
      revalidatePath("/admin/talent");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <header className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Kinti Admin</p>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Talent Leads (Jelöltek)</h1>
        <p className="text-[13px] text-ink-muted mt-1">Az összes beérkezett gyors-jelentkezés.</p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface-alt font-bold text-ink-muted">
            <tr>
              <th className="p-3">Dátum</th>
              <th className="p-3">Név / Kapcsolat</th>
              <th className="p-3">Szakma / Német</th>
              <th className="p-3">Svájci Adatok</th>
              <th className="p-3">Extrák</th>
              <th className="p-3">Állapot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="p-5 text-center text-ink-muted">Nincs még jelentkező.</td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="align-top hover:bg-surface-alt/50 transition">
                <td className="p-3 text-ink-muted">
                  {new Date(lead.createdAt).toLocaleDateString("hu-HU")}
                </td>
                <td className="p-3">
                  <div className="font-extrabold text-ink">{lead.firstName} {lead.lastName}</div>
                  <div className="text-ink-muted mt-0.5">{lead.email}</div>
                  <div className="text-ink-muted font-mono text-[11px] mt-0.5">{lead.phone}</div>
                </td>
                <td className="p-3">
                  <div className="font-bold text-ink">{lead.profession}</div>
                  <div className="mt-1 inline-block rounded-md bg-accent/10 px-1.5 py-0.5 text-[11px] font-bold text-accent">
                    Német: {lead.germanLevel}
                  </div>
                </td>
                <td className="p-3">
                  {lead.isInSwitzerland ? (
                    <span className="text-success font-bold text-[12px]">✓ Svájcban (Eng: {lead.permitType})</span>
                  ) : (
                    <span className="text-ink-muted text-[12px]">Magyarországon</span>
                  )}
                  <div className="mt-1 text-[11px] text-ink-muted">
                    Kanton: {lead.targetCanton}<br/>
                    Kezdés: {lead.availableFrom}
                  </div>
                </td>
                <td className="p-3 text-[12px] text-ink-muted">
                  Jogsi: {lead.drivingLicense ? "✅" : "❌"}<br/>
                  Autó: {lead.hasCar ? "✅" : "❌"}
                </td>
                <td className="p-3">
                  <form action={updateStatus} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={lead.id} />
                    <select 
                      name="status" 
                      defaultValue={lead.status}
                      className="rounded border border-line px-2 py-1 text-[12px] font-semibold text-ink outline-none"
                      onChange={(e) => e.target.form?.requestSubmit()}
                    >
                      <option value="new">Új</option>
                      <option value="contacted">Felkeresve</option>
                      <option value="placed">Elhelyezve (Sikeres)</option>
                      <option value="rejected">Elutasítva</option>
                    </select>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
