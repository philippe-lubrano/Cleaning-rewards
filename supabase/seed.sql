-- ============================================
-- Cleaning Rewards - Seed Data
-- ============================================
-- Run after schema.sql and after creating a foyer + users

-- Example: Insert a foyer
INSERT INTO foyer (id) VALUES ('00000000-0000-0000-0000-000000000001');

-- Example: Insert two users
INSERT INTO users (id, foyer_id, name, points) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Partenaire 1', 0),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Partenaire 2', 0);

-- Default tasks
INSERT INTO tasks (foyer_id, name, points, recurrence_days, next_due) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Vider le lave-vaisselle', 10, 1, now()),
  ('00000000-0000-0000-0000-000000000001', 'Passer l''aspirateur', 30, 3, now()),
  ('00000000-0000-0000-0000-000000000001', 'Sortir les poubelles', 5, 2, now()),
  ('00000000-0000-0000-0000-000000000001', 'Nettoyer la salle de bain', 50, 7, now()),
  ('00000000-0000-0000-0000-000000000001', 'Lancer une machine', 15, 3, now());
