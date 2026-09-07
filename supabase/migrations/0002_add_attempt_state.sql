alter table public.quiz_attempts
  add column state jsonb not null default '{}'::jsonb;
