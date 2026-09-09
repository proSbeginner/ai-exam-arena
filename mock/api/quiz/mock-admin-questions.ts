import type { AdminQuestionInput } from '@/features/admin/admin.types';
import type { ExamQuestion } from '@/features/quiz/quiz.types';
import { questions } from './questions.mock';

export function listMockAdminQuestions(): ExamQuestion[] { return [...questions]; }

export function createMockAdminQuestion(input: AdminQuestionInput): ExamQuestion {
  const question: ExamQuestion = { ...input, id: `mock-question-${crypto.randomUUID()}` };
  questions.push(question);
  return question;
}

export function updateMockAdminQuestion(id: string, input: AdminQuestionInput): ExamQuestion | null {
  const index = questions.findIndex((question) => question.id === id);
  if (index < 0) return null;
  const question: ExamQuestion = { ...input, id };
  questions[index] = question;
  return question;
}

export function deleteMockAdminQuestion(id: string): boolean {
  const index = questions.findIndex((question) => question.id === id);
  if (index < 0) return false;
  questions.splice(index, 1);
  return true;
}
