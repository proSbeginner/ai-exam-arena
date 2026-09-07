import { getMockQuizQuestions } from '@/mock-api/quiz/mock-questions';
import type { QuizProvider } from '@/server/providers/quiz.provider';

export const mockQuizProvider: QuizProvider = {
  getQuestions: getMockQuizQuestions,
};
