import { createMockAttempt, discardMockAttempt, getMockAttempt, updateMockAttempt, submitMockAnswer } from '@/mock-api/quiz/mock-attempts';
import type { AttemptProvider } from '@/server/providers/attempt.provider';

export const mockAttemptProvider: AttemptProvider = {
  getAttempt: getMockAttempt,
  createAttempt: createMockAttempt,
  updateAttempt: updateMockAttempt,
  submitAnswer: submitMockAnswer,
  discardAttempt: discardMockAttempt,
};
