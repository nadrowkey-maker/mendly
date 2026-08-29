-- ============================================================
-- 0005_harden_functions — verrouille le search_path des triggers
--
-- Un search_path modifiable permet à un rôle malveillant d'insérer un schéma
-- devant public et de détourner un appel de fonction non qualifié. Signalé par
-- les advisors de sécurité Supabase (function_search_path_mutable).
--
-- Les trois fonctions concernées sont des triggers identiques qui n'utilisent
-- que now(), résolu dans pg_catalog même avec un search_path vide : le
-- verrouillage n'a aucun effet de bord.
--
-- Idempotent : rejouable sans risque.
-- ============================================================

alter function public.set_updated_at() set search_path = '';
alter function public.update_updated_at() set search_path = '';
alter function public.update_subscriptions_updated_at() set search_path = '';
