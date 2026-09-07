import { afterEach, describe, expect, it } from 'vitest';

import { ATTEMPT_STATUS } from '@/features/quiz/quiz.constants';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import {
  createMockAttempt,
  discardMockAttempt,
  getMockAttempt,
  updateMockAttempt,
} from '@/mock-api/quiz/mock-attempts';

const originalScenario = process.env.MOCK_API_SCENARIO;
const originalDelay = process.env.MOCK_API_DELAY_MS;

const setup: QuizSetup = { mode: 'university', questionLimit: 2 };
const initialState: QuizState = {
  currentQIndex: 0,
  score: 0,
  streak: 0,
  mood: 'idle',
  answeredMap: new Map(),
  gameOver: false,
  summaryVisible: false,
  attemptStatus: ATTEMPT_STATUS.ACTIVE,
};

afterEach(() => {
  process.env.MOCK_API_SCENARIO = originalScenario;
  process.env.MOCK_API_DELAY_MS = originalDelay;
});

describe('mock quiz attempts', () => {
  it('creates, reads, updates, and discards an attempt', async () => {
    process.env.MOCK_API_SCENARIO = 'happy';
    process.env.MOCK_API_DELAY_MS = '0';
    const playerId = `test-attempt-${Date.now()}`;

    const created = await createMockAttempt(playerId, 'TEST_PLAYER', setup, ['q-1', 'q-2'], initialState);
    expect(created).toMatchObject({ playerId, playerName: 'TEST_PLAYER', questionIds: ['q-1', 'q-2'] });

    await expect(getMockAttempt(playerId, setup.mode)).resolves.toMatchObject({ id: created.id });

    const answeredState: QuizState = {
      ...initialState,
      currentQIndex: 1,
      score: 1,
      answeredMap: new Map([[0, 'option-a']]),
      attemptStatus: ATTEMPT_STATUS.ABANDONED,
    };
    const updated = await updateMockAttempt(created.id, answeredState);

    expect(updated.state.answeredMap).toEqual({ '0': 'option-a' });
    expect(updated.state.attemptStatus).toBe(ATTEMPT_STATUS.ABANDONED);

    await discardMockAttempt(created.id);
    await expect(getMockAttempt(playerId, setup.mode)).resolves.toBeNull();
  });
});
