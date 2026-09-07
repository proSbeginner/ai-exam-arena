-- Ensures a completed attempt contributes to a player's rating only once.
create table public.player_rating_events (
  attempt_id uuid primary key references public.quiz_attempts(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  mode text not null check (mode in ('primary', 'secondary', 'university')),
  created_at timestamptz not null default now()
);

create index player_rating_events_player_mode_index
  on public.player_rating_events (player_id, mode);

alter table public.player_rating_events enable row level security;

grant select, insert
on table public.player_rating_events
to service_role;
