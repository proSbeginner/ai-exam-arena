-- Per-player, per-mode MMR. Rank name and stars are derived from mmr in application logic.
create table public.player_ratings (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  mode text not null check (mode in ('primary', 'secondary', 'university')),
  mmr integer not null default 0 check (mmr >= 0),
  answered_count integer not null default 0 check (answered_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  completed_attempt_count integer not null default 0 check (completed_attempt_count >= 0),
  updated_at timestamptz not null default now(),
  unique (player_id, mode)
);

create index player_ratings_mode_mmr_index
  on public.player_ratings (mode, mmr desc, updated_at asc);

create trigger player_ratings_set_updated_at
before update on public.player_ratings
for each row execute function public.set_updated_at();

alter table public.player_ratings enable row level security;
