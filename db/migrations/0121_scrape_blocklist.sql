-- 0121 — Scrape-védelem: IP-tiltólista (honeypot + későbbi manuális tiltás).
--
-- A honeypot-csapdába lépő (rejtett linket követő) robotok IP-jét ide jegyezzük,
-- és a védett végpontok (bulk lista, kontakt) ez alapján 403-at adnak. Privacy:
-- NEM nyers IP, hanem az `ip_hash` (a projekt hashIp() SHA-256 hasheje) tárolódik
-- — a rate-limit-naplóval azonos, PII-mentes minta (privacy-no-server-identity).
CREATE TABLE IF NOT EXISTS scrape_blocklist (
  ip_hash TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT 'honeypot',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
