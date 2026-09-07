import type { QuizAttemptRecord } from '../quiz-attempt.types';

interface AnswerResponse {
  attempt: QuizAttemptRecord;
  isCorrect: boolean;
}

export async function submitQuizAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
): Promise<AnswerResponse> {
  const response = await fetch(`/api/quiz/attempts/${encodeURIComponent(attemptId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, selectedOptionId }),
  });
  const payload = (await response.json()) as AnswerResponse & { error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? 'ไม่สามารถบันทึกคำตอบได้');
  return payload;
}
