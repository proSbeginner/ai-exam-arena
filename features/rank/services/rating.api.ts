import type { PlayerRating } from '@/server/providers/rating.provider';

export async function applyAttemptRating(attemptId: string): Promise<PlayerRating> {
  const response = await fetch('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attemptId }),
  });
  const payload = (await response.json()) as { rating?: PlayerRating; error?: { message?: string } };
  if (!response.ok || !payload.rating) throw new Error(payload.error?.message ?? 'ไม่สามารถบันทึกระดับผู้เล่นได้');
  return payload.rating;
}
