-- db/2025-07-27-ratings.sql  ─────────────────────────────
-- Ratings table + Row-Level Security (Sprint-10)

create table if not exists public.ratings (
  id          bigint generated always as identity primary key,
  template_id bigint references public.templates(id) on delete cascade,
  user_id     text,
  stars       smallint check (stars between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

alter table public.ratings enable row level security;

create policy "anon insert"
  on public.ratings
  for insert
  with check ( true );

create policy "anon select"
  on public.ratings
  for select
  using ( true );
-- ────────────────────────────────────────────────────────
