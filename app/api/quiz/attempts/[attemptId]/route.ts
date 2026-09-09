import { MockApiError } from '@/mock/api/config';
import { getAttemptProvider } from '@/server/providers/attempt.provider';
import { DataSourceConfigError } from '@/server/providers/data-source';
import type { QuizState } from '@/features/quiz/quiz.types';
import { InvalidAttemptAnswerError } from '@/server/providers/attempt-errors';

function errorResponse(error: unknown) {
  if (error instanceof MockApiError) return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  if (error instanceof DataSourceConfigError) return Response.json({ error: { code: error.code, message: error.message } }, { status: 503 });
  return Response.json({ error: { code: 'UNKNOWN_ERROR', message: 'The attempt service failed unexpectedly.' } }, { status: 500 });
}

export async function PATCH(request: Request, context: RouteContext<'/api/quiz/attempts/[attemptId]'>) {
  const { attemptId } = await context.params;
  const body = (await request.json()) as { state?: QuizState };
  if (!body.state) return Response.json({ error: { code: 'INVALID_ATTEMPT_INPUT', message: 'Attempt state is required.' } }, { status: 400 });
  try { return Response.json({ attempt: await getAttemptProvider().updateAttempt(attemptId, body.state) }); } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request, context: RouteContext<"/api/quiz/attempts/[attemptId]">) {
  const { attemptId } = await context.params;
  const body = (await request.json()) as { questionId?: unknown; selectedOptionId?: unknown };
  if (typeof body.questionId !== "string" || typeof body.selectedOptionId !== "string") return Response.json({ error: { code: "INVALID_ANSWER_INPUT", message: "Answer data is incomplete." } }, { status: 400 });
  try { return Response.json(await getAttemptProvider().submitAnswer(attemptId, body.questionId, body.selectedOptionId)); } catch (error) {
    if (error instanceof InvalidAttemptAnswerError) return Response.json({ error: { code: "INVALID_ANSWER", message: error.message } }, { status: 400 });
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext<'/api/quiz/attempts/[attemptId]'>) {
  const { attemptId } = await context.params;
  try { await getAttemptProvider().discardAttempt(attemptId); return new Response(null, { status: 204 }); } catch (error) { return errorResponse(error); }
}
