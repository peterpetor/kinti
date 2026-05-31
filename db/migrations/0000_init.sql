-- ===========================================================================
-- Kinti — kezdő séma (Cloudflare D1 / SQLite)
-- Alkalmazás:  npm run db:migrate:local   /   npm run db:migrate:remote
-- A relációkat idegen kulcsok kényszerítik; D1-ben kapcsold be a PRAGMA-t.
-- ===========================================================================
PRAGMA foreign_keys = ON;

-- 1) Vállalkozói kategóriák — a Szaknévsor szűrő-pilljei.
--    A 'all' (Mind) pszeudo-kategória is itt él; vállalkozás soha nem hivatkozik rá.
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,            -- slug: 'fodrasz', 'orvos', …
  label       TEXT NOT NULL,               -- megjelenített magyar név
  glyph       TEXT,                        -- dekoratív szimbólum (pill/pin)
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- 2) Vállalkozások — a businesses.category_id IDEGEN KULCS a categories(id)-re.
--    owner_user_id: Clerk user_id. A Clerk külső rendszer (nem D1 tábla), ezért
--    ez indexelt szöveges hivatkozás, nem valódi SQL FK.
CREATE TABLE businesses (
  id             TEXT PRIMARY KEY,                  -- slug
  name           TEXT NOT NULL,
  category_id    TEXT NOT NULL,
  category_label TEXT,                              -- megjelenítési felülírás (pl. 'Fogorvos')
  rating         REAL    NOT NULL DEFAULT 0,
  reviews        INTEGER NOT NULL DEFAULT 0,
  dist_text      TEXT,                              -- prototípus kézi értéke: "4 perc"
  dist_meters    INTEGER,
  address        TEXT,
  phone          TEXT,                              -- nullable (pl. Tóth villanyszerelő)
  pin_x          REAL NOT NULL,                     -- 0..100 normalizált térkép-koordináta
  pin_y          REAL NOT NULL,
  featured       INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  blurb          TEXT,
  open_now       INTEGER NOT NULL DEFAULT 0 CHECK (open_now IN (0, 1)),
  open_text      TEXT,
  years_here     INTEGER,
  languages      TEXT,                              -- JSON tömb: '["Magyar","Deutsch"]'
  photo          TEXT,                              -- CSS gradiens (placeholder logó)
  accent_photo   TEXT,
  logo_key       TEXT,                              -- R2 objektumkulcs (valódi logó)
  owner_user_id  TEXT,                              -- Clerk user_id (nullable)
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_businesses_category ON businesses (category_id);
CREATE INDEX idx_businesses_featured ON businesses (featured);
CREATE INDEX idx_businesses_owner    ON businesses (owner_user_id);

-- 3) Közösségi események.
CREATE TABLE events (
  id                 TEXT PRIMARY KEY,
  title              TEXT NOT NULL,
  event_date         TEXT,                          -- ISO 'YYYY-MM-DD' (rendezés)
  date_day           TEXT,                          -- prototípus dekoratív mezői
  date_month         TEXT,                          --   (NOV, JÚN, …)
  date_weekday       TEXT,                          --   (szombat, vasárnap, …)
  start_time         TEXT,
  venue              TEXT,
  going              INTEGER NOT NULL DEFAULT 0,
  tag                TEXT,
  color              TEXT,
  created_by_user_id TEXT,                          -- Clerk user_id (nullable)
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_date ON events (event_date);

-- 6) Vállalkozói dashboard — heti KPI összesítő (1:1 a vállalkozással).
--    A delta-mezők szándékosan szövegesek (a prototípus "+34%" formátuma).
CREATE TABLE business_stats (
  business_id       TEXT PRIMARY KEY,
  week_views        INTEGER NOT NULL DEFAULT 0,
  week_views_delta  TEXT,
  week_clicks       INTEGER NOT NULL DEFAULT 0,
  week_clicks_delta TEXT,
  week_calls        INTEGER NOT NULL DEFAULT 0,
  week_calls_delta  TEXT,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 7) Vállalkozói dashboard — napi megtekintések (14 napos trendvonal/Sparkline).
CREATE TABLE business_daily_views (
  business_id  TEXT NOT NULL,
  stat_date    TEXT NOT NULL,               -- 'YYYY-MM-DD'
  views        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (business_id, stat_date),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
