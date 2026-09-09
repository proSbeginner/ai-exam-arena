import { describe, expect, it } from 'vitest';

import {
  getLeaderboardByScenario,
  type MockScenario,
} from '@/server/providers/mock-leaderboard.provider';

const scenarios: MockScenario[] = ['success', 'empty', 'unavailable', 'unknown-error'];

describe('mock leaderboard provider', () => {
  it('supports every leaderboard scenario', async () => {
    expect(scenarios).toHaveLength(4);
    await expect(getLeaderboardByScenario('success', 'university')).resolves.toMatchObject({
      entries: expect.any(Array),
      currentAttempt: null,
    });
    await expect(getLeaderboardByScenario('empty', 'university')).resolves.toEqual({
      entries: [],
      currentAttempt: null,
    });
  });

  it('returns a typed service error when leaderboard is unavailable', async () => {
    await expect(getLeaderboardByScenario('unavailable', 'university')).rejects.toMatchObject({
      code: 'LEADERBOARD_UNAVAILABLE',
      status: 503,
    });
  });

  it('returns an unexpected error for the unknown-error scenario', async () => {
    await expect(getLeaderboardByScenario('unknown-error', 'university')).rejects.toThrow(
      'The mock leaderboard failed unexpectedly.',
    );
  });
});
