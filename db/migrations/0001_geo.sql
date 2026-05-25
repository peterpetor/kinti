-- ===========================================================================
-- 0001_geo  —  valódi földrajzi koordináták a businesses táblába.
--
-- A 0000_init-ben pin_x / pin_y a prototípus statikus térkép-mockupjának
-- 0–100-as százalékai voltak (UI placeholder). A Leaflet-térképhez WGS84
-- szélesség/hosszúság kell, ezért külön oszlopokat veszünk fel:
--
--   lat  REAL  —  szélesség (latitude),  pl. 47.3733
--   lng  REAL  —  hosszúság (longitude), pl.  8.5215
--
-- A pin_x/pin_y oszlopokat NEM dobjuk el (visszamenőleges kompatibilitás),
-- a térkép komponens már kizárólag a lat/lng-t használja.
-- ===========================================================================

ALTER TABLE businesses ADD COLUMN lat REAL;
ALTER TABLE businesses ADD COLUMN lng REAL;

-- Bounding-box query-khez egy összetett index (lat tipikusan szelektívebb a tartomány-szűréshez).
CREATE INDEX IF NOT EXISTS idx_businesses_latlng ON businesses(lat, lng);
