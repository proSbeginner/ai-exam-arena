import type { QuizMode } from '@/features/quiz/quiz.types';
import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';
import { sortLeaderboard } from '@/features/leaderboard/leaderboard.logic';
import {
  getMockScenario,
  simulateMockNetworkDelay,
  throwIfMockServiceUnavailable,
} from '../mock-api.config';

const entries: LeaderboardEntry[] = [
  {
    playerId: 'mock-player-001',
    playerName: 'CLOUD_MASTER',
    mode: 'university',
    answeredCount: 100,
    correctCount: 88,
    accuracy: 88,
    attemptStatus: 'completed',
    completedAt: '2026-01-01T10:00:00.000Z',
  },
  {
    playerId: 'mock-player-002',
    playerName: 'AI_RANGER',
    mode: 'university',
    answeredCount: 80,
    correctCount: 76,
    accuracy: 95,
    attemptStatus: 'completed',
    completedAt: '2026-01-01T11:00:00.000Z',
  },
  {
    playerId: 'mock-player-003',
    playerName: 'QUIZ_TRAINEE',
    mode: 'university',
    answeredCount: 100,
    correctCount: 100,
    accuracy: 100,
    attemptStatus: 'abandoned',
    completedAt: '2026-01-01T09:00:00.000Z',
  },
];

export async function getMockLeaderboard(mode: QuizMode): Promise<LeaderboardEntry[]> {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  if (getMockScenario() === 'empty-questions') return [];

  return sortLeaderboard(entries.filter((entry) => entry.mode === mode));
}
