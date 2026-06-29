-- 0105 — Kategória-ranglisták. A meglévő egyetlen `score` (összesített) mellé
-- két al-pontszám: nyelvtanulás (nyelvlecke-XP) és közösségi hozzájárulás
-- (posztok/vélemények/események). A kliens önbevallottan küldi mindhármat; a
-- ranglista kategóriánként rendezhető. Privacy-elv változatlan (anonim token).
ALTER TABLE leaderboard ADD COLUMN score_language INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leaderboard ADD COLUMN score_community INTEGER NOT NULL DEFAULT 0;
