/**
 * Megosztás-segédek — célzott gombokhoz (WhatsApp / Viber), amiket a kint élő
 * magyarok ténylegesen használnak, plusz a natív megosztás + link-másolás.
 */

/** WhatsApp megosztó URL (wa.me — app + web is kezeli). */
export function whatsappShareUrl(url: string, text: string): string {
  const msg = `${text}\n${url}`.trim();
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

/** Viber továbbküldés (scheme — telepített Viber appot nyit). */
export function viberShareUrl(url: string, text: string): string {
  const msg = `${text}\n${url}`.trim();
  return `viber://forward?text=${encodeURIComponent(msg)}`;
}

/** Telegram megosztó URL (t.me/share — app + web is kezeli). */
export function telegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** Facebook megosztó URL (sharer dialog). */
export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Link a vágólapra. */
export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/** Natív megosztás (ha elérhető). true = megosztva, false = nincs / megszakítva. */
export async function nativeShare(data: {
  url: string;
  title: string;
  text?: string;
}): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/** Elérhető-e a natív megosztás (a „Több" opció megjelenítéséhez). */
export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
