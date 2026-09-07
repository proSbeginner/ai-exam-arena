import type { QuizMode } from '@/features/quiz/quiz.types';
import type { PlayerRating } from '@/server/providers/rating.provider';

export async function getPlayerRating(playerId: string, mode: QuizMode): Promise<PlayerRating> {
  const params = new URLSearchParams({ playerId, mode });
  const response = await fetch(`/api/ratings?${params.toString()}`, { cache: 'no-store' });
  const payload = (await response.json()) as { rating?: PlayerRating; error?: { message?: string } };
  if (!response.ok || !payload.rating) throw new Error(payload.error?.message ?? 'ไม่สามารถโหลดระดับผู้เล่นได้');
  return payload.rating;
}
