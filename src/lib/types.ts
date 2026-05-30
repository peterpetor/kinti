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
  openNow: boolean;
  openText: string | null;
  yearsHere: number | null;
  languages: string[];
  photo: string | null;
  accentPhoto: string | null;
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
}

export interface BulletinKind {
  id: string;
  label: string;
  color: string | null;
  sortOrder: number;
}

export interface BulletinPost {
  id: string;
  kindId: string;
  title: string;
  meta: string | null;
  ageText: string | null;
  poster: string | null;
  posterUserId: string | null;
  imageKey: string | null;
  /** Hosszabb leírás (a 0002 óta). */
  body: string | null;
  /** Lejárati idő (ISO datetime); a publikus listán ami lejárt, nem jelenik meg. */
  expiresAt: string | null;
  /** Mikor publikálták (ISO datetime). */
  publishedAt: string | null;
  /** Svájci kanton kódja (pl. ZH, BE) */
  cantonCode: string | null;
  /** Strukturált ár (egész CHF) — rendezéshez. NULL, ha nincs ára. */
  price: number | null;
  /** A feladó email-je — a kezelő oldalon mutatható. */
  email: string | null;
  /** Telefonszám (opcionális) — a publikus kártyán tap-to-call gomb. */
  phone: string | null;
  /** WhatsApp szám (opcionális) — ha NULL, a phone-ra megy a WA-link. */
  whatsapp: string | null;
  /** Manage-token — a kezelő oldal URL-jéhez. */
  manageToken: string | null;
  /** Elküldték-e már a lejárati figyelmeztető emailt. */
  expiryWarningSent: boolean;
  /** Csatolt taxonómia (JOIN bulletin_kinds). */
  kind?: BulletinKind;
}

/** Megerősítésre váró hirdetés (bulletin_drafts) — a megerősítőnek küldve. */
export interface BulletinDraft {
  id: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  kindId: string;
  title: string;
  meta: string | null;
  body: string | null;
  poster: string | null;
  confirmToken: string;
  manageToken: string;
  expiresAt: string;
  createdAt: string;
  /** Audit-trail: melyik jogi-szöveg-verziót fogadta el a feladó. */
  termsVersion: string | null;
  /** Audit-trail: az elfogadás időbélyege. */
  acceptedTermsAt: string | null;
  /** Audit-trail: 18+ nyilatkozat. */
  ageConfirmed: boolean;
  /** Audit-trail: SHA-256(IP) — nyers IP-t nem tárolunk. */
  ipHash: string | null;
  /** Az R2 kép(ek) kulcsa(i) — JSON string tömb vagy egyedi kulcs */
  imageKey: string | null;
  /** Svájci kanton kódja (pl. ZH, BE) */
  cantonCode: string | null;
  /** Strukturált ár (egész CHF) — rendezéshez. NULL, ha nincs ára. */
  price: number | null;
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
