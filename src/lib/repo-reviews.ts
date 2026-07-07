/**
 * repo-reviews.ts — Vélemények (reviews) adatrétege.
 */
import { getDB } from "./cloudflare";
import type { Review, ReviewDraft } from "./types";
import { bool } from "./repo-shared";

interface ReviewDraftRow {
  id: string; business_id: string; email: string; rating: number; body: string;
  reviewer_name: string; confirm_token: string; manage_token: string;
  expires_at: string; created_at: string; terms_version: string | null;
  accepted_terms_at: string | null; age_confirmed: number | null; ip_hash: string | null;
}

function toReviewDraft(r: ReviewDraftRow): ReviewDraft {
  return {
    id: r.id, businessId: r.business_id, email: r.email, rating: r.rating,
    body: r.body, reviewerName: r.reviewer_name, confirmToken: r.confirm_token,
    manageToken: r.manage_token, expiresAt: r.expires_at, createdAt: r.created_at,
    termsVersion: r.terms_version, acceptedTermsAt: r.accepted_terms_at,
    ageConfirmed: r.age_confirmed === 1, ipHash: r.ip_hash,
  };
}

interface ReviewRow {
  id: string; business_id: string; email: string; rating: number; body: string;
  reviewer_name: string; published_at: string; manage_token: string;
  moderation_status: number; moderation_decision_at: string | null;
  moderation_decided_by: string | null; hidden: number;
  owner_response: string | null; owner_responded_at: string | null;
}

function toReview(r: ReviewRow): Review {
  return {
    id: r.id, businessId: r.business_id, rating: r.rating,
    body: r.body, reviewerName: r.reviewer_name, publishedAt: r.published_at,
    ownerResponse: r.owner_response ?? null, ownerRespondedAt: r.owner_responded_at ?? null,
  };
}

export interface PublishReviewInput {
  id: string; businessId: string; email: string; rating: number; body: string;
  reviewerName: string; manageToken: string; termsVersion: string | null;
  acceptedTermsAt: string | null; ageConfirmed: number; ipHash: string | null;
}

export interface ReviewDraftInput {
  id: string; businessId: string; email: string; rating: number; body: string;
  reviewerName: string; confirmToken: string; manageToken: string; expiresAt: string;
  termsVersion: string; acceptedTermsAt: string; ageConfirmed: number; ipHash: string | null;
}

export async function createReviewDraft(input: ReviewDraftInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO review_drafts
       (id, business_id, email, rating, body, reviewer_name,
        confirm_token, manage_token, expires_at,
        terms_version, accepted_terms_at, age_confirmed, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(input.id, input.businessId, input.email.toLowerCase(), input.rating, input.body,
      input.reviewerName, input.confirmToken, input.manageToken, input.expiresAt,
      input.termsVersion, input.acceptedTermsAt, input.ageConfirmed, input.ipHash)
    .run();
}

export async function getReviewDraftByConfirmToken(confirmToken: string): Promise<ReviewDraft | null> {
  const row = await getDB()
    .prepare(`SELECT * FROM review_drafts WHERE confirm_token = ? AND expires_at > datetime('now')`)
    .bind(confirmToken).first<ReviewDraftRow>();
  return row ? toReviewDraft(row) : null;
}

export async function deleteReviewDraft(id: string): Promise<void> {
  await getDB().prepare("DELETE FROM review_drafts WHERE id = ?").bind(id).run();
}

export async function hasReviewByEmail(businessId: string, email: string): Promise<boolean> {
  const row = await getDB()
    .prepare(`SELECT 1 AS one FROM reviews WHERE business_id = ? AND lower(email) = lower(?) LIMIT 1`)
    .bind(businessId, email).first<{ one: number }>();
  return !!row;
}

/** Van-e már vélemény ugyanerről az ipHash-ről ehhez a vállalkozáshoz? Az email
 *  nélküli („local-first") beküldés dedup-jához — különben egy hálózat korlátlanul
 *  küldhet (a moderációs sort elárasztva). */
export async function hasReviewByIpHash(businessId: string, ipHash: string): Promise<boolean> {
  const row = await getDB()
    .prepare(`SELECT 1 AS one FROM reviews WHERE business_id = ? AND ip_hash = ? LIMIT 1`)
    .bind(businessId, ipHash).first<{ one: number }>();
  return !!row;
}

export async function publishReview(input: PublishReviewInput): Promise<void> {
  await getDB()
    .prepare(
      `INSERT INTO reviews
       (id, business_id, email, rating, body, reviewer_name, manage_token,
        published_at, terms_version, accepted_terms_at, age_confirmed, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)`,
    )
    .bind(input.id, input.businessId, input.email.toLowerCase(), input.rating,
      input.body, input.reviewerName, input.manageToken, input.termsVersion,
      input.acceptedTermsAt, input.ageConfirmed, input.ipHash)
    .run();
}

export async function getReviewsByBusiness(businessId: string): Promise<Review[]> {
  const { results } = await getDB()
    .prepare(
      `SELECT r.id, r.business_id, r.rating, r.body, r.reviewer_name, r.published_at,
              r.owner_response, r.owner_responded_at
       FROM reviews r
       WHERE r.business_id = ? AND r.hidden = 0 AND r.moderation_status = 1
       ORDER BY r.published_at DESC`,
    )
    .bind(businessId).all<ReviewRow>();
  return results.map(toReview);
}

/**
 * A vállalkozás tulajdonosának nyilvános válasza egy véleményre (Google-stílusú
 * bizalmi jel). A hívó FELELŐSSÉGE a tulajdonjog igazolása (manage-token vagy
 * Clerk owner) — ez a fn a `businessId`-re is szűr, hogy idegen vélemény ne
 * legyen módosítható. `response === null` → a válasz törlése.
 * @returns true, ha a vélemény a céghez tartozott és frissült.
 */
export async function setReviewOwnerResponse(
  reviewId: string,
  businessId: string,
  response: string | null,
): Promise<boolean> {
  const trimmed = response?.trim() || null;
  const res = await getDB()
    .prepare(
      `UPDATE reviews
         SET owner_response = ?, owner_responded_at = ${trimmed ? "datetime('now')" : "NULL"}
       WHERE id = ? AND business_id = ? AND hidden = 0 AND moderation_status = 1`,
    )
    .bind(trimmed, reviewId, businessId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteReviewByManageToken(manageToken: string): Promise<string | null> {
  const row = await getDB().prepare("SELECT business_id FROM reviews WHERE manage_token = ?").bind(manageToken).first<{ business_id: string }>();
  if (!row) return null;
  await getDB().prepare("DELETE FROM reviews WHERE manage_token = ?").bind(manageToken).run();
  return row.business_id;
}

/** A megjelenő név átírása a kezelő-tokennel (üres név = vissza az auto-álnévre). */
export async function updateReviewNameByManageToken(manageToken: string, reviewerName: string): Promise<boolean> {
  const res = await getDB().prepare("UPDATE reviews SET reviewer_name = ? WHERE manage_token = ?").bind(reviewerName, manageToken).run();
  return (res.meta.changes ?? 0) > 0;
}

export async function getReviewByManageToken(manageToken: string): Promise<(Review & { businessName: string | null; email: string; manageToken: string; }) | null> {
  const row = await getDB()
    .prepare(
      `SELECT r.id, r.business_id, r.rating, r.body, r.reviewer_name,
              r.published_at, r.manage_token, r.email, b.name AS business_name
       FROM reviews r LEFT JOIN businesses b ON b.id = r.business_id
       WHERE r.manage_token = ?`,
    )
    .bind(manageToken).first<ReviewRow & { business_name: string | null }>();
  if (!row) return null;
  return { ...toReview(row), businessName: row.business_name, email: row.email, manageToken: row.manage_token };
}

export async function recomputeBusinessRating(businessId: string): Promise<void> {
  // Egyetlen igazságforrás: a publikus rating/szám CSAK a látható (hidden=0),
  // jóváhagyott (moderation_status=1) véleményekből számolódik — pontosan azokból,
  // amiket a getReviewsByBusiness is listáz. Így nincs „rating vélemény nélkül".
  const row = await getDB()
    .prepare("SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg FROM reviews WHERE business_id = ? AND hidden = 0 AND moderation_status = 1")
    .bind(businessId).first<{ cnt: number; avg: number }>();
  const cnt = row?.cnt ?? 0;
  const avg = Math.round((row?.avg ?? 0) * 10) / 10;
  await getDB().prepare("UPDATE businesses SET rating = ?, reviews = ?, updated_at = datetime('now') WHERE id = ?").bind(avg, cnt, businessId).run();
}

export async function setReviewHidden(id: string, hidden: boolean): Promise<string | null> {
  const row = await getDB().prepare("SELECT business_id FROM reviews WHERE id = ?").bind(id).first<{ business_id: string }>();
  if (!row) return null;
  await getDB().prepare("UPDATE reviews SET hidden = ? WHERE id = ?").bind(hidden ? 1 : 0, id).run();
  return row.business_id;
}

export async function deleteReviewById(id: string): Promise<string | null> {
  const row = await getDB().prepare("SELECT business_id FROM reviews WHERE id = ?").bind(id).first<{ business_id: string }>();
  if (!row) return null;
  await getDB().prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
  return row.business_id;
}

/**
 * Egy vélemény kivonata id alapján. Biztonság alapból: CSAK jóváhagyott
 * (moderation_status = 1) és nem rejtett véleményt ad vissza — így publikus /
 * AI-összefoglaló hívó nem szivárogtathat moderálás alatti vagy elutasított
 * tartalmat. Az admin-moderáció (decide route) `includeUnpublished: true`-val
 * hív, mert az elutasítás (status=2) UTÁN is szüksége van a businessId-re a
 * rating újraszámolásához.
 */
export async function getReviewSummaryById(
  id: string,
  opts?: { includeUnpublished?: boolean },
): Promise<{ id: string; businessId: string; reviewerName: string; body: string } | null> {
  const modClause = opts?.includeUnpublished ? "" : " AND moderation_status = 1";
  const row = await getDB()
    .prepare(`SELECT id, business_id, reviewer_name, body FROM reviews WHERE id = ? AND hidden = 0${modClause}`)
    .bind(id).first<{ id: string; business_id: string; reviewer_name: string; body: string }>();
  if (!row) return null;
  return { id: row.id, businessId: row.business_id, reviewerName: row.reviewer_name, body: row.body };
}

