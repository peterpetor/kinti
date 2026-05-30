/**
 * Eseménynaptár közös validációk.
 */

import { findProfanityInFields } from "./profanity";

export const EVENT_LIMITS = {
  titleMin: 5,
  titleMax: 100,
  venueMax: 100,
  descriptionMax: 1000,
  emailMax: 254,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export interface EventFormInput {
  email?: unknown;
  title?: unknown;
  eventDate?: unknown;
  startTime?: unknown;
  venue?: unknown;
  tag?: unknown;
  description?: unknown;
  imageKey?: unknown;
  website?: unknown; // honeypot
  acceptTerms?: unknown;
  ageConfirmed?: unknown;
}

export interface ValidatedEventInput {
  email: string;
  title: string;
  eventDate: string;
  startTime: string;
  venue: string;
  tag: string;
  description: string | null;
  imageKey: string | null;
}

export type EventValidationError = { field: keyof EventFormInput; message: string };

export function validateEventInput(
  input: EventFormInput,
): { ok: true; value: ValidatedEventInput } | { ok: false; errors: EventValidationError[] } {
  const errors: EventValidationError[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  // Honeypot bot-trap
  if (str(input.website).length > 0) {
    return { ok: false, errors: [{ field: "website", message: "Hibás kérés." }] };
  }

  // Email OPCIONÁLIS (local-first mód)
  const email = str(input.email).toLowerCase();
  if (email) {
    if (email.length > EVENT_LIMITS.emailMax)
      errors.push({ field: "email", message: "Túl hosszú email-cím." });
    else if (!EMAIL_RE.test(email))
      errors.push({ field: "email", message: "Érvénytelen email-cím." });
  }

  const title = str(input.title);
  if (title.length < EVENT_LIMITS.titleMin)
    errors.push({ field: "title", message: `Legalább ${EVENT_LIMITS.titleMin} karakter.` });
  else if (title.length > EVENT_LIMITS.titleMax)
    errors.push({ field: "title", message: `Legfeljebb ${EVENT_LIMITS.titleMax} karakter.` });

  const eventDate = str(input.eventDate);
  if (!eventDate) errors.push({ field: "eventDate", message: "Dátum kiválasztása kötelező." });
  else if (!DATE_RE.test(eventDate))
    errors.push({ field: "eventDate", message: "Érvénytelen dátum formátum (ÉÉÉÉ-HH-NN)." });

  const startTime = str(input.startTime);
  if (!startTime) errors.push({ field: "startTime", message: "Kezdési idő kötelező." });
  else if (!TIME_RE.test(startTime))
    errors.push({ field: "startTime", message: "Érvénytelen idő formátum (ÓÓ:PP)." });

  const venue = str(input.venue);
  if (!venue) errors.push({ field: "venue", message: "Helyszín megadása kötelező." });
  else if (venue.length > EVENT_LIMITS.venueMax)
    errors.push({ field: "venue", message: `Legfeljebb ${EVENT_LIMITS.venueMax} karakter.` });

  const tag = str(input.tag);
  if (!tag) errors.push({ field: "tag", message: "Típus választása kötelező." });

  const description = str(input.description);
  if (description.length > EVENT_LIMITS.descriptionMax)
    errors.push({ field: "description", message: `Legfeljebb ${EVENT_LIMITS.descriptionMax} karakter.` });

  if (input.acceptTerms !== true) {
    errors.push({
      field: "acceptTerms",
      message: "Az ÁSZF és az Adatkezelési Tájékoztató elfogadása kötelező.",
    });
  }
  if (input.ageConfirmed !== true) {
    errors.push({
      field: "ageConfirmed",
      message: "A Szolgáltatást csak 18. életévüket betöltött személyek vehetik igénybe.",
    });
  }

  // Hungarian Profanity Filter
  if (!errors.length) {
    const dirty = findProfanityInFields({ title, venue, description });
    if (dirty) {
      errors.push({
        field: dirty.field as keyof EventFormInput,
        message:
          "Az esemény leírása olyan szót tartalmaz, amit nem engedélyezünk. " +
          "Kérlek, fogalmazd meg másképp.",
      });
    }
  }

  const imageKey = str(input.imageKey) || null;

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      email,
      title,
      eventDate,
      startTime,
      venue,
      tag,
      description: description || null,
      imageKey,
    },
  };
}
