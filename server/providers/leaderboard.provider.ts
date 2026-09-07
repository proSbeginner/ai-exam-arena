import type { QuizMode } from '@/features/quiz/quiz.types';
import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';
import { getDataSource } from './data-source';
import { mockLeaderboardProvider } from '@/server/providers/mock-leaderboard.provider';
import { supabaseLeaderboardProvider } from '@/server/providers/supabase-leaderboard.provider';

export interface LeaderboardProvider {
  getLeaderboard(mode: QuizMode, playerId?: string): Promise<LeaderboardEntry[]>;
}

export function getLeaderboardProvider(): LeaderboardProvider {
  return getDataSource() === 'mock' ? mockLeaderboardProvider : supabaseLeaderboardProvider;
}
