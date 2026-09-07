import { validateAdminQuestion } from '@/features/admin/admin.logic';
import type { AdminQuestionInput } from '@/features/admin/admin.types';
import { getMockScenario, simulateMockNetworkDelay, throwIfMockServiceUnavailable } from '@/mock-api/mock-api.config';
import { createMockAdminQuestion, listMockAdminQuestions } from '@/mock-api/quiz/mock-admin-questions';

function authorize(request: Request): Response | null {
  const expected = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const received = request.headers.get('x-admin-email')?.trim().toLowerCase();
  if (!expected || !received || expected !== received) return Response.json({ error: { message: 'อีเมล Admin ไม่ถูกต้อง' } }, { status: 403 });
  return null;
}

export async function GET(request: Request) {
  const denied = authorize(request); if (denied) return denied;
  await simulateMockNetworkDelay(); throwIfMockServiceUnavailable();
  return Response.json({ questions: getMockScenario() === 'empty-questions' ? [] : listMockAdminQuestions() });
}

export async function POST(request: Request) {
  const denied = authorize(request); if (denied) return denied;
  const input = (await request.json()) as AdminQuestionInput;
  const validationError = validateAdminQuestion(input);
  if (validationError) return Response.json({ error: { message: validationError } }, { status: 400 });
  await simulateMockNetworkDelay(); throwIfMockServiceUnavailable();
  return Response.json({ question: createMockAdminQuestion(input) }, { status: 201 });
}
