import type { ExamQuestion } from "@/features/quiz/quiz.types";
import { ApiError } from "@/server/errors/api-error";
import {
  createMockAdminQuestion,
  deleteMockAdminQuestion,
  listMockAdminQuestions,
  updateMockAdminQuestion,
} from "@/mock/api/admin/questions/mock-admin-questions";
import type { AdminQuestionProvider } from "@/server/providers/admin-question.provider";

export type MockAdminQuestionScenario =
  | "success"
  | "empty"
  | "unavailable"
  | "unknown-error";

export const MOCK_ADMIN_QUESTION_SCENARIO: MockAdminQuestionScenario =
  "success";
export const MOCK_DELAY_MS = 500;

async function prepareMockRequest(
  scenario: MockAdminQuestionScenario,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (scenario === "unavailable") {
    throw new ApiError(
      "The mock admin question service is unavailable.",
      503,
      "ADMIN_QUESTION_UNAVAILABLE",
    );
  }

  if (scenario === "unknown-error") {
    throw new Error("The mock admin question service failed unexpectedly.");
  }
}

export async function listAdminQuestionsByScenario(
  scenario: MockAdminQuestionScenario,
  limit?: number,
): Promise<ExamQuestion[]> {
  await prepareMockRequest(scenario);
  return scenario === "empty" ? [] : listMockAdminQuestions(limit);
}

export const mockAdminQuestionProvider: AdminQuestionProvider = {
  listQuestions: (limit) =>
    listAdminQuestionsByScenario(MOCK_ADMIN_QUESTION_SCENARIO, limit),
  async createQuestion(input) {
    await prepareMockRequest(MOCK_ADMIN_QUESTION_SCENARIO);
    return createMockAdminQuestion(input);
  },
  async updateQuestion(id, input) {
    await prepareMockRequest(MOCK_ADMIN_QUESTION_SCENARIO);
    return updateMockAdminQuestion(id, input);
  },
  async deleteQuestion(id) {
    await prepareMockRequest(MOCK_ADMIN_QUESTION_SCENARIO);
    return deleteMockAdminQuestion(id);
  },
};
