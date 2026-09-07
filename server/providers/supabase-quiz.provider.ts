import type { ExamQuestion } from '@/features/quiz/quiz.types';
import type { DatabaseQuestionRow } from '@/server/database/types';
import { transformQuestion } from '@/server/database/transformers/question.transform';
import type { QuizProvider } from '@/server/providers/quiz.provider';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';

async function getSupabaseQuestions(): Promise<ExamQuestion[]> {
  const query = supabaseQuery({
    select: '*,question_options(*)',
    status: 'eq.published',
    order: 'created_at.asc',
  });
  const questions = await supabaseRequest<DatabaseQuestionRow[]>(`questions?${query}`);
  return questions.map(transformQuestion);
}

export const supabaseQuizProvider: QuizProvider = {
  getQuestions: getSupabaseQuestions,
};
