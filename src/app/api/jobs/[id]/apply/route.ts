import { NextResponse } from "next/server";
import { getJobById, getEmployerById } from "@/lib/repo";
import { getDB } from "@/lib/cloudflare";
import { sendJobApplicationNotificationEmail } from "@/lib/email";
import { safeLogError } from "@/lib/safe-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  
  if (!job || job.moderationStatus !== 1 || job.status !== "active") {
    return NextResponse.json({ error: "Ez az álláshirdetés nem aktív." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : null;
  const message = typeof body.message === "string" ? body.message.trim() : null;

  if (fullName.length < 2) {
    return NextResponse.json({ error: "A névmező túl rövid." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Érvénytelen email cím." }, { status: 400 });
  }

  // Duplicate check: ne lehessen kétszer jelentkezni
  const existing = await getDB()
    .prepare("SELECT id FROM job_applications WHERE job_id = ? AND email = ?")
    .bind(job.id, email.toLowerCase())
    .first();
  
  if (existing) {
    return NextResponse.json({ error: "Már jelentkeztél erre az állásra." }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const submittedAt = new Date().toISOString();

  try {
    await getDB()
      .prepare(
        `INSERT INTO job_applications (id, job_id, employer_id, full_name, email, phone, message, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`
      )
      .bind(id, job.id, job.employerId, fullName, email.toLowerCase(), phone, message, submittedAt)
      .run();

    // Email értesítő a munkáltatónak — best-effort (ne blokkoljuk a 200-as választ)
    try {
      const employer = await getEmployerById(job.employerId);
      if (employer?.contactEmail) {
        await sendJobApplicationNotificationEmail({
          to: employer.contactEmail,
          companyName: employer.companyName,
          jobTitle: job.title,
          applicantName: fullName,
          applicantEmail: email,
          applicantPhone: phone,
          message: message,
          dashboardUrl: `https://kinti.app/munkaltato`,
        });
      }
    } catch (emailErr) {
      safeLogError("jobs/apply email notification", emailErr);
      // Nem dobjuk vissza a hibát — a pályázat már el lett mentve
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[jobs/apply] error:", err);
    return NextResponse.json({ error: "Belső hiba történt." }, { status: 500 });
  }
}

