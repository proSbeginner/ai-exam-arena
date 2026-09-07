import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearQuizProgress,
  getStoredQuizProgress,
  saveQuizProgress,
} from '@/features/quiz/quiz-progress.storage';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';

const setup: QuizSetup = { mode: 'university', questionLimit: 2 };
const questionIds = ['q-1', 'q-2'];

const state: QuizState = {
  currentQIndex: 1,
  score: 1,
  streak: 1,
  mood: 'correct',
  answeredMap: new Map([[0, 'option-a']]),
  gameOver: false,
  summaryVisible: false,
  attemptStatus: 'active',
};

describe('quiz progress storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('restores the saved quiz state for the same player and setup', () => {
    saveQuizProgress('PLAYER', setup, questionIds, state);

    expect(getStoredQuizProgress('PLAYER', setup, questionIds)).toEqual({
      questionIds,
      state,
    });
  });

  it('does not restore progress for a different quiz setup', () => {
    saveQuizProgress('PLAYER', setup, questionIds, state);

    expect(
      getStoredQuizProgress('PLAYER', { mode: 'university', questionLimit: null }, questionIds),
    ).toBeNull();
  });

  it('clears the saved quiz progress', () => {
    saveQuizProgress('PLAYER', setup, questionIds, state);
    clearQuizProgress();

    expect(getStoredQuizProgress('PLAYER', setup, questionIds)).toBeNull();
  });
});
