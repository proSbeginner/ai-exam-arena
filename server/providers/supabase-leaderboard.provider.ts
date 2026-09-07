import type { QuizMode } from '@/features/quiz/quiz.types';
import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';
import { filterLeaderboardEntries, sortLeaderboard } from '@/features/leaderboard/leaderboard.logic';
import type { DatabaseLeaderboardAttemptRow } from '@/server/database/types';
import { transformLeaderboardAttempt } from '@/server/database/transformers/leaderboard.transform';
import type { LeaderboardProvider } from '@/server/providers/leaderboard.provider';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';

async function getSupabaseLeaderboard(mode: QuizMode, playerId?: string): Promise<LeaderboardEntry[]> {
  const query = supabaseQuery({
    select: 'id,player_id,attempt_status,question_ids,completed_at,updated_at,state,players(player_name)',
    mode: `eq.${mode}`,
    attempt_status: 'in.(completed,abandoned)',
  });
  const attempts = await supabaseRequest<DatabaseLeaderboardAttemptRow[]>(`quiz_attempts?${query}`);
  const entries = attempts.map(transformLeaderboardAttempt);

  void playerId;
  return sortLeaderboard(filterLeaderboardEntries(entries));
}

export const supabaseLeaderboardProvider: LeaderboardProvider = {
  getLeaderboard: getSupabaseLeaderboard,
};
