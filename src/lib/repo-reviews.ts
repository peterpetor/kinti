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
  owner_response: string | null; owner_responded_at: string | null;
  moderation_status: number; moderation_decision_at: string | null;
  moderation_decided_by: string | null; hidden: number;
  helpful_count?: number;
}

function toReview(r: ReviewRow): Review {
  return {
    id: r.id, businessId: r.business_id, rating: r.rating,
    body: r.body, reviewerName: r.reviewer_name, publishedAt: r.published_at,
    ownerResponse: r.owner_response,
    ownerRespondedAt: r.owner_responded_at,
    helpfulCount: r.helpful_count ?? 0,
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
              r.manage_token, r.email, r.owner_response, r.owner_responded_at,
              COUNT(v.ip_hash) AS helpful_count
       FROM reviews r
       LEFT JOIN review_helpful_votes v ON v.review_id = r.id
       WHERE r.business_id = ? AND r.hidden = 0 AND r.moderation_status = 1
       GROUP BY r.id
       ORDER BY helpful_count DESC, r.published_at DESC`,
    )
    .bind(businessId).all<ReviewRow>();
  return results.map(toReview);
}

/**
 * „Hasznos volt" szavazat egy véleményre — account nélkül, IP-hash dedup
 * (1 szavazat / készülék-IP / vélemény). Az event-RSVP mintáját követi.
 * @returns added=false, ha erről az IP-ről már volt szavazat.
 */
export async function addReviewHelpful(
  reviewId: string,
  ipHash: string,
): Promise<{ ok: boolean; added: boolean; total: number }> {
  const db = getDB();
  const review = await db
    .prepare("SELECT id FROM reviews WHERE id = ? AND hidden = 0 AND moderation_status = 1")
    .bind(reviewId)
    .first<{ id: string }>();
  if (!review) return { ok: false, added: false, total: 0 };

  const res = await db
    .prepare("INSERT OR IGNORE INTO review_helpful_votes (review_id, ip_hash) VALUES (?, ?)")
    .bind(reviewId, ipHash)
    .run();
  const added = (res.meta.changes ?? 0) > 0;

  const cntRow = await db
    .prepare("SELECT COUNT(*) AS cnt FROM review_helpful_votes WHERE review_id = ?")
    .bind(reviewId)
    .first<{ cnt: number }>();

  return { ok: true, added, total: cntRow?.cnt ?? 0 };
}

export async function deleteReviewByManageToken(manageToken: string): Promise<string | null> {
  const row = await getDB().prepare("SELECT business_id FROM reviews WHERE manage_token = ?").bind(manageToken).first<{ business_id: string }>();
  if (!row) return null;
  await getDB().prepare("DELETE FROM reviews WHERE manage_token = ?").bind(manageToken).run();
  return row.business_id;
}

export async function getReviewByManageToken(manageToken: string): Promise<(Review & { businessName: string | null; email: string; manageToken: string; }) | null> {
  const row = await getDB()
    .prepare(
      `SELECT r.id, r.business_id, r.rating, r.body, r.reviewer_name,
              r.published_at, r.manage_token, r.email, r.owner_response, r.owner_responded_at, b.name AS business_name
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

export async function getReviewSummaryById(id: string): Promise<{ id: string; businessId: string; reviewerName: string; body: string } | null> {
  const row = await getDB()
    .prepare("SELECT id, business_id, reviewer_name, body FROM reviews WHERE id = ? AND hidden = 0")
    .bind(id).first<{ id: string; business_id: string; reviewer_name: string; body: string }>();
  if (!row) return null;
  return { id: row.id, businessId: row.business_id, reviewerName: row.reviewer_name, body: row.body };
}

export async function setReviewOwnerResponse(reviewId: string, ownerUserId: string, response: string | null): Promise<boolean> {
  const res = await getDB()
    .prepare(
      `UPDATE reviews SET owner_response = ?, owner_responded_at = CASE WHEN ? IS NULL THEN NULL ELSE datetime('now') END
       WHERE id = ? AND business_id IN (SELECT id FROM businesses WHERE owner_user_id = ?)`
    )
    .bind(response, response, reviewId, ownerUserId).run();
  return (res.meta.changes ?? 0) > 0;
}
