"use client";

import { Icon } from "@/components/ui";
import { BottomSheet, SheetRow } from "./bottom-sheet";
import { googleCalendarUrl, downloadIcs, type CalendarEvent } from "@/lib/calendar";

/**
 * „Add a naptáradhoz" alsó lap — Google Naptár link + .ics letöltés (Apple
 * Calendar / Outlook). Vezérelt (open/onClose), eseményenként újrahasználható.
 */
export function AddToCalendar({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}) {
  const gcal = event ? googleCalendarUrl(event) : null;

  return (
    <BottomSheet open={open && !!event} onClose={onClose} title="Add a naptáradhoz">
      <div className="space-y-2">
        {gcal && (
          <SheetRow
            href={gcal}
            onClick={onClose}
            badgeColor="#4285F4"
            icon={<Icon name="calendar" size={16} strokeWidth={2.2} />}
            label="Google Naptár"
          />
        )}
        <SheetRow
          onClick={() => {
            if (event) downloadIcs(event);
            onClose();
          }}
          badgeColor="#1d4434"
          icon={<Icon name="calendar" size={16} strokeWidth={2.2} />}
          label="Apple / Outlook (.ics)"
        />
      </div>
    </BottomSheet>
  );
}
