import { MockApiError } from '@/mock-api/mock-api.config';
import { DataSourceConfigError } from '@/server/providers/data-source';
import { getQuizProvider } from '@/server/providers/quiz.provider';

export async function GET() {
  try {
    const questions = await getQuizProvider().getQuestions();
    return Response.json({ questions });
  } catch (error) {
    if (error instanceof MockApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    if (error instanceof DataSourceConfigError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: 503 },
      );
    }

    return Response.json(
      { error: { code: 'UNKNOWN_ERROR', message: 'The quiz service failed unexpectedly.' } },
      { status: 500 },
    );
  }
}
