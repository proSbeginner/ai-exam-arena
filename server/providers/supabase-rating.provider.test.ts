import { beforeEach, describe, expect, it, vi } from 'vitest';

const { supabaseRequest, supabaseQuery } = vi.hoisted(() => ({
  supabaseRequest: vi.fn(),
  supabaseQuery: vi.fn((params: Record<string, string>) => new URLSearchParams(params).toString()),
}));

vi.mock('@/supabase/client', () => ({ supabaseRequest, supabaseQuery }));

import { supabaseRatingProvider } from './supabase-rating.provider';

describe('supabase rating provider', () => {
  beforeEach(() => supabaseRequest.mockReset());

  it('reads a player rating and returns a default when no row exists', async () => {
    supabaseRequest.mockResolvedValueOnce([]);

    await expect(supabaseRatingProvider.getRating('player-1', 'university')).resolves.toEqual({
      playerId: 'player-1', mode: 'university', mmr: 0, answeredCount: 0, correctCount: 0, completedAttemptCount: 0,
    });
  });

  it('applies rating through one atomic RPC call', async () => {
    supabaseRequest
      .mockResolvedValueOnce([{ player_id: 'player-1', mode: 'university', mmr: 220, answered_count: 22, correct_count: 17, completed_attempt_count: 2 }]);

    const rating = await supabaseRatingProvider.applyAttemptRating({
      playerId: 'player-1', mode: 'university', attemptId: 'attempt-1', questionCount: 2,
      answeredCount: 2, correctCount: 2, optionCounts: [4, 4], maxStreak: 2,
    });

    expect(rating.mmr).toBe(220);
    expect(supabaseRequest).toHaveBeenCalledTimes(1);
    expect(supabaseRequest.mock.calls[0][0]).toBe('rpc/apply_attempt_rating');
    expect(supabaseRequest.mock.calls[0][1].body).toContain('attempt-1');
  });

  it('returns the current rating when the attempt event already exists', async () => {
    supabaseRequest.mockResolvedValueOnce([{ player_id: 'player-1', mode: 'primary', mmr: 60, answered_count: 2, correct_count: 2, completed_attempt_count: 1 }]);

    await supabaseRatingProvider.applyAttemptRating({
      playerId: 'player-1', mode: 'primary', attemptId: 'attempt-1', questionCount: 2,
      answeredCount: 2, correctCount: 2, optionCounts: [2, 2], maxStreak: 2,
    });

    expect(supabaseRequest).toHaveBeenCalledTimes(1);
  });
});
