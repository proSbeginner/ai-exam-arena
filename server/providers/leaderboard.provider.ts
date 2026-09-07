import { getMockLeaderboard } from '@/mock-api/leaderboard/mock-leaderboard';
import type { QuizMode } from '@/features/quiz/quiz.types';
import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';

import { DataSourceConfigError, getDataSource } from './data-source';

export interface LeaderboardProvider {
  getLeaderboard(mode: QuizMode): Promise<LeaderboardEntry[]>;
}

async function getSupabaseLeaderboard(): Promise<LeaderboardEntry[]> {
  throw new DataSourceConfigError(
    'The Supabase leaderboard provider is not configured yet.',
    'SUPABASE_PROVIDER_NOT_READY',
  );
}

export function getLeaderboardProvider(): LeaderboardProvider {
  return getDataSource() === 'mock'
    ? { getLeaderboard: getMockLeaderboard }
    : { getLeaderboard: getSupabaseLeaderboard };
}
