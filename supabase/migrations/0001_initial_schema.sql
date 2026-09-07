create extension if not exists pgcrypto;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  player_name text not null unique,
  pin_hash text not null,
  failed_pin_attempts integer not null default 0 check (failed_pin_attempts >= 0),
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint players_player_name_format check (player_name ~ '^[A-Z0-9_]+$')
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('primary', 'secondary', 'university')),
  labels text[] not null default '{}',
  english text not null,
  thai_drama text not null default '',
  fun_fact text,
  source_name text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_key text not null,
  english text not null,
  thai_drama text not null default '',
  is_correct boolean not null default false,
  display_order integer not null check (display_order >= 0),
  unique (question_id, option_key),
  unique (question_id, display_order)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  mode text not null check (mode in ('primary', 'secondary', 'university')),
  question_limit integer check (question_limit is null or question_limit > 0),
  attempt_status text not null default 'active' check (attempt_status in ('active', 'abandoned', 'completed')),
  current_question_index integer not null default 0 check (current_question_index >= 0),
  score integer not null default 0 check (score >= 0),
  question_ids uuid[] not null default '{}',
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index quiz_attempts_one_open_per_player_mode
  on public.quiz_attempts (player_id, mode)
  where attempt_status in ('active', 'abandoned');

create index quiz_attempts_leaderboard_index
  on public.quiz_attempts (mode, attempt_status, updated_at desc);

create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_option_id uuid not null references public.question_options(id) on delete restrict,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index quiz_answers_attempt_id_index on public.quiz_answers (attempt_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

create trigger quiz_attempts_set_updated_at
before update on public.quiz_attempts
for each row execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;
