import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearQuizProgress: vi.fn(),
  clearQuizReviewAttemptId: vi.fn(),
  discardQuizAttempt: vi.fn(),
  saveQuizSetup: vi.fn(),
}));

vi.mock('@/features/quiz/services/quiz-attempt.api', () => ({
  discardQuizAttempt: mocks.discardQuizAttempt,
}));
vi.mock('@/features/quiz/quiz-progress.storage', () => ({
  clearQuizProgress: mocks.clearQuizProgress,
  clearQuizReviewAttemptId: mocks.clearQuizReviewAttemptId,
}));
vi.mock('@/features/quiz/quiz-setup.hook', () => ({
  saveQuizSetup: mocks.saveQuizSetup,
}));

import { restartQuizAttempt } from './quiz-restart';

describe('restartQuizAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.discardQuizAttempt.mockResolvedValue(undefined);
  });

  it('clears the old attempt, saves the setup, and navigates to setup', async () => {
    const navigate = vi.fn();

    await restartQuizAttempt({
      attemptId: 'attempt-1',
      mode: 'university',
      questionCount: 5,
      navigate,
    });

    expect(mocks.clearQuizProgress).toHaveBeenCalledOnce();
    expect(mocks.clearQuizReviewAttemptId).toHaveBeenCalledOnce();
    expect(mocks.discardQuizAttempt).toHaveBeenCalledWith('attempt-1');
    expect(mocks.saveQuizSetup).toHaveBeenCalledWith({ mode: 'university', questionLimit: 5 });
    expect(navigate).toHaveBeenCalledWith('/quiz/setup');
    expect(mocks.clearQuizProgress.mock.invocationCallOrder[0]).toBeLessThan(mocks.discardQuizAttempt.mock.invocationCallOrder[0]);
    expect(mocks.discardQuizAttempt.mock.invocationCallOrder[0]).toBeLessThan(mocks.saveQuizSetup.mock.invocationCallOrder[0]);
    expect(mocks.saveQuizSetup.mock.invocationCallOrder[0]).toBeLessThan(navigate.mock.invocationCallOrder[0]);
  });

  it('keeps the default question count when it is null', async () => {
    const navigate = vi.fn();

    await restartQuizAttempt({
      attemptId: undefined,
      mode: 'primary',
      questionCount: null,
      navigate,
    });

    expect(mocks.discardQuizAttempt).not.toHaveBeenCalled();
    expect(mocks.saveQuizSetup).toHaveBeenCalledWith({ mode: 'primary', questionLimit: null });
    expect(navigate).toHaveBeenCalledWith('/quiz/setup');
  });

  it('continues to setup even when deleting the old attempt fails', async () => {
    const navigate = vi.fn();
    mocks.discardQuizAttempt.mockRejectedValueOnce(new Error('delete failed'));

    await expect(restartQuizAttempt({
      attemptId: 'attempt-1',
      mode: 'secondary',
      questionCount: 2,
      navigate,
    })).resolves.toBeUndefined();

    expect(mocks.saveQuizSetup).toHaveBeenCalledWith({ mode: 'secondary', questionLimit: 2 });
    expect(navigate).toHaveBeenCalledWith('/quiz/setup');
  });
});
