/**
 * JSON-LD biztonsagos szerializalas a <script type="application/ld+json"> tagbe.
 *
 * A JSON.stringify NEM escape-eli a `<`-ot. Egy user-input mezo tartalmazhat
 * </script><script>... reszletet, ami kitorne a script-tagbol es XSS-t okozna.
 *
 * Cserelt karakterek:
 *   <  >  &  '
 *   U+2028 LINE SEPARATOR
 *   U+2029 PARAGRAPH SEPARATOR
 *
 * Forras: OWASP Cheat Sheet - Output Encoding for JavaScript Contexts.
 */
import type { Job, Employer } from "./types";

const LS_REGEX = new RegExp(String.fromCharCode(0x2028), "g");
const PS_REGEX = new RegExp(String.fromCharCode(0x2029), "g");

export function safeJsonLdStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/&/g, "\u0026")
    .replace(/'/g, "\u0027")
    .replace(LS_REGEX, "\u2028")
    .replace(PS_REGEX, "\u2029");
}

/** A bels\u0151 employment_type \u2192 Google for Jobs employmentType enum. */
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  temporary: "TEMPORARY",
};

/** SQLite datetime ("YYYY-MM-DD HH:MM:SS") vagy ISO \u2192 ISO 8601. Hib\u00e1s \u2192 null. */
function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T") + "Z";
  const t = new Date(normalized).getTime();
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

const HOUSING_TYPE_NAME: Record<string, string> = {
  room_offered: "Kiad\u00f3 szoba",
  apartment_offered: "Kiad\u00f3 lak\u00e1s",
};

const HOUSING_ACCOMMODATION_TYPE: Record<string, string> = {
  room_offered: "Room",
  apartment_offered: "Apartment",
};

/**
 * schema.org RealEstateListing egy alb\u00e9rlet-b\u00f6rze hirdet\u00e9shez (AEO-strat\u00e9gia,
 * ld. mem\u00f3ria [[aeo-strategy]] 2. pont). CSAK a felk\u00edn\u00e1lt t\u00edpusokra
 * ("room_offered"/"apartment_offered") \u00e9rtelmes \u2014 a "looking_for_room" (keres\u00e9s)
 * NEM ing\u00e1tlan-hirdet\u00e9s, arra a h\u00edv\u00f3 ne h\u00edvja ezt.
 *
 * \u26a0\ufe0f ANTI-LEAK: a hirdet\u00e9s kontaktja SOSEM ker\u00fcl ide (a repo-housing.ts
 * kapu\u0151r-szab\u00e1lya szerint a lista-vet\u00fclet is kontakt n\u00e9lk\u00fcli) \u2014 csak
 * v\u00e1ros/r\u00e9gi\u00f3/orsz\u00e1g + \u00e1r + t\u00edpus, ami m\u00e1r a lista-k\u00e1rty\u00e1n is publikus.
 */
export function housingListingJsonLd(opts: {
  id: string;
  type: string;
  city: string;
  regionName: string | null;
  country: string;
  price: number;
  currency: string;
  createdAt: number; // unixepoch (mp)
  url: string;
}): Record<string, unknown> {
  const { id, type, city, regionName, country, price, currency, createdAt, url } = opts;
  const accommodationType = HOUSING_ACCOMMODATION_TYPE[type] ?? "Accommodation";
  const name = `${HOUSING_TYPE_NAME[type] ?? "Hirdet\u00e9s"} \u2014 ${city}`;

  return {
    "@context": "https://schema.org/",
    "@type": "RealEstateListing",
    name,
    url,
    datePosted: new Date(createdAt * 1000).toISOString(),
    identifier: {
      "@type": "PropertyValue",
      name: "kinti.app",
      value: id,
    },
    about: {
      "@type": accommodationType,
      name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        ...(regionName ? { addressRegion: regionName } : {}),
        addressCountry: country.toUpperCase(),
      },
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
    },
  };
}

/**
 * Google for Jobs (schema.org JobPosting) struktur\u00e1lt adat egy \u00e1ll\u00e1shirdet\u00e9shez.
 * A `cantonRegion` a kanton megjelen\u00edtend\u0151 neve (ha ismert) az addressRegion-h\u00f6z.
 * Csak j\u00f3v\u00e1hagyott, akt\u00edv hirdet\u00e9sre add ki.
 */
export function jobPostingJsonLd(opts: {
  job: Job;
  employer: Employer | null;
  cantonRegion: string | null;
}): Record<string, unknown> {
  const { job, employer, cantonRegion } = opts;

  const descriptionParts = [job.description];
  if (job.requirements) descriptionParts.push(`Elv\u00e1r\u00e1sok: ${job.requirements}`);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionParts.join("\n\n"),
    datePosted: toIso(job.createdAt) ?? new Date().toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: employer?.companyName ?? "Magyar munk\u00e1ltat\u00f3",
      ...(employer?.website ? { sameAs: employer.website } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        ...(cantonRegion ? { addressRegion: cantonRegion } : {}),
        // A hirdet\u00e9s ORSZ\u00c1GA (CH/AT/DE/NL) \u2014 NEM hardcode CH, k\u00fcl\u00f6nben a nem-sv\u00e1jci
        // \u00e1ll\u00e1sok rossz orsz\u00e1ggal ker\u00fclnek a Google for Jobs struktur\u00e1lt adatba.
        addressCountry: (job.country || "CH").toUpperCase(),
      },
    },
    identifier: {
      "@type": "PropertyValue",
      name: employer?.companyName ?? "kinti.app",
      value: job.id,
    },
    directApply: true,
  };

  const validThrough = toIso(job.expiresAt);
  if (validThrough) jsonLd.validThrough = validThrough;

  const employmentType = EMPLOYMENT_TYPE_MAP[job.employmentType];
  if (employmentType) jsonLd.employmentType = employmentType;

  // baseSalary csak akkor, ha van val\u00f3s b\u00e9rs\u00e1v (k\u00fcl\u00f6nben a Google "hi\u00e1nyos"-k\u00e9nt jel\u00f6lheti).
  if (job.salaryMin != null && job.salaryMax != null) {
    const currency = job.currency === "EUR" ? "EUR" : "CHF";
    const unitText = job.currency === "CHF_HOUR" ? "HOUR" : "MONTH";
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText,
      },
    };
  }

  return jsonLd;
}
