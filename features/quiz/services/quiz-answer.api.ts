import type { QuizAttemptRecord } from '../quiz-attempt.types';

const ANSWER_REQUEST_TIMEOUT_MS = 8000;

interface AnswerResponse {
  attempt: QuizAttemptRecord;
  isCorrect: boolean;
}

export async function submitQuizAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
): Promise<AnswerResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANSWER_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`/api/quiz/attempts/${encodeURIComponent(attemptId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedOptionId }),
      signal: controller.signal,
    });
    const payload = (await response.json()) as AnswerResponse & { error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? 'ไม่สามารถบันทึกคำตอบได้');
    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}
