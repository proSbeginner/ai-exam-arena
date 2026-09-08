-- Applies an attempt's rating exactly once and updates the aggregate atomically.
create or replace function public.apply_attempt_rating(
  p_attempt_id uuid,
  p_player_id uuid,
  p_mode text,
  p_mmr_change integer,
  p_answered_count integer,
  p_correct_count integer,
  p_completed_attempt_count integer
)
returns table (
  player_id uuid,
  mode text,
  mmr integer,
  answered_count integer,
  correct_count integer,
  completed_attempt_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_event uuid;
begin
  if p_mode not in ('primary', 'secondary', 'university') then
    raise exception 'Invalid rating mode';
  end if;

  if p_mmr_change < -300 or p_mmr_change > 300
    or p_answered_count < 0
    or p_correct_count < 0
    or p_completed_attempt_count < 0 then
    raise exception 'Invalid rating values';
  end if;

  insert into public.player_rating_events (attempt_id, player_id, mode)
  values (p_attempt_id, p_player_id, p_mode)
  on conflict (attempt_id) do nothing
  returning attempt_id into inserted_event;

  if inserted_event is null then
    return query
      select r.player_id as player_id, r.mode as mode, r.mmr as mmr,
        r.answered_count as answered_count, r.correct_count as correct_count,
        r.completed_attempt_count as completed_attempt_count
      from public.player_ratings r
      where r.player_id = p_player_id and r.mode = p_mode;
    return;
  end if;

  insert into public.player_ratings (
    player_id, mode, mmr, answered_count, correct_count, completed_attempt_count
  ) values (
    p_player_id,
    p_mode,
    greatest(0, p_mmr_change),
    p_answered_count,
    p_correct_count,
    p_completed_attempt_count
  )
  on conflict on constraint player_ratings_player_id_mode_key do update set
    mmr = greatest(0, public.player_ratings.mmr + excluded.mmr + least(0, p_mmr_change)),
    answered_count = public.player_ratings.answered_count + excluded.answered_count,
    correct_count = public.player_ratings.correct_count + excluded.correct_count,
    completed_attempt_count = public.player_ratings.completed_attempt_count + excluded.completed_attempt_count;

  return query
    select r.player_id as player_id, r.mode as mode, r.mmr as mmr,
      r.answered_count as answered_count, r.correct_count as correct_count,
      r.completed_attempt_count as completed_attempt_count
    from public.player_ratings r
    where r.player_id = p_player_id and r.mode = p_mode;
end;
$$;

revoke all on function public.apply_attempt_rating(uuid, uuid, text, integer, integer, integer, integer) from public;
grant execute on function public.apply_attempt_rating(uuid, uuid, text, integer, integer, integer, integer) to service_role;
