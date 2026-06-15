import { auth, currentUser } from "@clerk/nextjs/server";
import { getCloudflareEnv } from "./cloudflare";

/**
 * Admin auth — ADMIN_EMAILS env-változó (vesszővel elválasztott, kisbetűsített).
 * A bejelentkezett Clerk-user email-jeit ehhez illeszti.
 *
 * Visszaadja a `userId`-t, ha admin; különben null. Az API-route-ok / oldalak
 * 401/403-at adnak vissza a callerre bízva.
 */
export async function getAdminUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const allowed = (getCloudflareEnv().ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.length) return null;

  const user = await currentUser();
  if (!user) return null;
  // Csak IGAZOLT (verified) e-mail számít — különben egy támadó egy nem-igazolt
  // admin-e-mail hozzáadásával jogosultságot szerezhetne (defense-in-depth).
  const emails = user.emailAddresses
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
  return emails.some((e) => allowed.includes(e)) ? userId : null;
}
