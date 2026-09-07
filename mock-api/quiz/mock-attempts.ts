import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import { ATTEMPT_STATUS } from '@/features/quiz/quiz.constants';
import { simulateMockNetworkDelay, throwIfMockServiceUnavailable, MockApiError } from '../mock-api.config';

const attempts = new Map<string, QuizAttemptRecord>();

function getKey(playerId: string, mode: QuizSetup['mode']): string {
  return `${playerId}:${mode}`;
}

function serializeState(state: QuizState) {
  const answeredMap = state.answeredMap instanceof Map
    ? Object.fromEntries(state.answeredMap)
    : state.answeredMap;

  return { ...state, answeredMap };
}

export async function getMockAttempt(playerId: string, mode: QuizSetup['mode']) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();
  return attempts.get(getKey(playerId, mode)) ?? null;
}

export async function createMockAttempt(
  playerId: string,
  playerName: string,
  setup: QuizSetup,
  questionIds: string[],
  state: QuizState,
) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  const key = getKey(playerId, setup.mode);
  const existingAttempt = attempts.get(key);
  if (existingAttempt && existingAttempt.state.attemptStatus !== ATTEMPT_STATUS.COMPLETED) {
    throw new MockApiError('An active attempt already exists for this mode.', 409, 'ACTIVE_ATTEMPT_EXISTS');
  }

  const now = new Date().toISOString();
  const attempt: QuizAttemptRecord = {
    id: `mock-attempt-${crypto.randomUUID()}`,
    playerId,
    playerName,
    setup,
    questionIds,
    state: serializeState(state),
    startedAt: now,
    updatedAt: now,
  };
  attempts.set(key, attempt);
  return attempt;
}

export async function updateMockAttempt(attemptId: string, state: QuizState) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  const attempt = [...attempts.values()].find((item) => item.id === attemptId);
  if (!attempt) throw new MockApiError('Attempt not found.', 404, 'ATTEMPT_NOT_FOUND');

  const now = new Date().toISOString();
  attempt.state = serializeState(state);
  attempt.updatedAt = now;
  if (state.attemptStatus === ATTEMPT_STATUS.COMPLETED) attempt.completedAt = now;
  return attempt;
}

export async function discardMockAttempt(attemptId: string) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  const entry = [...attempts.entries()].find(([, attempt]) => attempt.id === attemptId);
  if (!entry) throw new MockApiError('Attempt not found.', 404, 'ATTEMPT_NOT_FOUND');
  attempts.delete(entry[0]);
}
