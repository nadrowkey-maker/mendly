-- ============================================================
-- 0004_autonomous_sessions — sessions de travail autonomes de l'équipe
--
-- Le cron app/api/cron/team-sessions fait travailler l'équipe assignée d'un
-- projet sans que le fondateur déclenche quoi que ce soit. Le résultat est
-- stocké dans la table debates existante plutôt que dans une table dédiée :
-- c'est le même objet métier (une question, un fil, un verdict, des agents),
-- et le réutiliser le fait apparaître dans l'historique déjà en place.
--
-- origin  : distingue une session autonome d'un débat lancé par le fondateur.
-- seen_at : null tant que le fondateur ne l'a pas ouverte. Sert à deux choses —
--           afficher un compteur "pendant ton absence", et empêcher le cron
--           d'empiler une nouvelle session tant que la précédente n'a pas été
--           lue (sinon la salle de réunion devient une boîte de spam).
--
-- Idempotent : rejouable sans risque.
-- ============================================================

alter table public.debates
  add column if not exists origin text not null default 'founder';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'debates_origin_check'
  ) then
    alter table public.debates
      add constraint debates_origin_check check (origin in ('founder', 'autonomous'));
  end if;
end $$;

alter table public.debates
  add column if not exists seen_at timestamptz;

-- Le cron interroge "dernière session autonome de ce projet" à chaque passage.
create index if not exists debates_autonomous_idx
  on public.debates(project_id, created_at desc)
  where origin = 'autonomous';
