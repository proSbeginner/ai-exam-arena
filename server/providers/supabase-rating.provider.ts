import { calculateRatingChange } from '@/features/rank/rank.logic';
import type { QuizMode } from '@/features/quiz/quiz.types';
import type { RatingProvider, PlayerRating, ApplyRatingInput } from './rating.provider';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';

interface DatabasePlayerRatingRow {
  player_id: string;
  mode: QuizMode;
  mmr: number;
  answered_count: number;
  correct_count: number;
  completed_attempt_count: number;
}

function transformRating(row: DatabasePlayerRatingRow): PlayerRating {
  return {
    playerId: row.player_id,
    mode: row.mode,
    mmr: row.mmr,
    answeredCount: row.answered_count,
    correctCount: row.correct_count,
    completedAttemptCount: row.completed_attempt_count,
  };
}

function defaultRating(playerId: string, mode: QuizMode): PlayerRating {
  return { playerId, mode, mmr: 0, answeredCount: 0, correctCount: 0, completedAttemptCount: 0 };
}

async function getRating(playerId: string, mode: QuizMode): Promise<PlayerRating> {
  const query = supabaseQuery({ select: '*', player_id: `eq.${playerId}`, mode: `eq.${mode}`, limit: '1' });
  const rows = await supabaseRequest<DatabasePlayerRatingRow[]>(`player_ratings?${query}`);
  return rows[0] ? transformRating(rows[0]) : defaultRating(playerId, mode);
}

async function applyAttemptRating(input: ApplyRatingInput): Promise<PlayerRating> {
  const current = await getRating(input.playerId, input.mode);
  const row = {
    player_id: input.playerId,
    mode: input.mode,
    mmr: Math.max(0, current.mmr + calculateRatingChange(input.correctCount, input.questionCount, input.answeredCount, input.optionCounts)),
    answered_count: current.answeredCount + input.answeredCount,
    correct_count: current.correctCount + input.correctCount,
    completed_attempt_count: current.completedAttemptCount + (input.answeredCount === input.questionCount ? 1 : 0),
  };
  const rows = await supabaseRequest<DatabasePlayerRatingRow[]>('player_ratings?on_conflict=player_id,mode', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(row),
  });
  return rows[0] ? transformRating(rows[0]) : { ...current, mmr: row.mmr, answeredCount: row.answered_count, correctCount: row.correct_count, completedAttemptCount: row.completed_attempt_count };
}

export const supabaseRatingProvider: RatingProvider = { getRating, applyAttemptRating };
