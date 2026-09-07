import { validateAdminQuestion } from '@/features/admin/admin.logic';
import type { AdminQuestionInput } from '@/features/admin/admin.types';
import { DataSourceConfigError } from '@/server/providers/data-source';
import { getAdminQuestionProvider } from '@/server/providers/admin-question.provider';

function authorize(request: Request): Response | null {
  const expected = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const received = request.headers.get('x-admin-email')?.trim().toLowerCase();
  if (!expected || !received || expected !== received) return Response.json({ error: { message: 'อีเมล Admin ไม่ถูกต้อง' } }, { status: 403 });
  return null;
}

export async function PATCH(request: Request, context: RouteContext<'/api/admin/questions/[questionId]'>) {
  const denied = authorize(request); if (denied) return denied;
  const { questionId } = await context.params;
  const input = (await request.json()) as AdminQuestionInput;
  const validationError = validateAdminQuestion(input);
  if (validationError) return Response.json({ error: { message: validationError } }, { status: 400 });
  try {
    const question = await getAdminQuestionProvider().updateQuestion(questionId, input);
    return question ? Response.json({ question }) : Response.json({ error: { message: 'ไม่พบคำถามนี้' } }, { status: 404 });
  } catch (error) {
    if (error instanceof DataSourceConfigError) return Response.json({ error: { message: error.message } }, { status: 503 });
    return Response.json({ error: { message: 'ไม่สามารถแก้ไขคำถามได้' } }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext<'/api/admin/questions/[questionId]'>) {
  const denied = authorize(request); if (denied) return denied;
  const { questionId } = await context.params;
  try {
    const deleted = await getAdminQuestionProvider().deleteQuestion(questionId);
    return deleted ? new Response(null, { status: 204 }) : Response.json({ error: { message: 'ไม่พบคำถามนี้' } }, { status: 404 });
  } catch (error) {
    if (error instanceof DataSourceConfigError) return Response.json({ error: { message: error.message } }, { status: 503 });
    return Response.json({ error: { message: 'ไม่สามารถลบคำถามได้' } }, { status: 500 });
  }
}
