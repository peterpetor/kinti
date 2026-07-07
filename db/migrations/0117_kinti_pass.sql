-- 0117: Kinti Pass — digitális kedvezménykártya elfogadóhely-mezők.
-- kinti_pass_active: 1 = a vállalkozás Kinti Pass elfogadóhely (Szaknévsor PRO funkció).
-- kinti_pass_offer:  a konkrét ajánlat szövege (pl. "10% kedvezmény minden főételre").
ALTER TABLE businesses ADD COLUMN kinti_pass_active INTEGER NOT NULL DEFAULT 0;
ALTER TABLE businesses ADD COLUMN kinti_pass_offer TEXT;
