import { describe, expect, it } from 'vitest';

import { applyClientAttemptUpdate } from './attemptState';
import type { SerializedQuizState } from '../quiz-attempt.types';

function makeState(overrides: Partial<SerializedQuizState> = {}): SerializedQuizState {
  return {
    currentQIndex: 0,
    score: 0,
    streak: 0,
    mood: 'idle',
    answeredMap: {},
    gameOver: false,
    summaryVisible: false,
    attemptStatus: 'active',
    ...overrides,
  };
}

describe('applyClientAttemptUpdate', () => {
  it('keeps an in-progress attempt active', () => {
    const result = applyClientAttemptUpdate(makeState(), makeState({ currentQIndex: 1 }), 3);

    expect(result.attemptStatus).toBe('active');
    expect(result.summaryVisible).toBe(false);
    expect(result.gameOver).toBe(false);
    expect(result.currentQIndex).toBe(1);
  });

  it('marks an unfinished attempt abandoned when summary is requested', () => {
    const result = applyClientAttemptUpdate(makeState({ answeredMap: { '0': 'option-a' } }), makeState({ summaryVisible: true }), 3);

    expect(result.attemptStatus).toBe('abandoned');
    expect(result.summaryVisible).toBe(true);
    expect(result.gameOver).toBe(false);
  });

  it('marks a fully answered attempt completed when completion is requested', () => {
    const result = applyClientAttemptUpdate(
      makeState({ score: 2, answeredMap: { '0': 'option-a', '1': 'option-b' } }),
      makeState({ attemptStatus: 'completed', summaryVisible: true }),
      2,
    );

    expect(result.attemptStatus).toBe('completed');
    expect(result.summaryVisible).toBe(true);
    expect(result.gameOver).toBe(true);
    expect(result.mood).toBe('passed');
  });

  it('marks a completed attempt failed when its score is below the passing threshold', () => {
    const result = applyClientAttemptUpdate(
      makeState({ score: 1, answeredMap: { '0': 'option-a', '1': 'option-b' } }),
      makeState({ attemptStatus: 'completed', summaryVisible: true }),
      2,
    );

    expect(result.mood).toBe('failed');
  });

  it('clamps the requested question index to the available questions', () => {
    const result = applyClientAttemptUpdate(makeState(), makeState({ currentQIndex: 99 }), 3);

    expect(result.currentQIndex).toBe(2);
  });
});
