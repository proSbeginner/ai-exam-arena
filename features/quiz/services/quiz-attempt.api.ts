import type { QuizAttemptRecord } from '../quiz-attempt.types';
import type { QuizSetup, QuizState } from '../quiz.types';

interface AttemptResponse {
  attempt: QuizAttemptRecord | null;
}

async function parseResponse(response: Response): Promise<AttemptResponse> {
  if (!response.ok) {
    const payload = (await response.json()) as { error?: { message?: string } };
    throw new Error(payload.error?.message ?? 'ไม่สามารถบันทึกชุดข้อสอบได้');
  }
  return response.json() as Promise<AttemptResponse>;
}

export async function getQuizAttempt(playerId: string, mode: QuizSetup['mode']): Promise<QuizAttemptRecord | null> {
  const response = await fetch(`/api/quiz/attempts?playerId=${encodeURIComponent(playerId)}&mode=${mode}`, { cache: 'no-store' });
  return (await parseResponse(response)).attempt;
}

export async function createQuizAttempt(
  playerId: string,
  playerName: string,
  setup: QuizSetup,
  questionIds: string[],
  state: QuizState,
): Promise<QuizAttemptRecord> {
  const response = await fetch('/api/quiz/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, playerName, setup, questionIds, state }),
  });
  return (await parseResponse(response)).attempt as QuizAttemptRecord;
}

export async function updateQuizAttempt(attemptId: string, state: QuizState): Promise<QuizAttemptRecord> {
  const response = await fetch(`/api/quiz/attempts/${attemptId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
  return (await parseResponse(response)).attempt as QuizAttemptRecord;
}

export async function discardQuizAttempt(attemptId: string): Promise<void> {
  const response = await fetch(`/api/quiz/attempts/${attemptId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('ไม่สามารถยกเลิกชุดข้อสอบได้');
}
