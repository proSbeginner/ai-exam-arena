import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import { ATTEMPT_STATUS } from '@/features/quiz/quiz.constants';
import { evaluateAnswer } from '@/features/quiz/quiz.logic';
import { applyClientAttemptUpdate } from '@/features/quiz/utils/attemptState';
import { getMockQuizQuestions } from '@/mock/api/quiz/questions/mock-questions';
import { ApiError } from '@/server/errors/api-error';
import { InvalidAttemptAnswerError } from '@/server/providers/attempt-errors';

export interface MockAnswerResult {
  attempt: QuizAttemptRecord;
  isCorrect: boolean;
}

const attempts = new Map<string, QuizAttemptRecord>();

function getAttemptKey(playerId: string, mode: QuizSetup['mode']): string {
  return `${playerId}:${mode}`;
}

function findAttempt(attemptId: string): QuizAttemptRecord | undefined {
  return [...attempts.values()].find((attempt) => attempt.id === attemptId);
}

function serializeState(state: QuizState): QuizAttemptRecord['state'] {
  const answeredMap = state.answeredMap instanceof Map
    ? Object.fromEntries(state.answeredMap)
    : state.answeredMap;

  return { ...state, answeredMap };
}

export async function getMockAttemptById(attemptId: string): Promise<QuizAttemptRecord | null> {
  return findAttempt(attemptId) ?? null;
}

export async function getMockAttempt(
  playerId: string,
  mode: QuizSetup['mode'],
): Promise<QuizAttemptRecord | null> {
  return attempts.get(getAttemptKey(playerId, mode)) ?? null;
}

export async function createMockAttempt(
  playerId: string,
  playerName: string,
  setup: QuizSetup,
  questionIds: string[],
  state: QuizState,
): Promise<QuizAttemptRecord> {
  const key = getAttemptKey(playerId, setup.mode);
  const existingAttempt = attempts.get(key);

  if (existingAttempt && existingAttempt.state.attemptStatus !== ATTEMPT_STATUS.COMPLETED) {
    throw new ApiError(
      'An active attempt already exists for this mode.',
      409,
      'ACTIVE_ATTEMPT_EXISTS',
    );
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

export async function updateMockAttempt(
  attemptId: string,
  state: QuizState,
): Promise<QuizAttemptRecord> {
  const attempt = findAttempt(attemptId);
  if (!attempt) throw new ApiError('Attempt not found.', 404, 'ATTEMPT_NOT_FOUND');

  const trustedState = applyClientAttemptUpdate(
    attempt.state,
    serializeState(state),
    attempt.questionIds.length,
  );

  attempt.state = trustedState;
  attempt.updatedAt = new Date().toISOString();
  if (trustedState.attemptStatus === ATTEMPT_STATUS.COMPLETED) {
    attempt.completedAt = attempt.updatedAt;
  }

  return attempt;
}

export async function submitMockAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
): Promise<MockAnswerResult> {
  const attempt = findAttempt(attemptId);
  if (!attempt) throw new ApiError('Attempt not found.', 404, 'ATTEMPT_NOT_FOUND');
  if (attempt.state.attemptStatus === ATTEMPT_STATUS.COMPLETED) {
    throw new InvalidAttemptAnswerError('Attempt is already completed.');
  }

  const questionIndex = attempt.questionIds.indexOf(questionId);
  if (questionIndex !== attempt.state.currentQIndex) {
    throw new InvalidAttemptAnswerError('Invalid question.');
  }
  if (attempt.state.answeredMap[String(questionIndex)]) {
    throw new InvalidAttemptAnswerError('Question has already been answered.');
  }

  const question = (await getMockQuizQuestions()).find((item) => item.id === questionId);
  if (!question || !question.options.some((option) => option.id === selectedOptionId)) {
    throw new InvalidAttemptAnswerError('Invalid answer.');
  }

  const state: QuizState = {
    ...attempt.state,
    answeredMap: new Map(
      Object.entries(attempt.state.answeredMap).map(([index, answer]) => [Number(index), answer]),
    ),
  };
  const result = evaluateAnswer(state, question, selectedOptionId);
  const nextState: QuizState = {
    ...state,
    score: result.score,
    streak: result.streak,
    mood: result.mood,
    answeredMap: result.answeredMap,
  };

  attempt.state = serializeState(nextState);
  attempt.updatedAt = new Date().toISOString();

  return {
    attempt,
    isCorrect: selectedOptionId === question.correctOptionId,
  };
}

export async function discardMockAttempt(attemptId: string): Promise<void> {
  const entry = [...attempts.entries()].find(([, attempt]) => attempt.id === attemptId);
  if (entry) attempts.delete(entry[0]);
}
