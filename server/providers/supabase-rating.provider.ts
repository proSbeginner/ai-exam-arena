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
  const mmrChange = calculateRatingChange(input.correctCount, input.questionCount, input.answeredCount, input.optionCounts);
  const rows = await supabaseRequest<DatabasePlayerRatingRow[]>('rpc/apply_attempt_rating', {
    method: 'POST',
    body: JSON.stringify({
      p_attempt_id: input.attemptId,
      p_player_id: input.playerId,
      p_mode: input.mode,
      p_mmr_change: mmrChange,
      p_answered_count: input.answeredCount,
      p_correct_count: input.correctCount,
      p_completed_attempt_count: input.answeredCount === input.questionCount ? 1 : 0,
    }),
  });
  if (!rows[0]) throw new Error('Rating RPC returned no rating row.');
  return transformRating(rows[0]);
}

export const supabaseRatingProvider: RatingProvider = { getRating, applyAttemptRating };
