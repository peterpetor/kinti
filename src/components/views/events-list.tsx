import type { KintiEvent } from "@/lib/types";

/**
 * MEGJEGYZÉS: ez egy korai, NEM használt vázlat-komponens. A valódi
 * eseménylista a `community-view.tsx` `EventsList`-jében él (RSVP-vel,
 * kiemelt eseménnyel). Ezt vagy fejleszd tovább és kösd be, vagy törölhető.
 */
export default function EventsList({ events }: { events: KintiEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="rounded-md border bg-surface p-4">
          <h3 className="font-bold">{event.title}</h3>
          <p className="text-sm text-ink-muted">{event.eventDate}</p>
        </div>
      ))}
    </div>
  );
}
