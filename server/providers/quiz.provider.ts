import type { ExamQuestion } from '@/data/questions';
import { getMockQuizQuestions } from '@/mock-api/quiz/mock-questions';

import { DataSourceConfigError, getDataSource } from './data-source';

export interface QuizProvider {
  getQuestions(): Promise<ExamQuestion[]>;
}

async function getSupabaseQuestions(): Promise<ExamQuestion[]> {
  throw new DataSourceConfigError(
    'The Supabase quiz provider is not configured yet.',
    'SUPABASE_PROVIDER_NOT_READY',
  );
}

export function getQuizProvider(): QuizProvider {
  return getDataSource() === 'mock'
    ? { getQuestions: getMockQuizQuestions }
    : { getQuestions: getSupabaseQuestions };
}
