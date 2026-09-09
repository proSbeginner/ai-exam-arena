import { ApiError } from "@/server/errors/api-error";
import {
  createMockAttempt,
  discardMockAttempt,
  getMockAttempt,
  getMockAttemptById,
  submitMockAnswer,
  updateMockAttempt,
} from "@/mock/api/quiz/attempts/mock-attempts";
import type {
  QuizMode,
  QuizSetup,
  QuizState,
} from "@/features/quiz/quiz.types";
import type { QuizAttemptRecord } from "@/features/quiz/quiz-attempt.types";
import type { AttemptProvider } from "@/server/providers/attempt.provider";

export type MockAttemptScenario =
  | "success"
  | "unavailable"
  | "answer-failed"
  | "unknown-error";

export const MOCK_ATTEMPT_SCENARIO: MockAttemptScenario = "answer-failed";
export const MOCK_DELAY_MS = 500;

type AttemptOperation = "read" | "write" | "answer";

async function prepareMockRequest(
  scenario: MockAttemptScenario,
  operation: AttemptOperation,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (scenario === "unavailable") {
    throw new ApiError(
      "The mock attempt service is unavailable.",
      503,
      "ATTEMPT_UNAVAILABLE",
    );
  }

  if (scenario === "unknown-error") {
    throw new Error("The mock attempt service failed unexpectedly.");
  }

  if (scenario === "answer-failed" && operation === "answer") {
    throw new ApiError(
      "The mock answer service failed.",
      503,
      "ANSWER_SAVE_FAILED",
    );
  }
}

export async function getAttemptByScenario(
  scenario: MockAttemptScenario,
  playerId: string,
  mode: QuizMode,
): Promise<QuizAttemptRecord | null> {
  await prepareMockRequest(scenario, "read");
  return getMockAttempt(playerId, mode);
}

export async function createAttemptByScenario(
  scenario: MockAttemptScenario,
  playerId: string,
  playerName: string,
  setup: QuizSetup,
  questionIds: string[],
  state: QuizState,
): Promise<QuizAttemptRecord> {
  await prepareMockRequest(scenario, "write");
  return createMockAttempt(playerId, playerName, setup, questionIds, state);
}

export async function submitAnswerByScenario(
  scenario: MockAttemptScenario,
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
) {
  await prepareMockRequest(scenario, "answer");
  return submitMockAnswer(attemptId, questionId, selectedOptionId);
}

export const mockAttemptProvider: AttemptProvider = {
  getAttempt: (playerId, mode) =>
    getAttemptByScenario(MOCK_ATTEMPT_SCENARIO, playerId, mode),
  getAttemptById: async (attemptId) => {
    await prepareMockRequest(MOCK_ATTEMPT_SCENARIO, "read");
    return getMockAttemptById(attemptId);
  },
  createAttempt: (playerId, playerName, setup, questionIds, state) =>
    createAttemptByScenario(
      MOCK_ATTEMPT_SCENARIO,
      playerId,
      playerName,
      setup,
      questionIds,
      state,
    ),
  updateAttempt: async (attemptId, state) => {
    await prepareMockRequest(MOCK_ATTEMPT_SCENARIO, "write");
    return updateMockAttempt(attemptId, state);
  },
  submitAnswer: (attemptId, questionId, selectedOptionId) =>
    submitAnswerByScenario(
      MOCK_ATTEMPT_SCENARIO,
      attemptId,
      questionId,
      selectedOptionId,
    ),
  discardAttempt: async (attemptId) => {
    await prepareMockRequest(MOCK_ATTEMPT_SCENARIO, "write");
    return discardMockAttempt(attemptId);
  },
};
