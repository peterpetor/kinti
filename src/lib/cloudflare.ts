import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * A natív Cloudflare bindingek (D1 + R2) típusos elérése next-on-pages alatt.
 *
 * FONTOS: csak kérés-hatókörben működik — `export const runtime = "edge"`
 * route handlerből vagy szerver-komponensből, renderelés közben hívható.
 * Build-időben / statikus prerendernél nincs kérés-kontextus, ezért dob; az
 * adatfüggő oldalakat ezért dinamikusan rendereljük (force-dynamic / no-store).
 *
 * A bindingeket a wrangler.toml definiálja, a típusaikat az env.d.ts
 * (CloudflareEnv interfész), amit a `npm run cf-typegen` frissíthet.
 */
export function getCloudflareEnv(): CloudflareEnv {
  return getRequestContext().env;
}

/** D1 relációs adatbázis (categories, businesses, events, bulletin_posts, …). */
export function getDB(): D1Database {
  return getCloudflareEnv().DB;
}

/** R2 média-tároló (vállalkozói logók, hirdetés-képek). */
export function getMediaBucket(): R2Bucket {
  return getCloudflareEnv().MEDIA;
}
