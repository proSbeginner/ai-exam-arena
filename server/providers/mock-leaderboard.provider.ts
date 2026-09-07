import { getMockLeaderboard } from '@/mock-api/leaderboard/mock-leaderboard';
import type { LeaderboardProvider } from '@/server/providers/leaderboard.provider';

export const mockLeaderboardProvider: LeaderboardProvider = {
  getLeaderboard: getMockLeaderboard,
};
