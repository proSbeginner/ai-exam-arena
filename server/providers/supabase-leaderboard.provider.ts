import type { QuizMode } from '@/features/quiz/quiz.types';
import type { CurrentAttemptSummary, LeaderboardData } from '@/features/leaderboard/leaderboard.types';
import { filterLeaderboardEntries, getBestAttemptsPerPlayer, sortLeaderboard } from '@/features/leaderboard/leaderboard.logic';
import type { DatabaseAttemptRow, DatabaseLeaderboardAttemptRow } from '@/server/database/types';
import { transformLeaderboardAttempt } from '@/server/database/transformers/leaderboard.transform';
import { getRatingProvider } from '@/server/providers/rating.provider';
import { getRankFromMmr } from '@/features/rank/rank.logic';
import type { LeaderboardProvider } from '@/server/providers/leaderboard.provider';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';

async function getSupabaseLeaderboard(mode: QuizMode, playerId?: string): Promise<LeaderboardData> {
  const query = supabaseQuery({
    select: 'id,player_id,attempt_status,question_ids,completed_at,updated_at,state,players(player_name)',
    mode: `eq.${mode}`,
    attempt_status: 'in.(completed,abandoned)',
  });
  const currentQuery = playerId ? supabaseQuery({
    select: 'id,player_id,mode,attempt_status,question_ids,completed_at,updated_at,state,players(player_name)',
    player_id: `eq.${playerId}`,
    mode: `eq.${mode}`,
    order: 'updated_at.desc',
    limit: '1',
  }) : null;
  const [attempts, currentRows] = await Promise.all([
    supabaseRequest<DatabaseLeaderboardAttemptRow[]>(`quiz_attempts?${query}`),
    currentQuery
      ? supabaseRequest<Array<DatabaseAttemptRow & { players: { player_name: string } | null }>>(`quiz_attempts?${currentQuery}`)
      : Promise.resolve([]),
  ]);
  const entries = attempts.map(transformLeaderboardAttempt);
  const rankedEntries = await Promise.all(entries.map(async (entry) => {
    const rating = await getRatingProvider().getRating(entry.playerId, mode);
    return { ...entry, mmr: rating.mmr, rank: getRankFromMmr(rating.mmr) };
  }));

  const currentRow = currentRows[0];
  const currentAttempt: CurrentAttemptSummary | null = currentRow
    ? {
        attemptId: currentRow.id,
        mode: currentRow.mode,
        questionCount: currentRow.question_ids.length,
        attemptStatus: currentRow.attempt_status,
      }
    : null;

  return {
    entries: sortLeaderboard(getBestAttemptsPerPlayer(filterLeaderboardEntries(rankedEntries))),
    currentAttempt,
  };
}

export const supabaseLeaderboardProvider: LeaderboardProvider = {
  getLeaderboard: getSupabaseLeaderboard,
};
