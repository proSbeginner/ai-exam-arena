import type { AdminQuestionInput } from "@/features/admin/admin.types";
import type { ExamQuestion } from "@/features/quiz/quiz.types";
import { getDataSource } from "@/server/providers/data-source";
import { mockAdminQuestionProvider } from "@/server/providers/mock-admin-question.provider";
import { supabaseAdminQuestionProvider } from "@/server/providers/supabase-admin-question.provider";

export interface AdminQuestionProvider {
  listQuestions(limit?: number): Promise<ExamQuestion[]>;
  createQuestion(input: AdminQuestionInput): Promise<ExamQuestion>;
  updateQuestion(
    id: string,
    input: AdminQuestionInput,
  ): Promise<ExamQuestion | null>;
  deleteQuestion(id: string): Promise<boolean>;
}

export function getAdminQuestionProvider(): AdminQuestionProvider {
  return getDataSource() === "mock"
    ? mockAdminQuestionProvider
    : supabaseAdminQuestionProvider;
}
