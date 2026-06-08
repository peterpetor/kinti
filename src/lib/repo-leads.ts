import { getDB } from "./cloudflare";

export interface JobLead {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession: string;
  germanLevel: string;
  drivingLicense: boolean;
  hasCar: boolean;
  isInSwitzerland: boolean;
  permitType: string | null;
  targetCanton: string | null;
  availableFrom: string | null;
  notes: string | null;
  status: "new" | "contacted" | "placed" | "rejected";
  createdAt: string;
  updatedAt: string;
}

function toJobLead(r: any): JobLead {
  return {
    id: r.id,
    userId: r.user_id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
    profession: r.profession,
    germanLevel: r.german_level,
    drivingLicense: r.driving_license === 1,
    hasCar: r.has_car === 1,
    isInSwitzerland: r.is_in_switzerland === 1,
    permitType: r.permit_type,
    targetCanton: r.target_canton,
    availableFrom: r.available_from,
    notes: r.notes,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getJobLeads(): Promise<JobLead[]> {
  const { results } = await getDB()
    .prepare(`SELECT * FROM job_leads ORDER BY created_at DESC`)
    .all();
  return results.map(toJobLead);
}

export async function updateJobLeadStatus(id: string, status: "new" | "contacted" | "placed" | "rejected"): Promise<void> {
  await getDB()
    .prepare(`UPDATE job_leads SET status = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(status, id)
    .run();
}
