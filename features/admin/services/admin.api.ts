import type { AdminQuestionInput } from '../admin.types';
import type { ExamQuestion } from '@/features/quiz/quiz.types';

interface QuestionsResponse { questions?: ExamQuestion[]; question?: ExamQuestion; error?: { message?: string } }

function adminHeaders(email: string): HeadersInit {
  return { 'Content-Type': 'application/json', 'x-admin-email': email };
}

async function parseResponse(response: Response): Promise<QuestionsResponse> {
  const payload = (await response.json()) as QuestionsResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? 'ไม่สามารถดำเนินการกับคำถามได้');
  return payload;
}

export async function getAdminQuestions(email: string): Promise<ExamQuestion[]> {
  const response = await fetch('/api/admin/questions', { headers: adminHeaders(email), cache: 'no-store' });
  return (await parseResponse(response)).questions ?? [];
}

export async function createAdminQuestion(email: string, question: AdminQuestionInput): Promise<ExamQuestion> {
  const response = await fetch('/api/admin/questions', { method: 'POST', headers: adminHeaders(email), body: JSON.stringify(question) });
  return (await parseResponse(response)).question as ExamQuestion;
}

export async function updateAdminQuestion(email: string, id: string, question: AdminQuestionInput): Promise<ExamQuestion> {
  const response = await fetch(`/api/admin/questions/${encodeURIComponent(id)}`, { method: 'PATCH', headers: adminHeaders(email), body: JSON.stringify(question) });
  return (await parseResponse(response)).question as ExamQuestion;
}

export async function deleteAdminQuestion(email: string, id: string): Promise<void> {
  const response = await fetch(`/api/admin/questions/${encodeURIComponent(id)}`, { method: 'DELETE', headers: adminHeaders(email) });
  if (!response.ok) await parseResponse(response);
}
