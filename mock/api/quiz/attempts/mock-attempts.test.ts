import { describe, expect, it } from 'vitest';

import { submitAnswerByScenario } from '@/server/providers/mock-attempt.provider';

import { ATTEMPT_STATUS } from '@/features/quiz/quiz.constants';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import {
  createMockAttempt,
  discardMockAttempt,
  getMockAttempt,
  submitMockAnswer,
  updateMockAttempt,
} from '@/mock/api/quiz/attempts/mock-attempts';

const setup: QuizSetup = { mode: 'university', questionLimit: 2 };
const initialState: QuizState = {
  currentQIndex: 0,
  score: 0,
  streak: 0,
  mood: 'idle',
  answeredMap: new Map(),
  summaryVisible: false,
  attemptStatus: ATTEMPT_STATUS.ACTIVE,
};

describe('mock quiz attempts', () => {
  it('treats discarding a missing attempt as successful', async () => {
    await expect(discardMockAttempt('missing-attempt-id')).resolves.toBeUndefined();
  });

  it('fails only when saving an answer in the answer-failed scenario', async () => {
    const playerId = `test-answer-failed-${Date.now()}`;
    const created = await createMockAttempt(playerId, 'TEST_PLAYER', setup, ['mock-question-001'], initialState);

    await expect(submitAnswerByScenario('answer-failed', created.id, 'mock-question-001', 'mock-question-001-option-003')).rejects.toMatchObject({
      code: 'ANSWER_SAVE_FAILED',
      status: 503,
    });
  });

  it('creates, reads, updates, and discards an attempt', async () => {
    const playerId = `test-attempt-${Date.now()}`;

    const created = await createMockAttempt(playerId, 'TEST_PLAYER', setup, ['mock-question-001', 'mock-question-002'], initialState);
    expect(created).toMatchObject({ playerId, playerName: 'TEST_PLAYER', questionIds: ['mock-question-001', 'mock-question-002'] });

    await expect(getMockAttempt(playerId, setup.mode)).resolves.toMatchObject({ id: created.id });

    const answeredState: QuizState = {
      ...initialState,
      currentQIndex: 1,
      score: 999,
      answeredMap: new Map([[0, 'option-a']]),
      summaryVisible: true,
      attemptStatus: ATTEMPT_STATUS.ABANDONED,
    };
    const updated = await updateMockAttempt(created.id, answeredState);

    expect(updated.state.answeredMap).toEqual({});
    expect(updated.state.score).toBe(0);
    expect(updated.state.attemptStatus).toBe(ATTEMPT_STATUS.ABANDONED);
    const answered = await submitMockAnswer(created.id, 'mock-question-002', 'mock-question-002-option-003');
    expect(answered.isCorrect).toBe(true);
    expect(answered.attempt.state.answeredMap).toEqual({ '1': 'mock-question-002-option-003' });
    expect(answered.attempt.state.score).toBe(1);

    await discardMockAttempt(created.id);
    await expect(getMockAttempt(playerId, setup.mode)).resolves.toBeNull();
  });
});
