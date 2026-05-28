import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Auth diagnosztika — csak átmeneti, login flow debug-hoz.
 * Megnyitva `kinti.app/api/dev/auth-debug` URL-en visszaadja, mit lát a szerver:
 * - cookie-k (név és hossz)
 * - auth() eredmény
 * - környezeti változók prefixei (a teljes kulcsot nem szivárogtatjuk)
 */
export async function GET(req: NextRequest) {
  const cookies: Record<string, number> = {};
  for (const c of req.cookies.getAll()) {
    cookies[c.name] = c.value.length;
  }

  let authResult: unknown;
  let authError: string | null = null;
  try {
    const a = await auth();
    authResult = {
      userId: a.userId ?? null,
      sessionId: a.sessionId ?? null,
      sessionClaims: a.sessionClaims ? Object.keys(a.sessionClaims) : null,
      orgId: a.orgId ?? null,
      has: !!a.userId,
    };
  } catch (e) {
    authError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sk = process.env.CLERK_SECRET_KEY ?? "";

  // Dekódoljuk az __session JWT header + payload claim-jeit (signature-t NEM verifikáljuk itt,
  // csak a metaadatokat akarjuk látni — melyik instance issued, mikor expires, stb.)
  const sessionRaw = req.cookies.get("__session")?.value ?? null;
  const sessionDecoded = sessionRaw ? decodeJwt(sessionRaw) : null;

  return new Response(
    JSON.stringify(
      {
        url: req.url,
        host: req.headers.get("host"),
        cookies,
        sessionJwt: sessionDecoded,
        auth: authResult,
        authError,
        env: {
          publishableKeyPrefix: pk.slice(0, 12) + "..." + pk.slice(-4),
          secretKeyPrefix: sk.slice(0, 12) + "..." + sk.slice(-4),
          publishableKeyDecodedDomain: tryDecodePk(pk),
        },
      },
      null,
      2,
    ),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

function tryDecodePk(pk: string): string | null {
  const m = pk.match(/^pk_(live|test)_(.+)$/);
  if (!m) return null;
  try {
    const decoded = atob(m[2]);
    return decoded;
  } catch {
    return null;
  }
}

function decodeJwt(jwt: string): unknown {
  const parts = jwt.split(".");
  if (parts.length !== 3) return { error: "not a JWT (parts != 3)", length: jwt.length };
  try {
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const now = Math.floor(Date.now() / 1000);
    return {
      header,
      payload,
      now,
      expiresInSeconds: payload.exp ? payload.exp - now : null,
      notBeforeInSeconds: payload.nbf ? payload.nbf - now : null,
      isExpired: payload.exp ? payload.exp < now : null,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
