-- ============================================================
-- 0002_analytics — usage metrics (Bloc 9.5)
-- Lightweight event log: users insert their own events; only the
-- service role can read them (no SELECT policy = no client reads).
-- ============================================================

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_idx on public.analytics_events(event, created_at desc);
create index if not exists analytics_events_user_idx on public.analytics_events(user_id, created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists analytics_insert_own on public.analytics_events;
create policy analytics_insert_own on public.analytics_events
  for insert with check (auth.uid() = user_id);
-- Intentionally no SELECT/UPDATE/DELETE policy: reads happen via the
-- service role (SQL editor / admin dashboards) only.
