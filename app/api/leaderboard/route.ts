import { MockApiError } from '@/mock-api/mock-api.config';
import { DataSourceConfigError } from '@/server/providers/data-source';
import { getLeaderboardProvider } from '@/server/providers/leaderboard.provider';
import type { QuizMode } from '@/features/quiz/quiz.types';

const modes = new Set<QuizMode>(['primary', 'secondary', 'university']);

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get('mode') as QuizMode | null;
  const playerId = new URL(request.url).searchParams.get('playerId') ?? undefined;

  if (!mode || !modes.has(mode)) {
    return Response.json(
      { error: { code: 'INVALID_MODE', message: 'A valid quiz mode is required.' } },
      { status: 400 },
    );
  }

  try {
    const leaderboard = await getLeaderboardProvider().getLeaderboard(mode, playerId);
    return Response.json({ leaderboard, mode });
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
      { error: { code: 'UNKNOWN_ERROR', message: 'The leaderboard service failed unexpectedly.' } },
      { status: 500 },
    );
  }
}
