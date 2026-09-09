import { describe, expect, it, vi } from 'vitest';

import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';

import { resolveContinuePlayerQuiz } from './continue-player-quiz.logic';

const attempt = (overrides: Partial<QuizAttemptRecord> = {}): QuizAttemptRecord => ({
  id: 'attempt-1',
  playerId: 'player-1',
  playerName: 'PLAYER',
  setup: { mode: 'university', questionLimit: 1 },
  questionIds: ['question-1'],
  state: {
    currentQIndex: 0,
    score: 0,
    streak: 0,
    mood: 'idle',
    answeredMap: {},
    summaryVisible: false,
    attemptStatus: 'active',
  },
  startedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('resolveContinuePlayerQuiz', () => {
  it('does nothing without a player', async () => {
    const result = await resolveContinuePlayerQuiz({ playerId: null, mode: 'university', getQuizAttempt: vi.fn() });
    expect(result).toBeNull();
  });

  it('starts setup when the player has no attempt in the selected mode', async () => {
    const result = await resolveContinuePlayerQuiz({
      playerId: 'player-1', mode: 'secondary', getQuizAttempt: vi.fn().mockResolvedValue(null),
    });
    expect(result).toEqual({ type: 'redirect-to-setup', route: '/quiz-setup', setup: { mode: 'secondary', questionLimit: null } });
  });

  it('continues an existing attempt with its original mode and question count', async () => {
    const result = await resolveContinuePlayerQuiz({
      playerId: 'player-1', mode: 'university',
      getQuizAttempt: vi.fn().mockResolvedValue(attempt({ setup: { mode: 'primary', questionLimit: 1 } })),
    });
    expect(result).toEqual({ type: 'open-quiz', route: '/quiz', setup: { mode: 'primary', questionLimit: 1 } });
  });

  it('uses the leaderboard entry when the attempt lookup fails', async () => {
    const result = await resolveContinuePlayerQuiz({
      playerId: 'player-1', mode: 'secondary',
      currentAttempt: {
        attemptId: 'attempt-2', mode: 'secondary',
        questionCount: 3,
        attemptStatus: 'abandoned',
      },
      getQuizAttempt: vi.fn().mockRejectedValue(new Error('network error')),
    });
    expect(result).toEqual({ type: 'open-quiz', route: '/quiz', setup: { mode: 'secondary', questionLimit: 3 } });
  });

  it('opens a completed attempt in review mode', async () => {
    const completed = attempt({ state: { ...attempt().state, attemptStatus: 'completed' } });
    const result = await resolveContinuePlayerQuiz({
      playerId: 'player-1', mode: 'university', getQuizAttempt: vi.fn().mockResolvedValue(completed),
    });
    expect(result).toMatchObject({ type: 'open-quiz', setup: { mode: 'university', questionLimit: 1 }, reviewAttemptId: 'attempt-1' });
  });
});
