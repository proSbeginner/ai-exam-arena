import type { ExamQuestion } from '@/features/quiz/quiz.types';
import type { QuizProvider } from '@/server/providers/quiz.provider';
import { ApiError } from '@/server/errors/api-error';
import { getMockQuizQuestions } from '@/mock/api/quiz/questions/mock-questions';

export type MockQuizScenario =
  | 'success'
  | 'empty'
  | 'unavailable'
  | 'unknown-error';

export const MOCK_QUIZ_SCENARIO: MockQuizScenario = 'success';
export const MOCK_DELAY_MS = 500;

export async function getQuizByScenario(
  scenario: MockQuizScenario,
): Promise<ExamQuestion[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  switch (scenario) {
    case 'success':
      return getMockQuizQuestions();

    case 'empty':
      return [];

    case 'unavailable':
      throw new ApiError(
        'The mock quiz service is unavailable.',
        503,
        'QUIZ_UNAVAILABLE',
      );

    case 'unknown-error':
      throw new Error('The mock quiz service failed unexpectedly.');
  }
}

export const mockQuizProvider: QuizProvider = {
  getQuestions: () => getQuizByScenario(MOCK_QUIZ_SCENARIO),
};
