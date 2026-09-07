import type { QuizMode } from '@/features/quiz/quiz.types';

import type { LeaderboardEntry } from '../leaderboard.types';

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  mode: QuizMode;
}

export async function getLeaderboard(mode: QuizMode, playerId?: string): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams({ mode });
  if (playerId) params.set('playerId', playerId);
  const response = await fetch(`/api/leaderboard?${params.toString()}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('ไม่สามารถโหลด leaderboard ได้ในขณะนี้');
  }

  const payload = (await response.json()) as LeaderboardResponse;
  return payload.leaderboard;
}
