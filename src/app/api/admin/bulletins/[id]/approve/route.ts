import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin";
import { approveBulletinPost, getBulletinPosts } from "@/lib/repo";
import { triggerAlberletRadars } from "@/lib/radars";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Megpróbáljuk jóváhagyni
  const ok = await approveBulletinPost(params.id);
  
  if (ok) {
    // Kikeressük, hogy alberlet-e, ha igen, triggerezzük a radarokat
    // (Mivel a repo.ts getBulletinPosts függvénye alapból is_pending=0-t keres,
    // és mi most állítottuk 0-ra, ezért megtalálja, vagy írhatunk custom lekérdezést is.
    // Legjobb lenne közvetlen adatbázis lekérdezés, de egyszerűbb, ha letöltjük a postot).
    
    // Figyelem: Mivel nincs külön getBulletinById ami pendinget is lekérdez,
    // de mi most tettük actívvá, ezért a getBulletinPosts "all" tartalmazni fogja!
    const allPosts = await getBulletinPosts("alberlet");
    const post = allPosts.find(p => p.id === params.id);
    
    if (post && post.kindId === 'alberlet' && post.cantonCode) {
      triggerAlberletRadars(post.cantonCode).catch(() => {});
    }
  }

  const origin = new URL(req.url).origin;
  return NextResponse.redirect(`${origin}/admin`);
}
