import { describe, expect, it } from 'vitest';

import { getPlayerRank, sortLeaderboard } from '@/features/leaderboard/leaderboard.logic';
import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';

const entry = (overrides: Partial<LeaderboardEntry>): LeaderboardEntry => ({
  playerId: 'player',
  playerName: 'PLAYER',
  mode: 'university',
  answeredCount: 1,
  questionCount: 1,
  correctCount: 1,
  accuracy: 100,
  attemptStatus: 'completed',
  completedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('leaderboard logic', () => {
  it('puts completed attempts before abandoned attempts', () => {
    const sorted = sortLeaderboard([
      entry({ playerId: 'abandoned', attemptStatus: 'abandoned', answeredCount: 100 }),
      entry({ playerId: 'completed', answeredCount: 1 }),
    ]);

    expect(sorted.map((item) => item.playerId)).toEqual(['completed', 'abandoned']);
  });

  it('sorts completed attempts by answered count, accuracy, correct count, then time', () => {
    const sorted = sortLeaderboard([
      entry({ playerId: 'accuracy', answeredCount: 5, accuracy: 100 }),
      entry({ playerId: 'volume', answeredCount: 10, accuracy: 50 }),
      entry({ playerId: 'correct', answeredCount: 10, accuracy: 50, correctCount: 6 }),
      entry({ playerId: 'time', answeredCount: 10, accuracy: 50, correctCount: 5, completedAt: '2026-01-02T00:00:00.000Z' }),
    ]);

    expect(sorted.map((item) => item.playerId)).toEqual(['correct', 'time', 'volume', 'accuracy']);
  });

  it('returns a one-based rank for a player', () => {
    const entries = [
      entry({ playerId: 'first', answeredCount: 10 }),
      entry({ playerId: 'second', answeredCount: 5 }),
    ];

    expect(getPlayerRank(entries, 'second')).toBe(2);
    expect(getPlayerRank(entries, 'missing')).toBeNull();
  });
});
