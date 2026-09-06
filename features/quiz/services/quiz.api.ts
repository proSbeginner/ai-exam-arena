import type { ExamQuestion } from '@/data/questions';

interface QuestionsResponse {
  questions: ExamQuestion[];
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export class QuizApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export async function getQuizQuestions(): Promise<ExamQuestion[]> {
  const response = await fetch('/api/quiz/questions', { cache: 'no-store' });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new QuizApiError(
      payload.error?.message ?? 'ไม่สามารถโหลดคำถามได้ในขณะนี้',
      payload.error?.code ?? 'UNKNOWN_ERROR',
    );
  }

  const payload = (await response.json()) as QuestionsResponse;
  return payload.questions;
}
