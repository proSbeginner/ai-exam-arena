import { MockApiError } from '@/mock-api/mock-api.config';
import { getMockQuizQuestions } from '@/mock-api/quiz/mock-questions';

export async function GET() {
  try {
    const questions = await getMockQuizQuestions();
    return Response.json({ questions });
  } catch (error) {
    if (error instanceof MockApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return Response.json(
      { error: { code: 'UNKNOWN_ERROR', message: 'The mock service failed unexpectedly.' } },
      { status: 500 },
    );
  }
}
