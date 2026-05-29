-- ===========================================================================
-- 0039_hofladen_spots — Helyi termelői pontok (Hofladen) térkép-modul.
--
-- 24h becsületkasszás/Twint-es farmer-boltok Svájcban. A felhasználók adhatnak
-- hozzá pontokat manage_token-nel (szerkesztés/törlés saját poszthoz).
-- TTL: nincs (a Hofladen-ek tartós helyek), de a tulajdonos / közösség
-- jelezheti ha bezárt.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS hofladen_spots (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  /** Szöveges helymegjelölés (pl. utca/falu). */
  location_name   TEXT,
  lat             REAL NOT NULL,
  lng             REAL NOT NULL,
  canton_code     TEXT,
  /** JSON tömb a HOFLADEN_CATEGORIES id-jeiből. */
  categories      TEXT NOT NULL DEFAULT '[]',
  /** JSON tömb a PAYMENT_METHODS id-jeiből. */
  payment_methods TEXT NOT NULL DEFAULT '[]',
  /** 24/7 elérhető? */
  open_24h        INTEGER NOT NULL DEFAULT 1,
  /** Szöveges nyitva tartás (pl. "H-Szo 8-19"). */
  open_text       TEXT,
  /** Szabad-szöveges megjegyzés (max 300 karakter). */
  note            TEXT,
  /** Manage-token (UUID). NULL ha a poszt seed-adat. */
  manage_token    TEXT,
  /** Anti-spam: SHA-256(IP). */
  ip_hash         TEXT,
  /** Jelentések száma (ha hibás info — a közösség jelenti). */
  reports_count   INTEGER NOT NULL DEFAULT 0,
  /** Ha 1, akkor a poszt el van rejtve (admin moderálás). */
  hidden          INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hofladen_canton ON hofladen_spots(canton_code);
CREATE INDEX IF NOT EXISTS idx_hofladen_manage_token ON hofladen_spots(manage_token);

-- ===========================================================================
-- SEED — 12 ismert / tipikus hofladen (csak közelítő koord., szöveges info).
-- A felhasználók később hozzáadhatnak / jelenthetnek pontosítást.
-- ===========================================================================

INSERT INTO hofladen_spots (id, name, location_name, lat, lng, canton_code, categories, payment_methods, open_24h, open_text, note) VALUES

('seed-zh-01', 'Hof Hardegg', 'Bonstetten ZH', 47.3174, 8.4733, 'ZH',
  '["milk","eggs","cheese","meat"]', '["cash","twint"]', 1, '24h Selbstbedienung',
  'Friss tej, tojás, helyi sajt. Becsületkassza + Twint.'),

('seed-zh-02', 'Milchhüsli Maur', 'Maur ZH', 47.3454, 8.6620, 'ZH',
  '["milk","eggs","bread"]', '["cash","twint"]', 1, '24h',
  'Tej-automata + friss kenyér reggel. Greifenseei tó közelében.'),

('seed-be-01', 'Beerenhof Roggwil', 'Roggwil BE', 47.2620, 7.7826, 'BE',
  '["fruits","honey"]', '["cash","twint"]', 1, '24h Selbstbedienung',
  'Idényfrissek (eper, málna), helyi méz. Téli szezonban szünetel.'),

('seed-be-02', 'Hofladen Gurnigel', 'Gurnigel BE', 46.7480, 7.4350, 'BE',
  '["cheese","meat","milk"]', '["cash"]', 1, '24h',
  'Alpesi sajt, házi szárított hús (Bündnerfleisch jellegű). Csak becsületkassza.'),

('seed-lu-01', 'Hofladen Buchrain', 'Buchrain LU', 47.0876, 8.3527, 'LU',
  '["milk","eggs","bread","vegetables"]', '["cash","twint"]', 1, '24h',
  'Vegyes kínálat — friss tej, tojás, idényzöldség.'),

('seed-sg-01', 'Hofladen Appenzeller', 'Appenzell AI', 47.3315, 9.4093, 'AI',
  '["cheese","meat","honey"]', '["cash","twint","card"]', 0, 'H-Szo 8-19',
  'Appenzeller sajt, helyi húskészítmények. Vasárnap zárva.'),

('seed-vs-01', 'Cave & Hofladen Salgesch', 'Salgesch VS', 46.3083, 7.5640, 'VS',
  '["wine","cheese","meat"]', '["cash","twint","card"]', 0, 'Cs-Szo 14-18',
  'Wallisi bor + Walliser Trockenfleisch. Csak hétvégén.'),

('seed-gr-01', 'Bio-Hof Tschuggen', 'Davos GR', 46.7950, 9.8208, 'GR',
  '["milk","cheese","honey"]', '["cash","twint"]', 1, '24h nyáron',
  'Bio alpesi tej + sajt. Téli hónapokban (12-3) zárva.'),

('seed-ag-01', 'Eier-Automat Birrwil', 'Birrwil AG', 47.2710, 8.1820, 'AG',
  '["eggs"]', '["cash","twint"]', 1, '24h',
  'Csak tojás-automata. Friss farm-tojás napi szállítással.'),

('seed-tg-01', 'Hofladen Tägerwilen', 'Tägerwilen TG', 47.6480, 9.1320, 'TG',
  '["fruits","vegetables","honey","eggs"]', '["cash","twint"]', 1, '24h tavasztól őszig',
  'Idényfrissek, helyi méz. Téli szezonban szünetel.'),

('seed-so-01', 'Bauernhof Kellerhof', 'Bättwil SO', 47.4815, 7.5200, 'SO',
  '["milk","meat","eggs","bread"]', '["cash","twint"]', 1, '24h',
  'Friss tej + tojás. Hétvégén bio kenyér is.'),

('seed-fr-01', 'Fromagerie Moléson', 'Gruyères FR', 46.5867, 7.0827, 'FR',
  '["cheese","milk"]', '["cash","twint","card"]', 0, 'H-V 9-18',
  'Gruyère AOP sajt-üzem. Látogató-bolt és üzem.');
