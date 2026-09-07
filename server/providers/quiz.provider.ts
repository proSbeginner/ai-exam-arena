import type { ExamQuestion } from '@/features/quiz/quiz.types';
import { getDataSource } from './data-source';
import { mockQuizProvider } from '@/server/providers/mock-quiz.provider';
import { supabaseQuizProvider } from '@/server/providers/supabase-quiz.provider';

export interface QuizProvider {
  getQuestions(): Promise<ExamQuestion[]>;
}

export function getQuizProvider(): QuizProvider {
  return getDataSource() === 'mock' ? mockQuizProvider : supabaseQuizProvider;
}
