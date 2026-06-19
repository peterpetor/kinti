-- 0077 — AI-használat napi aggregátum (admin monitoring).
-- Minden Workers AI hívás (szöveg-modellek + toMarkdown) token-fogyását
-- naponta + modellenként összegezzük, hogy az admin fülön látszódjon a fogyás.
-- A tényleges Neuron/számla a Cloudflare dashboardon a pontos forrás; ez a gyors
-- app-szintű figyeléshez van (funkció/modell-bontásban).
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  day               TEXT    NOT NULL,          -- 'YYYY-MM-DD' (UTC)
  model             TEXT    NOT NULL,          -- pl. @cf/meta/llama-3.1-8b-instruct-fast
  calls             INTEGER NOT NULL DEFAULT 0,
  prompt_tokens     INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, model)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_day ON ai_usage_daily (day);
