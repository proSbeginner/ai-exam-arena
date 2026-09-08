-- Run this only when preparing a fresh database and intentionally removing all application data.
-- Test-player cleanup reminder (the following full reset also removes these rows).
select id, player_name
from public.players
where player_name in ('ATOMIC_TEST_01', 'ATOMIC_HOLD_01');

delete from public.players
where player_name in ('ATOMIC_TEST_01', 'ATOMIC_HOLD_01');

drop table if exists public.player_rating_events cascade;
drop table if exists public.player_ratings cascade;
drop table if exists public.quiz_answers cascade;
drop table if exists public.question_options cascade;
drop table if exists public.quiz_attempts cascade;
drop table if exists public.questions cascade;
drop table if exists public.players cascade;
drop function if exists public.apply_attempt_rating(uuid, uuid, text, integer, integer, integer, integer) cascade;
drop function if exists public.set_updated_at() cascade;
