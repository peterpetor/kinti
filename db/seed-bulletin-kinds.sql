-- ===========================================================================
-- seed-bulletin-kinds.sql  —  Bővített hirdetés-kategóriák.
--
-- Futtatás (remote D1):
--   npx wrangler d1 execute kinti-db --remote --file=./db/seed-bulletin-kinds.sql
--
-- INSERT OR IGNORE → a meglévő kategóriákat (és a rájuk hivatkozó hirdetéseket)
-- NEM bántja, csak az újakat veszi fel. A meglévő 'szolg' label-jét frissítjük
-- „Szolgáltatás"-ra.
-- ===========================================================================

INSERT OR IGNORE INTO bulletin_kinds (id, label, color, sort_order) VALUES
  ('alberlet', 'Albérlet',       '#c8392e', 1),
  ('allas',    'Állás',          '#1d4434', 2),
  ('elado',    'Eladó',          '#c8862e', 3),
  ('szolg',    'Szolgáltatás',   '#3a6ea5', 4),
  ('keres',    'Keresek',        '#8c5e3c', 5),
  ('ingyen',   'Ingyen',         '#2e8c57', 6),
  ('jarmu',    'Jármű',          '#5b4a8c', 7),
  ('lakotars', 'Lakótárs',       '#c84a8c', 8),
  ('gyerek',   'Gyerekholmi',    '#e5a23a', 9),
  ('oktatas',  'Oktatás',        '#3a8ca5', 10),
  ('esemeny',  'Esemény',        '#d4663a', 11),
  ('egyeb',    'Egyéb',          '#5c6d63', 12);

-- A 'szolg' label frissítése (INSERT OR IGNORE nem írja felül a meglévőt)
UPDATE bulletin_kinds SET label = 'Szolgáltatás', sort_order = 4 WHERE id = 'szolg';
