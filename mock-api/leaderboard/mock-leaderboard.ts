import type { QuizMode } from '@/features/quiz/quiz.types';
import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';
import { sortLeaderboard } from '@/features/leaderboard/leaderboard.logic';
import { getMockAttempt } from '@/mock-api/quiz/mock-attempts';
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
    questionCount: 100,
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
    questionCount: 100,
    correctCount: 76,
    accuracy: 95,
    attemptStatus: 'abandoned',
    completedAt: '2026-01-01T11:00:00.000Z',
  },
  {
    playerId: 'mock-player-003',
    playerName: 'QUIZ_TRAINEE',
    mode: 'university',
    answeredCount: 40,
    questionCount: 100,
    correctCount: 35,
    accuracy: 87.5,
    attemptStatus: 'abandoned',
    completedAt: '2026-01-01T09:00:00.000Z',
  },
  {
    playerId: 'mock-player-004',
    playerName: 'CLOUD_NINJA',
    mode: 'university',
    answeredCount: 50,
    questionCount: 50,
    correctCount: 42,
    accuracy: 84,
    attemptStatus: 'completed',
    completedAt: '2026-01-02T08:30:00.000Z',
  },
  {
    playerId: 'mock-player-005',
    playerName: 'BYTE_HERO',
    mode: 'university',
    answeredCount: 20,
    questionCount: 50,
    correctCount: 18,
    accuracy: 90,
    attemptStatus: 'abandoned',
    completedAt: '2026-01-02T09:15:00.000Z',
  },
  {
    playerId: 'mock-player-006',
    playerName: 'AI_SCOUT',
    mode: 'secondary',
    answeredCount: 30,
    questionCount: 30,
    correctCount: 27,
    accuracy: 90,
    attemptStatus: 'completed',
    completedAt: '2026-01-02T10:00:00.000Z',
  },
  {
    playerId: 'mock-player-007',
    playerName: 'CLOUD_KID',
    mode: 'secondary',
    answeredCount: 20,
    questionCount: 30,
    correctCount: 15,
    accuracy: 75,
    attemptStatus: 'abandoned',
    completedAt: '2026-01-02T10:30:00.000Z',
  },
  {
    playerId: 'mock-player-008',
    playerName: 'CODE_COMET',
    mode: 'primary',
    answeredCount: 20,
    questionCount: 20,
    correctCount: 19,
    accuracy: 95,
    attemptStatus: 'completed',
    completedAt: '2026-01-02T11:00:00.000Z',
  },
  {
    playerId: 'mock-player-009',
    playerName: 'STACK_STAR',
    mode: 'primary',
    answeredCount: 10,
    questionCount: 20,
    correctCount: 9,
    accuracy: 90,
    attemptStatus: 'abandoned',
    completedAt: '2026-01-02T11:30:00.000Z',
  },
  {
    playerId: 'mock-player-010',
    playerName: 'DATA_DRAGON',
    mode: 'university',
    answeredCount: 30,
    questionCount: 50,
    correctCount: 29,
    accuracy: 96.67,
    attemptStatus: 'abandoned',
    completedAt: '2026-01-02T12:00:00.000Z',
  },
];

export async function getMockLeaderboard(mode: QuizMode, playerId?: string): Promise<LeaderboardEntry[]> {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  if (getMockScenario() === 'empty-questions') return [];

  const modeEntries = entries.filter((entry) => entry.mode === mode);
  const playerAttempt = playerId ? await getMockAttempt(playerId, mode) : null;

  if (!playerAttempt || playerAttempt.state.attemptStatus === 'active') {
    return sortLeaderboard(modeEntries);
  }

  const answeredCount = Object.keys(playerAttempt.state.answeredMap).length;
  const correctCount = playerAttempt.state.score;
  const currentPlayerEntry: LeaderboardEntry = {
    attemptId: playerAttempt.id,
    playerId: playerAttempt.playerId,
    playerName: playerAttempt.playerName,
    mode: playerAttempt.setup.mode,
    answeredCount,
    questionCount: playerAttempt.questionIds.length,
    correctCount,
    accuracy: answeredCount > 0 ? Number(((correctCount / answeredCount) * 100).toFixed(2)) : 0,
    attemptStatus: playerAttempt.state.attemptStatus,
    completedAt: playerAttempt.completedAt ?? playerAttempt.updatedAt,
  };

  return sortLeaderboard([...modeEntries, currentPlayerEntry]);
}
