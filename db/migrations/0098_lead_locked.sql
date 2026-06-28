-- 0098 — Freemium lead-kapu: a havi 5 ingyenes kereten FELÜL érkező lead `locked=1`.
-- A létrehozáskor (api/szaknevsor/ajanlatkeres) dől el: ha a cég NEM PRO (featured=0)
-- és ebben a hónapban már >= 5 leadje volt → locked. A zárolt lead kontakt-adatát se
-- az azonnali email, se a napi digest NEM küldi ki — csak PRO oldja fel (a /profil
-- in-app postaláda viszont dinamikusan számol, így PRO-ra váltáskor visszamenőleg felold).
ALTER TABLE business_leads ADD COLUMN locked INTEGER NOT NULL DEFAULT 0;
