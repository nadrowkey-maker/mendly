-- ============================================================================
-- 0006 — Un seul fil par (projet, utilisateur, rôle) ; abonnements en lecture seule
-- ============================================================================
--
-- 1. LES FILS DOUBLÉS
--
-- `getOrCreateConversation` lisait le fil avec `maybeSingle()`, qui échoue dès
-- qu'il existe deux lignes, et rien n'empêchait d'en créer deux (deux rendus
-- simultanés de la page suffisaient). Dès le premier doublon, chaque visite
-- échouait en lecture et créait un NOUVEAU fil vide : l'historique du
-- fondateur semblait remis à zéro à chaque retour sur son projet, alors que
-- ses messages étaient bien en base, éclatés entre plusieurs fils.
--
-- On fusionne : pour chaque (projet, utilisateur, rôle), le fil le plus
-- récemment actif est conservé, tout ce qui pointait vers les autres est
-- rattaché à lui, puis les doublons vides sont supprimés. L'index unique
-- empêche ensuite le problème de se reproduire.
--
-- 2. LES ABONNEMENTS
--
-- La table `subscriptions` a été créée hors migrations et ses règles d'accès
-- ne sont écrites nulle part dans le dépôt. Si une règle permettait à un
-- utilisateur de modifier sa propre ligne, il pourrait se passer en Pro depuis
-- son navigateur avec la clé publique. Seul le webhook Stripe écrit dans cette
-- table, et il utilise la clé de service, qui ignore ces règles. Les
-- utilisateurs n'ont donc besoin que de LIRE leur propre ligne.
-- ============================================================================

begin;

-- ---------------------------------------------------------------- 1. fusion
create temporary table conv_merge on commit drop as
select dup_id, keep_id
  from (
    select id as dup_id,
           first_value(id) over (
             partition by project_id, user_id, agent_role
             order by updated_at desc nulls last, created_at desc
           ) as keep_id
      from public.conversations
  ) ranked
 where dup_id <> keep_id;

-- Les messages d'abord, explicitement : c'est l'historique qu'on veut sauver,
-- et on ne dépend pas de l'existence d'une clé étrangère pour le rattacher.
update public.messages msg
   set conversation_id = m.keep_id
  from conv_merge m
 where msg.conversation_id = m.dup_id;

-- Puis toute autre colonne qui référence un fil (actions, débats…), quelle
-- qu'elle soit : une table ajoutée plus tard ne doit pas être oubliée ici.
do $$
declare
  r record;
begin
  for r in
    select cl.relname as tbl, att.attname as col
      from pg_constraint con
      join pg_class cl on cl.oid = con.conrelid
      join pg_namespace ns on ns.oid = cl.relnamespace
      join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
     where con.contype = 'f'
       and con.confrelid = 'public.conversations'::regclass
       and ns.nspname = 'public'
       and cl.relname <> 'messages'
  loop
    execute format(
      'update public.%I t set %I = m.keep_id from conv_merge m where t.%I = m.dup_id',
      r.tbl, r.col, r.col
    );
  end loop;
end $$;

delete from public.conversations c
 using conv_merge m
 where c.id = m.dup_id;

create unique index if not exists conversations_one_thread_per_role
  on public.conversations (project_id, user_id, agent_role);

-- ---------------------------------------------------------- 2. abonnements
alter table public.subscriptions enable row level security;

-- On retire toutes les règles existantes, quel que soit leur nom, pour ne
-- laisser que la lecture de sa propre ligne.
do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'subscriptions'
  loop
    execute format('drop policy %I on public.subscriptions', p.policyname);
  end loop;
end $$;

create policy subscriptions_select_own
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

commit;
