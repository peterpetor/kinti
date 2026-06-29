import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getJobById, getEmployerById, getWorkerProfileByUser } from "@/lib/repo";
import { getDB } from "@/lib/cloudflare";
import { sendJobApplicationNotificationEmail } from "@/lib/email";
import { safeLogError } from "@/lib/safe-log";
import { hashIp } from "@/lib/security";
import { checkAiRateLimit, logAiRateLimit } from "@/lib/ai";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  
  // A „Kiemelt Állás" status-a 'featured' — az is NYITOTT (lehet rá jelentkezni),
  // különben a fizetett kiemelt hirdetésekre nem mehetne jelentkezés.
  if (!job || job.moderationStatus !== 1 || (job.status !== "active" && job.status !== "featured")) {
    return NextResponse.json({ error: "Ez az álláshirdetés nem aktív." }, { status: 404 });
  }

  // Rate-limit: jelentkezés-spam, employer-email-flood és e-mail-enumeráció ellen.
  const ipHash = await hashIp(req.headers.get("cf-connecting-ip") ?? null);
  const rl = await checkAiRateLimit("job-apply", ipHash);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Túl sok jelentkezés erről a hálózatról. Próbáld újra később." },
      { status: 429 },
    );
  }
  // MINDEN próbálkozást naplózunk (nem csak a sikereset), hogy a duplikátum-
  // ellenőrzés (409) ne adjon throttle-mentes e-mail-enumerációs orákulumot.
  await logAiRateLimit("job-apply", ipHash);

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

  // Egykattintásos CV-csatolás: a kulcsot SZERVEROLDALON, a bejelentkezett user
  // SAJÁT worker-profiljából olvassuk — sosem a kliens küldi. Így nem lehet más
  // jelölt CV-jét csatolni.
  let cvKey: string | null = null;
  if (body.useProfileCv === true) {
    try {
      const { userId } = await auth();
      if (userId) {
        const profile = await getWorkerProfileByUser(userId);
        cvKey = profile?.cvKey ?? null;
      }
    } catch (e) {
      safeLogError("jobs/apply useProfileCv", e);
    }
  }

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
        `INSERT INTO job_applications (id, job_id, employer_id, full_name, email, phone, message, cv_key, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
      )
      .bind(id, job.id, job.employerId, fullName, email.toLowerCase(), phone, message, cvKey, submittedAt)
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
    safeLogError("[jobs/apply]", err);
    return NextResponse.json({ error: "Belső hiba történt." }, { status: 500 });
  }
}

