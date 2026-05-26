-- ===========================================================================
-- seed-events.sql  —  Valódi svájci magyar események (kézi seed).
--
-- Futtatás (remote D1):
--   npx wrangler d1 execute kinti-db --remote --file=./db/seed-events.sql
--
-- A `source IS NULL` (kézi/seed) eseményeket cseréli — az iCal-feedből
-- szinkronizáltakat (source = 'ical:...') NEM érinti. A `going` mindenhol 0:
-- NINCS fake létszám, a megjelenített „fő megy" KIZÁRÓLAG a valós RSVP-k
-- (event_rsvps) száma. A kiemelt esemény a legtöbb „Megyek"-et kapott.
--
-- Forrás-szervezetek (publikus, visszatérő rendezvények):
--   • Zürichi Magyar Egyesület / Magyar Ház (ZÜME) — magyarhaz.ch
--   • Zürichi Magyar Katolikus Misszió — magyar-misszio.ch
--   • Külföldi Magyar Cserkészszövetség (KMCSSZ) Svájc — cserkesz.eu
-- A pontos időpontok közelítőek; a végleges adatokat a szervezetek
-- naptáraiból (iCal-sync) frissítjük majd.
-- ===========================================================================

DELETE FROM events WHERE source IS NULL;

INSERT INTO events
  (id, title, event_date, date_day, date_month, date_weekday, start_time, venue, going, tag, color)
VALUES
  ('ev-piknik-2026-06',  'Magyar piknik a Sihl-parton',           '2026-06-13', '13', 'JÚN',  'szombat',   '11:00', 'Allmend Brunau, Zürich',                  0, 'piknik',   '#1d4434'),
  ('ev-mise-2026-06',    'Magyar szentmise',                      '2026-06-21', '21', 'JÚN',  'vasárnap',  '10:30', 'Magyar Misszió · Winterthurerstr. 135',   0, 'liturgia', '#5b4a8c'),
  ('ev-foci-2026-07',    'Magyar focitorna',                      '2026-07-04', '4',  'JÚL',  'szombat',   '14:00', 'Sportplatz Heerenschürli, Zürich',        0, 'sport',    '#3884ff'),
  ('ev-istvan-2026',     'Szent István ünnep',                    '2026-08-20', '20', 'AUG',  'csütörtök', '18:00', 'ZÜME · Magyar Ház, Zürich',               0, 'ünnep',    '#c8392e'),
  ('ev-tanevnyito-2026', 'Magyar Iskola tanévnyitó',              '2026-09-13', '13', 'SZEP', 'vasárnap',  '14:00', 'ZÜME · Magyar Ház, Zürich',               0, 'iskola',   '#c89a5c'),
  ('ev-1956-2026',       '1956-os forradalom megemlékezése',      '2026-10-23', '23', 'OKT',  'péntek',    '19:00', 'Volkshaus Zürich · Stauffacherstr. 60',   0, 'ünnep',    '#c8392e'),
  ('ev-cserkesz-2026-11','Cserkész advent-előkészítő hétvége',    '2026-11-14', '14', 'NOV',  'szombat',   '09:00', 'Pfadiheim Bollberg, Lenzburg',            0, 'cserkész', '#1d4434'),
  ('ev-mikulas-2026',    'Mikulás-est gyerekeknek',               '2026-12-06', '6',  'DEC',  'vasárnap',  '16:00', 'ZÜME · Magyar Ház, Zürich',               0, 'gyerek',   '#e5688d'),
  ('ev-advent-2026',     'Adventi gyertyagyújtás',                '2026-12-13', '13', 'DEC',  'vasárnap',  '17:00', 'Magyar Misszió · Winterthurerstr. 135',   0, 'ünnep',    '#c8392e'),
  ('ev-bal-2027',        '53. Zürichi Magyar Bál',                '2027-01-30', '30', 'JAN',  'szombat',   '19:30', 'Volkshaus Zürich · Stauffacherstr. 60',   0, 'bál',      '#c89a5c');
