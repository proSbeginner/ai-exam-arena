import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearQuizSetup,
  getStoredQuizSetup,
  saveQuizSetup,
} from '@/features/quiz/quiz-setup.hook';

describe('quiz setup storage snapshot', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns the same snapshot reference while storage is unchanged', () => {
    saveQuizSetup({ mode: 'university', questionLimit: 2 });

    const firstSnapshot = getStoredQuizSetup();
    const secondSnapshot = getStoredQuizSetup();

    expect(secondSnapshot).toBe(firstSnapshot);
  });

  it('refreshes the snapshot when storage changes', () => {
    saveQuizSetup({ mode: 'university', questionLimit: 2 });
    const firstSnapshot = getStoredQuizSetup();

    saveQuizSetup({ mode: 'university', questionLimit: null });
    const secondSnapshot = getStoredQuizSetup();

    expect(secondSnapshot).not.toBe(firstSnapshot);
    expect(secondSnapshot).toEqual({ mode: 'university', questionLimit: null });
  });

  it('returns a stable null snapshot after setup is cleared', () => {
    saveQuizSetup({ mode: 'university', questionLimit: 2 });
    clearQuizSetup();

    const firstSnapshot = getStoredQuizSetup();
    const secondSnapshot = getStoredQuizSetup();

    expect(firstSnapshot).toBeNull();
    expect(secondSnapshot).toBe(firstSnapshot);
  });
});
