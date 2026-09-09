import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import { evaluateAnswer } from '@/features/quiz/quiz.logic';
import { getMockQuizQuestions } from '@/mock/api/quiz/mock-questions';
import { InvalidAttemptAnswerError } from '@/server/providers/attempt-errors';
import { applyClientAttemptUpdate } from '@/features/quiz/utils/attemptState';
import { ATTEMPT_STATUS } from '@/features/quiz/quiz.constants';
import { simulateMockNetworkDelay, throwIfMockAnswerFailed, throwIfMockServiceUnavailable, MockApiError } from '../config';

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

export async function getMockAttemptById(attemptId: string) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();
  return [...attempts.values()].find((attempt) => attempt.id === attemptId) ?? null;
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
  const trustedState = applyClientAttemptUpdate(attempt.state, serializeState(state), attempt.questionIds.length);
  attempt.state = trustedState;
  attempt.updatedAt = now;
  if (trustedState.attemptStatus === ATTEMPT_STATUS.COMPLETED) attempt.completedAt = now;
  return attempt;
}

export async function submitMockAnswer(attemptId: string, questionId: string, selectedOptionId: string) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();
  throwIfMockAnswerFailed();
  const attempt = [...attempts.values()].find((item) => item.id === attemptId);
  if (!attempt) throw new MockApiError("Attempt not found.", 404, "ATTEMPT_NOT_FOUND");
  if (attempt.state.attemptStatus === ATTEMPT_STATUS.COMPLETED) throw new InvalidAttemptAnswerError("Attempt is already completed.");
  const questionIndex = attempt.questionIds.indexOf(questionId);
  if (questionIndex !== attempt.state.currentQIndex) throw new InvalidAttemptAnswerError("Invalid question.");
  if (attempt.state.answeredMap[String(questionIndex)]) throw new InvalidAttemptAnswerError("Question has already been answered.");
  const question = (await getMockQuizQuestions()).find((item) => item.id === questionId);
  if (!question || !question.options.some((option) => option.id === selectedOptionId)) throw new InvalidAttemptAnswerError("Invalid answer.");
  const state: QuizState = { ...attempt.state, answeredMap: new Map(Object.entries(attempt.state.answeredMap).map(([index, answer]) => [Number(index), answer])) };
  const result = evaluateAnswer(state, question, selectedOptionId);
  const nextState: QuizState = { ...state, score: result.score, streak: result.streak, mood: result.mood, answeredMap: result.answeredMap };
  attempt.state = serializeState(nextState);
  attempt.updatedAt = new Date().toISOString();
  return { attempt, isCorrect: selectedOptionId === question.correctOptionId };
}

export async function discardMockAttempt(attemptId: string) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  const entry = [...attempts.entries()].find(([, attempt]) => attempt.id === attemptId);
  if (!entry) throw new MockApiError('Attempt not found.', 404, 'ATTEMPT_NOT_FOUND');
  attempts.delete(entry[0]);
}
