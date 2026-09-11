import type { AdminQuestionInput } from "@/features/admin/admin.types";
import type { ExamQuestion } from "@/features/quiz/quiz.types";
import type { DatabaseQuestionRow } from "@/server/database/types";
import { transformQuestion } from "@/server/database/transformers/question.transform";
import type { AdminQuestionProvider } from "@/server/providers/admin-question.provider";
import { supabaseCount, supabaseQuery, supabaseRequest } from "@/supabase/client";

function questionPayload(input: AdminQuestionInput) {
  return {
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

async function insertOptions(
  questionId: string,
  input: AdminQuestionInput,
): Promise<void> {
  await supabaseRequest("question_options", {
    method: "POST",
    body: JSON.stringify(optionPayload(questionId, input)),
  });
}

async function updateOptions(
  questionId: string,
  input: AdminQuestionInput,
): Promise<void> {
  const query = supabaseQuery({
    select: "id,option_key",
    question_id: `eq.${questionId}`,
  });
  const existingOptions = await supabaseRequest<
    Array<{ id: string; option_key: string }>
  >(`question_options?${query}`);
  const existingByKey = new Map(
    existingOptions.map((option) => [option.option_key, option]),
  );

  for (const [displayOrder, option] of input.options.entries()) {
    const payload = {
      option_key: option.id,
      english: option.english,
      thai_drama: option.thai_drama,
      is_correct: option.id === input.correctOptionId,
      display_order: displayOrder,
    };
    const existing = existingByKey.get(option.id);

    if (existing) {
      await supabaseRequest(`question_options?id=eq.${existing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } else {
      await supabaseRequest("question_options", {
        method: "POST",
        body: JSON.stringify({ question_id: questionId, ...payload }),
      });
    }
  }

  const inputKeys = new Set(input.options.map((option) => option.id));
  for (const option of existingOptions) {
    if (!inputKeys.has(option.option_key)) {
      await supabaseRequest(`question_options?id=eq.${option.id}`, {
        method: "DELETE",
      });
    }
  }
}

async function getQuestion(id: string): Promise<ExamQuestion | null> {
  const query = supabaseQuery({
    select: "*,question_options(*)",
    id: `eq.${id}`,
    limit: "1",
  });
  const rows = await supabaseRequest<DatabaseQuestionRow[]>(
    `questions?${query}`,
  );
  return rows[0] ? transformQuestion(rows[0]) : null;
}

async function countQuestions(): Promise<number> {
  return supabaseCount('questions?select=id');
}

export const supabaseAdminQuestionProvider: AdminQuestionProvider = {
  countQuestions,
  async listQuestions(limit) {
    const query = supabaseQuery({
      select: "*,question_options(*)",
      order: "created_at.desc",
      ...(limit === undefined ? {} : { limit: String(limit) }),
    });
    const rows = await supabaseRequest<DatabaseQuestionRow[]>(
      `questions?${query}`,
    );
    return rows.map(transformQuestion);
  },

  async createQuestion(input) {
    const rows = await supabaseRequest<Array<{ id: string }>>("questions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(questionPayload(input)),
    });
    const questionId = rows[0]?.id;
    if (!questionId)
      throw new Error("Supabase did not return the created question.");
    await insertOptions(questionId, input);
    return (await getQuestion(questionId)) as ExamQuestion;
  },

  async updateQuestion(id, input) {
    const existing = await getQuestion(id);
    if (!existing) return null;

    await supabaseRequest(`questions?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify(questionPayload(input)),
    });
    await updateOptions(id, input);
    return getQuestion(id);
  },

  async deleteQuestion(id) {
    const existing = await getQuestion(id);
    if (!existing) return false;
    await supabaseRequest(`questions?id=eq.${id}`, { method: "DELETE" });
    return true;
  },
};
