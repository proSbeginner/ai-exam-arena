import type { AdminQuestionInput } from '@/features/admin/admin.types';
import type { ExamQuestion } from '@/features/quiz/quiz.types';
import type { DatabaseQuestionRow } from '@/server/database/types';
import { transformQuestion } from '@/server/database/transformers/question.transform';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';

export interface AdminQuestionProvider {
  listQuestions(): Promise<ExamQuestion[]>;
  createQuestion(input: AdminQuestionInput): Promise<ExamQuestion>;
  updateQuestion(id: string, input: AdminQuestionInput): Promise<ExamQuestion | null>;
  deleteQuestion(id: string): Promise<boolean>;
}

function questionPayload(input: AdminQuestionInput) {
  return {
    mode: input.mode,
    labels: input.labels,
    english: input.english,
    thai_drama: input.thai_drama,
    fun_fact: input.funFact ?? null,
    source_name: input.source?.name ?? null,
    status: input.status,
  };
}

function optionPayload(questionId: string, input: AdminQuestionInput) {
  return input.options.map((option, displayOrder) => ({
    question_id: questionId,
    option_key: option.id,
    english: option.english,
    thai_drama: option.thai_drama,
    is_correct: option.id === input.correctOptionId,
    display_order: displayOrder,
  }));
}

async function insertOptions(questionId: string, input: AdminQuestionInput): Promise<void> {
  await supabaseRequest('question_options', {
    method: 'POST',
    body: JSON.stringify(optionPayload(questionId, input)),
  });
}

async function getQuestion(id: string): Promise<ExamQuestion | null> {
  const query = supabaseQuery({ select: '*,question_options(*)', id: `eq.${id}`, limit: '1' });
  const rows = await supabaseRequest<DatabaseQuestionRow[]>(`questions?${query}`);
  return rows[0] ? transformQuestion(rows[0]) : null;
}

export const supabaseAdminQuestionProvider: AdminQuestionProvider = {
  async listQuestions() {
    const query = supabaseQuery({ select: '*,question_options(*)', order: 'created_at.desc' });
    const rows = await supabaseRequest<DatabaseQuestionRow[]>(`questions?${query}`);
    return rows.map(transformQuestion);
  },

  async createQuestion(input) {
    const rows = await supabaseRequest<Array<{ id: string }>>('questions', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(questionPayload(input)),
    });
    const questionId = rows[0]?.id;
    if (!questionId) throw new Error('Supabase did not return the created question.');
    await insertOptions(questionId, input);
    return (await getQuestion(questionId)) as ExamQuestion;
  },

  async updateQuestion(id, input) {
    const existing = await getQuestion(id);
    if (!existing) return null;

    await supabaseRequest(`questions?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(questionPayload(input)),
    });
    await supabaseRequest(`question_options?question_id=eq.${id}`, { method: 'DELETE' });
    await insertOptions(id, input);
    return getQuestion(id);
  },

  async deleteQuestion(id) {
    const existing = await getQuestion(id);
    if (!existing) return false;
    await supabaseRequest(`questions?id=eq.${id}`, { method: 'DELETE' });
    return true;
  },
};
