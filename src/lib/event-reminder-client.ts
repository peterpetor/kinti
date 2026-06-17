"use client";

/**
 * RSVP után push-emlékeztető kérése egy eseményre (24h + 1h a kezdés előtt).
 * Best-effort: csak ha van élő push-feliratkozás; sosem blokkolja az RSVP-t.
 */
export async function scheduleEventReminder(eventId: string): Promise<void> {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await fetch(`/api/events/${eventId}/reminder`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } catch {
    /* az emlékeztető extra — sose blokkolja az RSVP-t */
  }
}
