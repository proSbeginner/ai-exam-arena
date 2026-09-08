import type { RankName } from './rank.types';

export const RANK_TIER_MMR = 300;
export const RANK_STAR_MMR = 60;
export const IMMORTAL_MMR = RANK_TIER_MMR * 7;
export const MAX_RATING_CHANGE_PER_ATTEMPT = 300;
export const STREAK_MMR_BONUS_TIERS = [
  { minStreak: 3, bonus: 5 },
  { minStreak: 5, bonus: 10 },
  { minStreak: 7, bonus: 15 },
  { minStreak: 10, bonus: 20 },
  { minStreak: 15, bonus: 25 },
  { minStreak: 20, bonus: 30 },
  { minStreak: 30, bonus: 35 },
  { minStreak: 40, bonus: 40 },
  { minStreak: 50, bonus: 45 },
  { minStreak: 60, bonus: 50 },
  { minStreak: 70, bonus: 55 },
  { minStreak: 80, bonus: 60 },
  { minStreak: 90, bonus: 65 },
  { minStreak: 100, bonus: 75 },
] as const;

export const RANK_TIERS: ReadonlyArray<{ name: Exclude<RankName, 'Immortal'>; minMmr: number }> = [
  { name: 'Herald', minMmr: 0 },
  { name: 'Guardian', minMmr: 300 },
  { name: 'Crusader', minMmr: 600 },
  { name: 'Archon', minMmr: 900 },
  { name: 'Legend', minMmr: 1200 },
  { name: 'Ancient', minMmr: 1500 },
  { name: 'Divine', minMmr: 1800 },
];
