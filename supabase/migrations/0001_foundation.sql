-- ============================================================
-- 0001_foundation — Mendly roadmap foundation
-- Project identity + vision, tracked actions, whispers,
-- memory events, and a debates log (for history + sliding recharge).
-- Idempotent: safe to re-run.
-- ============================================================

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ projects: identity + founder vision ============
alter table public.projects add column if not exists accent_color text;
alter table public.projects add column if not exists emoji text;
alter table public.projects add column if not exists vision text;

-- ============ actions (tracked next steps / accountability) ============
create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  content text not null,
  status text not null default 'todo' check (status in ('todo','done','abandoned')),
  source text not null default 'manual' check (source in ('manual','debate','ceo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists actions_project_idx on public.actions(project_id);
create index if not exists actions_user_idx on public.actions(user_id);

drop trigger if exists actions_set_updated_at on public.actions;
create trigger actions_set_updated_at before update on public.actions
  for each row execute function public.set_updated_at();

alter table public.actions enable row level security;
drop policy if exists actions_select_own on public.actions;
create policy actions_select_own on public.actions for select using (auth.uid() = user_id);
drop policy if exists actions_insert_own on public.actions;
create policy actions_insert_own on public.actions for insert with check (auth.uid() = user_id);
drop policy if exists actions_update_own on public.actions;
create policy actions_update_own on public.actions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists actions_delete_own on public.actions;
create policy actions_delete_own on public.actions for delete using (auth.uid() = user_id);

-- ============ whispers (off-mic agent notes) ============
create table if not exists public.whispers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_role text not null,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists whispers_project_idx on public.whispers(project_id);
create index if not exists whispers_user_unread_idx on public.whispers(user_id) where read = false;

alter table public.whispers enable row level security;
drop policy if exists whispers_select_own on public.whispers;
create policy whispers_select_own on public.whispers for select using (auth.uid() = user_id);
drop policy if exists whispers_insert_own on public.whispers;
create policy whispers_insert_own on public.whispers for insert with check (auth.uid() = user_id);
drop policy if exists whispers_update_own on public.whispers;
create policy whispers_update_own on public.whispers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists whispers_delete_own on public.whispers;
create policy whispers_delete_own on public.whispers for delete using (auth.uid() = user_id);

-- ============ memory_events (decisions / assumptions / risks / milestones) ============
create table if not exists public.memory_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('decision','assumption','risk','milestone')),
  title text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists memory_events_project_idx on public.memory_events(project_id, created_at desc);

alter table public.memory_events enable row level security;
drop policy if exists memory_select_own on public.memory_events;
create policy memory_select_own on public.memory_events for select using (auth.uid() = user_id);
drop policy if exists memory_insert_own on public.memory_events;
create policy memory_insert_own on public.memory_events for insert with check (auth.uid() = user_id);
drop policy if exists memory_update_own on public.memory_events;
create policy memory_update_own on public.memory_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists memory_delete_own on public.memory_events;
create policy memory_delete_own on public.memory_events for delete using (auth.uid() = user_id);

-- ============ debates (log: history + sliding free recharge) ============
create table if not exists public.debates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  question text not null,
  verdict text,
  agents text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists debates_user_recent_idx on public.debates(user_id, created_at desc);
create index if not exists debates_project_idx on public.debates(project_id, created_at desc);

alter table public.debates enable row level security;
drop policy if exists debates_select_own on public.debates;
create policy debates_select_own on public.debates for select using (auth.uid() = user_id);
drop policy if exists debates_insert_own on public.debates;
create policy debates_insert_own on public.debates for insert with check (auth.uid() = user_id);
drop policy if exists debates_update_own on public.debates;
create policy debates_update_own on public.debates for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists debates_delete_own on public.debates;
create policy debates_delete_own on public.debates for delete using (auth.uid() = user_id);
