import { createMockAttempt, discardMockAttempt, getMockAttempt, updateMockAttempt } from '@/mock-api/quiz/mock-attempts';
import type { AttemptProvider } from '@/server/providers/attempt.provider';

export const mockAttemptProvider: AttemptProvider = {
  getAttempt: getMockAttempt,
  createAttempt: createMockAttempt,
  updateAttempt: updateMockAttempt,
  discardAttempt: discardMockAttempt,
};
