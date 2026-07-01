-- 0109 — Feldolgozott webhook-események (replay-/idempotencia-védelem).
-- A Paddle webhookok újrajátszhatók (vagy a hálózat duplikálhat); a feldolgozott
-- event_id-kat itt jegyezzük, és a duplikátumot kihagyjuk. FONTOS: csak SIKERES
-- feldolgozás után jegyezzük → egy meghiúsult (500) esemény retry-ja újrafut.
-- Ez kezeli a `job_featured` egyetlen NEM-idempotens műveletét (a 30-napos
-- kiemelés meghosszabbítását egy webhook-ismétléssel), a retry/legit újravásárlás
-- törése nélkül (azoknak más az event_id-juk).
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id     TEXT PRIMARY KEY,
  processed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
