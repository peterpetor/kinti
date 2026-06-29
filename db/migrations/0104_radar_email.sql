-- 0104 — Állás-radar email-csatorna. Eddig a radar CSAK push-t küldött; ezzel
-- a usernek (akinek nincs push engedélyezve) email is kérhető az új találatról.
-- Az `email` opcionális; email-only radarnál a push_endpoint = "" (üres, NOT NULL
-- miatt nem lehet NULL) — a trigger az üres endpointra nem küld pusht.
ALTER TABLE kinti_radars ADD COLUMN email TEXT;
