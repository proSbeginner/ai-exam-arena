import { describe, expect, it } from 'vitest';

import { calculateRatingChange, getRankFromMmr } from './rank.logic';

describe('rank from MMR', () => {
  it.each([
    [0, 'Herald', 1],
    [120, 'Herald', 3],
    [299, 'Herald', 5],
    [300, 'Guardian', 1],
    [1850, 'Divine', 1],
    [2099, 'Divine', 5],
    [2100, 'Immortal', 0],
  ])('converts %d MMR to %s star %d', (mmr, name, stars) => {
    expect(getRankFromMmr(mmr)).toMatchObject({ name, stars });
  });
});

describe('rating change', () => {
  it('gives no rating change at the random baseline for each mode', () => {
    expect(calculateRatingChange(1, 2, 2, [2, 2])).toBe(0);
    expect(calculateRatingChange(1, 3, 3, [3, 3, 3])).toBe(0);
    expect(calculateRatingChange(1, 4, 4, [4, 4, 4, 4])).toBe(0);
  });

  it('rewards harder modes more at the same accuracy', () => {
    expect(calculateRatingChange(1, 2, 2, [2, 2])).toBe(0);
    expect(calculateRatingChange(2, 4, 4, [4, 4, 4, 4])).toBeGreaterThan(0);
  });

  it('limits a single attempt rating change', () => {
    expect(calculateRatingChange(1000, 1000, 1000, Array(1000).fill(4))).toBe(300);
    expect(calculateRatingChange(0, 1000, 1000, Array(1000).fill(4))).toBe(-100);
  });
});
