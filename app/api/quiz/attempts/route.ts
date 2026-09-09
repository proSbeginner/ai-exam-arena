import { ApiError } from '@/server/errors/api-error';
import { getAttemptProvider } from '@/server/providers/attempt.provider';
import { DataSourceConfigError } from '@/server/providers/data-source';
import type { QuizMode, QuizSetup, QuizState } from '@/features/quiz/quiz.types';

const modes = new Set<QuizMode>(['primary', 'secondary', 'university']);

function isMode(value: unknown): value is QuizMode {
  return typeof value === 'string' && modes.has(value as QuizMode);
}

function errorResponse(error: unknown) {
  if (error instanceof ApiError) return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  if (error instanceof DataSourceConfigError) return Response.json({ error: { code: error.code, message: error.message } }, { status: 503 });
  return Response.json({ error: { code: 'UNKNOWN_ERROR', message: 'The attempt service failed unexpectedly.' } }, { status: 500 });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const playerId = params.get('playerId');
  const mode = params.get('mode');
  if (!playerId || !isMode(mode)) return Response.json({ error: { code: 'INVALID_ATTEMPT_QUERY', message: 'Player ID and mode are required.' } }, { status: 400 });

  try { return Response.json({ attempt: await getAttemptProvider().getAttempt(playerId, mode) }); } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { playerId?: unknown; playerName?: unknown; setup?: QuizSetup; questionIds?: unknown; state?: QuizState };
  if (typeof body.playerId !== 'string' || typeof body.playerName !== 'string' || !body.setup || !isMode(body.setup.mode) || !Array.isArray(body.questionIds) || !body.state) {
    return Response.json({ error: { code: 'INVALID_ATTEMPT_INPUT', message: 'Attempt data is incomplete.' } }, { status: 400 });
  }

  try {
    const attempt = await getAttemptProvider().createAttempt(body.playerId, body.playerName, body.setup, body.questionIds.filter((id): id is string => typeof id === 'string'), body.state);
    return Response.json({ attempt }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
