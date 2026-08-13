-- ============================================================
-- 0003_project_team — persistent per-project specialist team
-- Assigned once by Mendly when the founder describes their project
-- (lib/ai/team/assign-team.ts, called from createProject()). Scopes
-- the "Salle de réunion" debate pool to this project's team instead
-- of the full plan-wide specialist pool.
-- Idempotent: safe to re-run.
-- ============================================================

alter table public.projects add column if not exists assigned_agents text[];
alter table public.projects add column if not exists team_rationale text;
