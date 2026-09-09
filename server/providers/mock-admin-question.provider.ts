import type { ExamQuestion } from '@/features/quiz/quiz.types';
import { getMockScenario, simulateMockNetworkDelay, throwIfMockServiceUnavailable } from '@/mock/api/config';
import {
  createMockAdminQuestion,
  deleteMockAdminQuestion,
  listMockAdminQuestions,
  updateMockAdminQuestion,
} from '@/mock/api/quiz/mock-admin-questions';
import type { AdminQuestionProvider } from '@/server/providers/admin-question.provider';

async function prepareMockRequest(): Promise<void> {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();
}

export const mockAdminQuestionProvider: AdminQuestionProvider = {
  async listQuestions(): Promise<ExamQuestion[]> {
    await prepareMockRequest();
    return getMockScenario() === 'empty-questions' ? [] : listMockAdminQuestions();
  },

  async createQuestion(input) {
    await prepareMockRequest();
    return createMockAdminQuestion(input);
  },

  async updateQuestion(id, input) {
    await prepareMockRequest();
    return updateMockAdminQuestion(id, input);
  },

  async deleteQuestion(id) {
    await prepareMockRequest();
    return deleteMockAdminQuestion(id);
  },
};
