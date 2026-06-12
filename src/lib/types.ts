/**
 * Domén-típusok — a D1 séma (0000_init.sql) camelCase tükrei. A 4. lépés
 * lekérdezései ezekké képezik le a sorokat (snake_case → camelCase, 0/1 → bool,
 * languages JSON → string[]).
 */

export interface Category {
  id: string;
  label: string;
  glyph: string | null;
  sortOrder: number;
}

export interface Business {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string | null;
  rating: number;
  reviews: number;
  distText: string | null;
  distMeters: number | null;
  address: string | null;
  phone: string | null;
  pinX: number;
  pinY: number;
  /** WGS84 szélesség (latitude) — térképi koordináta. */
  lat: number | null;
  /** WGS84 hosszúság (longitude) — térképi koordináta. */
  lng: number | null;
  featured: boolean;
  /** Adminisztrátor által manuálisan ellenőrzött magyar nyelvű vállalkozó. */
  verified: boolean;
  blurb: string | null;
  licenseNumber: string | null;
  openNow: boolean;
  openText: string | null;
  yearsHere: number | null;
  languages: string[];
  photo: string | null;
  accentPhoto: string | null;
  /** Szaknévsor PRO custom branding accent szín (előre definiált hex) vagy null. */
  accentColor?: string | null;
  logoKey: string | null;
  galleryKeys: string[];
  ownerUserId: string | null;
  /** A vállalkozás kapcsolati emailje (NEM publikus — csak claim/admin használat). */
  contactEmail?: string | null;
  workingHours?: string | null;
  socialLinks?: string | null;
  /** Email-only management token (a confirm-emailben kapja a feladó). */
  manageToken?: string | null;
  /** Profil-megnyitások összes idejű száma (analitika). */
  viewCount?: number;
  /** Telefonszám-kattintások összes idejű száma (analitika). */
  phoneClickCount?: number;

  /** Admin-moderation állapot: 0=pending, 1=approved, 2=rejected. */
  moderationStatus?: number;
  moderationDecisionAt?: string | null;
  moderationDecidedBy?: string | null;
  /** Utolsó szerkesztés ISO időbélyege (frissesség-jelzőhöz). */
  updatedAt?: string | null;
  /** Létrehozás ISO időbélyege. */
  createdAt?: string | null;
}

export interface KintiEvent {
  id: string;
  title: string;
  eventDate: string | null;
  dateDay: string | null;
  dateMonth: string | null;
  dateWeekday: string | null;
  startTime: string | null;
  venue: string | null;
  going: number;
  tag: string | null;
  color: string | null;
  description?: string | null;
  imageKey?: string | null;
  email?: string | null;
  status?: string;
  token?: string | null;
  manageToken?: string | null;
  moderationStatus?: number;
  moderationDecisionAt?: string | null;
  moderationDecidedBy?: string | null;
}


/** Publikus vélemény egy vállalkozásról (account nélküli, email-megerősítéses). */
export interface Review {
  id: string;
  businessId: string;
  rating: number;
  body: string;
  reviewerName: string;
  publishedAt: string;
  /** A vállalkozó nyilvános válasza (Google-stílusú). */
  ownerResponse: string | null;
  ownerRespondedAt: string | null;
  /** „Hasznos volt" szavazatok száma (account nélkül, IP-hash dedup). */
  helpfulCount: number;
}

/** Megerősítésre váró vélemény (review_drafts). */
export interface ReviewDraft {
  id: string;
  businessId: string;
  email: string;
  rating: number;
  body: string;
  reviewerName: string;
  confirmToken: string;
  manageToken: string;
  expiresAt: string;
  createdAt: string;
  termsVersion: string | null;
  acceptedTermsAt: string | null;
  ageConfirmed: boolean;
  ipHash: string | null;
}

/** iCal-feed sor az `event_feeds` táblából (admin által szerkeszthető). */
export interface EventFeed {
  id: string;
  url: string;
  label: string | null;
  enabled: boolean;
  sourceId: string; // ical:<hash>
  lastSyncedAt: string | null;
  lastError: string | null;
  eventsCount: number;
  createdAt: string;
}

export interface DashboardStats {
  weekViews: number;
  weekViewsDelta: string | null;
  weekClicks: number;
  weekClicksDelta: string | null;
  weekCalls: number;
  weekCallsDelta: string | null;
  /** 14 napos trendvonal a Sparkline-hoz. */
  trend: { date: string; views: number }[];
}

export interface Employer {
  id: string;
  ownerUserId: string;
  companyName: string;
  logoKey: string | null;
  description: string | null;
  website: string | null;
  contactEmail: string;
  billingEmail: string | null;
  subscriptionTier: string;
  stripeCustomerId: string | null;
  /** Opcionális svájci cég-azonosító (UID, pl. CHE-123.456.789). */
  companyUid: string | null;
  /** Admin által ellenőrzött, valódi cég → „Hiteles cég" badge. */
  verified: boolean;
  moderationStatus: number;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  /** Strukturált kanton-kód a szűréshez (lib/cantons.ts). Régi hirdetésnél null. */
  cantonCode: string | null;
  /** Szakma-id a szűréshez (lib/job-categories.ts). Régi hirdetésnél null. */
  category: string | null;
  /** A feladó nyilatkozata: bejelentett (AHV), legális foglalkoztatás. */
  legalAttested: boolean;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  requirements: string | null;
  status: string;
  moderationStatus: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  cvKey: string | null;
  /** Strukturált kanton-kód a jelölt-szűréshez (lib/cantons.ts). */
  cantonCode: string | null;
  /** Szakma-id a jelölt-szűréshez (lib/job-categories.ts). */
  category: string | null;
  aiModerationStatus: number;
  searchable: boolean;
  layer3OptIn: boolean;
  expectedSalaryMin: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerProfileId: string;
  message: string | null;
  status: string;
  createdAt: string;
}
