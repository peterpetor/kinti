import { NextResponse } from "next/server";
import { hashIp, hashEmail } from "./security";
import { isSubmitterBlocked } from "./repo";

/**
 * Központi guard a publikus submit-endpoint-okhoz.
 *
 * Ha az IP-hash VAGY az email-hash a `blocklist`-en aktívan szerepel,
 * 403-as választ adunk vissza, és a submit-en NEM megy tovább.
 *
 * Visszaadja:
 *   - `null`, ha a felhasználó NINCS tiltva → folytatható a submit
 *   - egy kész `NextResponse`-t, ami azonnal visszaadható a route-ról
 */
export async function checkBlocklistOrReject(params: {
  ip: string | null;
  email: string | null;
}): Promise<NextResponse | null> {
  const ipHash = await hashIp(params.ip);
  const emailHash = await hashEmail(params.email);
  const blocked = await isSubmitterBlocked({ ipHash, emailHash });
  if (!blocked) return null;
  return NextResponse.json(
    {
      error:
        "A beküldési képességed átmenetileg fel van függesztve. Ha hibát látsz, írj az info@kinti.app címre.",
    },
    { status: 403 },
  );
}
