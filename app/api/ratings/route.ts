import { getRatingProvider } from '@/server/providers/rating.provider';
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
