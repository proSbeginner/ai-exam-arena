-- Run this only when preparing a fresh database and intentionally removing all application data.
drop table if exists public.player_rating_events cascade;
drop table if exists public.player_ratings cascade;
drop table if exists public.quiz_answers cascade;
drop table if exists public.question_options cascade;
drop table if exists public.quiz_attempts cascade;
drop table if exists public.questions cascade;
drop table if exists public.players cascade;
drop function if exists public.set_updated_at() cascade;
