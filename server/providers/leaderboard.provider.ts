import { getMockLeaderboard } from '@/mock-api/leaderboard/mock-leaderboard';
import type { QuizMode } from '@/features/quiz/quiz.types';
import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';
import { filterLeaderboardEntries, sortLeaderboard } from '@/features/leaderboard/leaderboard.logic';

import { getDataSource } from './data-source';
import { supabaseQuery, supabaseRequest } from '@/server/supabase/client';

export interface LeaderboardProvider {
  getLeaderboard(mode: QuizMode, playerId?: string): Promise<LeaderboardEntry[]>;
}

async function getSupabaseLeaderboard(mode: QuizMode, playerId?: string): Promise<LeaderboardEntry[]> {
  const query = supabaseQuery({
    select: 'id,player_id,attempt_status,question_ids,completed_at,updated_at,state,players(player_name)',
    mode: `eq.${mode}`,
    attempt_status: 'in.(completed,abandoned)',
  });
  const attempts = await supabaseRequest<SupabaseLeaderboardAttempt[]>(`quiz_attempts?${query}`);
  const entries = attempts.map((attempt) => {
    const answeredCount = Object.keys(attempt.state?.answeredMap ?? {}).length;
    const correctCount = attempt.state?.score ?? 0;
    return {
      attemptId: attempt.id,
      playerId: attempt.player_id,
      playerName: attempt.players?.player_name ?? '',
      mode,
      answeredCount,
      questionCount: attempt.question_ids.length,
      correctCount,
      accuracy: answeredCount > 0 ? Number(((correctCount / answeredCount) * 100).toFixed(2)) : 0,
      attemptStatus: attempt.attempt_status,
      completedAt: attempt.completed_at ?? attempt.updated_at,
    };
  });

  void playerId;
  return sortLeaderboard(filterLeaderboardEntries(entries));
}

interface SupabaseLeaderboardAttempt {
  id: string;
  player_id: string;
  attempt_status: LeaderboardEntry['attemptStatus'];
  question_ids: string[];
  completed_at: string | null;
  updated_at: string;
  state: { score?: number; answeredMap?: Record<string, string> };
  players: { player_name: string } | null;
}

export function getLeaderboardProvider(): LeaderboardProvider {
  return getDataSource() === 'mock'
    ? { getLeaderboard: getMockLeaderboard }
    : { getLeaderboard: getSupabaseLeaderboard };
}
