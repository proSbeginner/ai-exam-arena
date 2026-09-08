import { getRatingProvider } from '@/server/providers/rating.provider';
import { getAttemptProvider } from '@/server/providers/attempt.provider';
import { getQuizProvider } from '@/server/providers/quiz.provider';
import { QUIZ_MODE_OPTION_LIMITS } from '@/features/quiz/quiz.constants';
import type { QuizMode } from '@/features/quiz/quiz.types';

const modes = new Set<QuizMode>(['primary', 'secondary', 'university']);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const playerId = params.get('playerId');
  const mode = params.get('mode') as QuizMode | null;
  if (!playerId || !mode || !modes.has(mode)) {
    return Response.json({ error: { code: 'INVALID_RATING_QUERY', message: 'Player ID and mode are required.' } }, { status: 400 });
  }

  try {
    return Response.json({ rating: await getRatingProvider().getRating(playerId, mode) });
  } catch {
    return Response.json({ error: { code: 'RATING_SERVICE_ERROR', message: 'ไม่สามารถโหลดระดับผู้เล่นได้' } }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const body = (await request.json()) as { attemptId?: unknown };
  if (typeof body.attemptId !== "string") return Response.json({ error: { code: "INVALID_RATING_INPUT", message: "Attempt ID is required." } }, { status: 400 });

  try {
    const attempt = await getAttemptProvider().getAttemptById(body.attemptId);
    if (!attempt) return Response.json({ error: { code: "ATTEMPT_NOT_FOUND", message: "Attempt not found." } }, { status: 404 });
    if (attempt.state.attemptStatus !== "completed") return Response.json({ error: { code: "ATTEMPT_NOT_COMPLETED", message: "Only completed attempts can receive a rating." } }, { status: 409 });

    const questions = await getQuizProvider().getQuestions();
    const selectedQuestions = attempt.questionIds.map((id) => questions.find((question) => question.id === id));
    if (selectedQuestions.some((question) => !question)) throw new Error("Attempt questions are unavailable.");
    const optionCounts = selectedQuestions.map((question) => Math.min(question!.options.length, QUIZ_MODE_OPTION_LIMITS[attempt.setup.mode]));
    let currentStreak = 0;
    let maxStreak = 0;
    for (const [index, question] of selectedQuestions.entries()) {
      const selectedOptionId = attempt.state.answeredMap[String(index)];
      if (selectedOptionId && selectedOptionId === question!.correctOptionId) {
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    const rating = await getRatingProvider().applyAttemptRating({
      playerId: attempt.playerId,
      mode: attempt.setup.mode,
      questionCount: attempt.questionIds.length,
      answeredCount: Object.keys(attempt.state.answeredMap).length,
      correctCount: attempt.state.score,
      optionCounts,
      maxStreak,
      attemptId: attempt.id,
    });
    return Response.json({ rating });
  } catch {
    return Response.json({ error: { code: "RATING_SERVICE_ERROR", message: "ไม่สามารถบันทึกระดับผู้เล่นได้" } }, { status: 500 });
  }
}
