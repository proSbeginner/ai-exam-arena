import { getMockQuizQuestions } from '@/mock-api/quiz/mock-questions';
import type { ExamQuestion } from '@/features/quiz/quiz.types';
import type { DatabaseQuestionRow } from '@/server/database/types';
import { transformQuestion } from '@/server/database/transformers/question.transform';

import { getDataSource } from './data-source';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';

export interface QuizProvider {
  getQuestions(): Promise<ExamQuestion[]>;
}

async function getSupabaseQuestions(): Promise<ExamQuestion[]> {
  const query = supabaseQuery({
    select: '*,question_options(*)',
    status: 'eq.published',
    order: 'created_at.asc',
  });
  const questions = await supabaseRequest<DatabaseQuestionRow[]>(`questions?${query}`);
  return questions.map(transformQuestion);
}

export function getQuizProvider(): QuizProvider {
  return getDataSource() === 'mock'
    ? { getQuestions: getMockQuizQuestions }
    : { getQuestions: getSupabaseQuestions };
}
