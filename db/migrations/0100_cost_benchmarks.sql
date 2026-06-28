-- 0100 — „Mennyit költesz?" anonim megélhetési-benchmark (a bér/lakbér Iránytű párja).
-- Egy generikus tábla MINDEN havi költség-kategóriához (Krankenkasse, élelmiszer,
-- közlekedés, internet+mobil, gyerek). NEM AI, NEM tanács — csak a közösség által
-- beadott, aggregált adat (medián + percentilis). Az ip_hash CSAK rate-limit / 1 adat
-- per kategória (nem identitás). A lakbérnek külön táblája van (rent_benchmarks).
CREATE TABLE IF NOT EXISTS cost_benchmarks (
  id           TEXT PRIMARY KEY,
  country_code TEXT NOT NULL DEFAULT 'CH',
  canton_code  TEXT NOT NULL,             -- kanton/Bundesland kód (régió)
  category     TEXT NOT NULL,             -- krankenkasse | kaja | kozlekedes | internet_mobil | gyerek
  amount       INTEGER NOT NULL,          -- havi összeg a helyi pénznemben (CH: CHF, AT/DE: EUR)
  ip_hash      TEXT NOT NULL,             -- CSAK rate-limit / 1 beküldés per (ip,ország,kategória)
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cost_benchmarks_region ON cost_benchmarks(country_code, canton_code, category);
CREATE INDEX IF NOT EXISTS idx_cost_benchmarks_iphash ON cost_benchmarks(ip_hash, country_code, category);
