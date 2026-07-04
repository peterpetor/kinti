-- SOS lezárás tulajdonlása: a poster_user_id IP-hash-ből származik, ami mobilon
-- hálózat-váltáskor megváltozik → a feladó nem tudta lezárni a sajátját.
-- Új: beküldéskor generált titkos resolve_token (a kliens localStorage-ban tartja);
-- a lezárás elsődlegesen ezzel, IP-hash-sel csak fallbackként (régi riasztások).
ALTER TABLE sos_alerts ADD COLUMN resolve_token TEXT;
