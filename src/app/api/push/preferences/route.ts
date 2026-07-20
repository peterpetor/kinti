import { NextResponse } from "next/server";
import { getPushPreferences, updatePushPreferences, getPushRemitPref, updatePushRemitPref } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET  /api/push/preferences?endpoint=... — a kanton-push kategória-preferenciái.
 * PATCH /api/push/preferences — { endpoint, notifyBusiness, notifyJob, … } frissítés.
 *
 * A feliratkozást az endpoint azonosítja (a böngésző push-feliratkozása); nincs
 * account. Csak a saját endpointját tudja módosítani, aki birtokolja.
 */
export async function GET(req: Request) {
  const endpoint = new URL(req.url).searchParams.get("endpoint")?.trim() ?? "";
  if (!/^https:\/\//.test(endpoint)) {
    return NextResponse.json({ error: "Hiányzó endpoint." }, { status: 400 });
  }
  const [prefs, notifyRemit] = await Promise.all([getPushPreferences(endpoint), getPushRemitPref(endpoint)]);
  return NextResponse.json(
    {
      subscribed: !!prefs,
      preferences: prefs ?? { notifyBusiness: true, notifyJob: true, notifyDaily: true, notifyKeresek: true, notifyHousing: true },
      // Az árfolyam-riasztás KÜLÖN mező (opt-in, alapból false) — ld. repo-misc.
      notifyRemit,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    endpoint?: string; notifyBusiness?: boolean; notifyJob?: boolean; notifyDaily?: boolean; notifyKeresek?: boolean; notifyHousing?: boolean;
    notifyRemit?: boolean;
  };
  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!/^https:\/\//.test(endpoint)) {
    return NextResponse.json({ error: "Hiányzó endpoint." }, { status: 400 });
  }

  // Az 5 régió-kategória EGYBEN íródik (a hiányzó mezőt `!== false` bekapcsoltnak
  // veszi) — ezért CSAK akkor nyúlunk hozzá, ha a hívó ténylegesen küldött
  // ilyen mezőt. Így az asszisztens „csak remit" hívása nem kapcsol be mindent.
  // (A `notifyEvent` KIVEZETVE — egy régi, cache-elt kliens még küldheti, de a
  // szerver már nem írja: a notify_event oszlop érintetlen marad.)
  const LEGACY = ["notifyBusiness", "notifyJob", "notifyDaily", "notifyKeresek", "notifyHousing"] as const;
  const hasLegacy = LEGACY.some((k) => k in body);

  let ok = true;
  if (hasLegacy) {
    ok = await updatePushPreferences(endpoint, {
      notifyBusiness: body.notifyBusiness !== false,
      notifyJob: body.notifyJob !== false,
      notifyDaily: body.notifyDaily !== false,
      notifyKeresek: body.notifyKeresek !== false,
      notifyHousing: body.notifyHousing !== false,
    });
  }
  // Az árfolyam-riasztás FÜGGETLEN, részleges frissítés (opt-in).
  if (typeof body.notifyRemit === "boolean") {
    const okRemit = await updatePushRemitPref(endpoint, body.notifyRemit);
    ok = hasLegacy ? ok && okRemit : okRemit;
  }

  if (!ok) {
    return NextResponse.json({ error: "Nincs ilyen feliratkozás." }, { status: 404 });
  }
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
