-- db/migrations/0068_business_accent_color.sql
--
-- Custom branding (Szaknévsor PRO): a vállalkozó választhat egy accent színt,
-- ami a profilja fejlécén / kiemelésén jelenik meg. NULL = alapértelmezett.
-- A szerver csak előre definiált hex-listából fogad el értéket (nincs tetszőleges CSS).

ALTER TABLE businesses ADD COLUMN accent_color TEXT;
