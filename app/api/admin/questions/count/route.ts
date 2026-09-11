import { DataSourceConfigError } from '@/server/providers/data-source';
import { getAdminQuestionProvider } from '@/server/providers/admin-question.provider';

function authorize(request: Request): Response | null {
  const expected = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const received = request.headers.get('x-admin-email')?.trim().toLowerCase();
  if (!expected || !received || expected !== received) return Response.json({ error: { message: 'อีเมล Admin ไม่ถูกต้อง' } }, { status: 403 });
  return null;
}

export async function GET(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;
  try {
    const total = await getAdminQuestionProvider().countQuestions();
    return Response.json({ total });
  } catch (error) {
    if (error instanceof DataSourceConfigError) return Response.json({ error: { message: error.message } }, { status: 503 });
    return Response.json({ error: { message: 'ไม่สามารถนับคำถามได้' } }, { status: 500 });
  }
}
